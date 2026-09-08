const BaseService = require('@/admin/services/BaseService')
const jwt = require('jsonwebtoken')
const Admin = require('@/admin/models/Admin')
const AdminRule = require('@/admin/models/AdminRule')
const AdminGroup = require('@/admin/models/AdminGroup')
const { jwt: jwtConfig, captcha: captchaConfig } = require('@/config/config')
const svgCaptcha = require('svg-captcha')
const crypto = require('crypto')

class AuthService extends BaseService {
  constructor() {
    super()
    /**
     * 验证码缓存（跨站场景下不依赖 Cookie Session）
     * @type {Map<string, {text: string, expires: number}>}
     */
    this.captchaStore = new Map()
  }

  /**
   * 清理已过期验证码，防止缓存无限增长
   * @returns {void}
   */
  cleanupExpiredCaptchas() {
    const now = Date.now()
    this.captchaStore.forEach((value, key) => {
      if (!value || now > value.expires) {
        this.captchaStore.delete(key)
      }
    })
  }

  /**
   * 缓存验证码，支持跨站请求校验
   * @param {string} captchaKey 验证码唯一键
   * @param {string} captchaText 验证码文本
   * @param {number} expiresAt 过期时间戳
   * @returns {void}
   */
  cacheCaptcha(captchaKey, captchaText, expiresAt) {
    this.cleanupExpiredCaptchas()
    this.captchaStore.set(captchaKey, {
      text: String(captchaText).toLowerCase(),
      expires: expiresAt
    })
  }

  async login(req) {
    try {
      const { body: { username, password, captcha, captchaKey } } = req
      
      const captchaResult = await this.verifyCaptcha(captchaKey, captcha, req.session)
      if (captchaResult.code !== 200) {
        throw new Error(captchaResult.message)
      }

      const admin = await Admin.findOne({ 
        where: { username }
      })

      if (!admin) {
        throw new Error('用户名或密码错误')
      }

      const isValid = await admin.validatePassword(password)
      if (!isValid) {
        throw new Error('用户名或密码错误')
      }

      if (!admin.status) {
        throw new Error('账号已被禁用')
      }

      const token = jwt.sign(
        { id: admin.id }, 
        jwtConfig.secret,
        { expiresIn: jwtConfig.expires_in }
      )

      req.user = admin

      return this.success({ 
        token, 
        userInfo: admin.toJSON()
      }, '登录成功')
    } catch (error) {
      return this.fail(error)
    }
  }

  async verifyToken(token) {
    try {
      if (!token) {
        throw new Error('未登录')
      }

      const decoded = jwt.verify(token, jwtConfig.secret)
      const admin = await Admin.findByPk(decoded.id, {
        attributes: { exclude: ['password'] }
      })

      if (!admin) {
        throw new Error('用户不存在')
      }

      if (!admin.status) {
        throw new Error('账号已被禁用')
      }

      return admin
    } catch (error) {
      if (error.name === 'JsonWebTokenError') {
        throw {code:401, message:'无效的token'}
      }
      if (error.name === 'TokenExpiredError') {
        throw {code:401, message:'token已过期'}
      }
      throw {code:401, message:error.message}
    }
  }

  async getUserInfo(req) {
    try {
      const { user: { id: userId } } = req
      
      const admin = await Admin.findByPk(userId, {
        attributes: { exclude: ['password'] }
      })
      
      if (!admin) {
        throw new Error('用户不存在')
      }
      
      return this.success(admin, '获取成功')
    } catch (error) {
      return this.fail(error)
    }
  }

  async logout(req) {
    try {
      return this.success(null, '退出成功')
    } catch (error) {
      return this.fail(error)
    }
  }

  async getUserMenus(req) {
    try {
      const { user: { id: userId } } = req
      
      const admin = await Admin.findByPk(userId)
      if (!admin) {
        throw new Error('管理员不存在')
      }

      let allowedRuleIds = []

      if (admin.role_id) {
        const adminGroup = await AdminGroup.findByPk(admin.role_id)
        if (adminGroup && adminGroup.status === 1) {
          allowedRuleIds = adminGroup.getRulesArray()
        }
      }

      if (allowedRuleIds.length === 0) {
        return this.success([], '获取成功')
      }

      const menuRules = await AdminRule.findAll({
        where: {
          id: allowedRuleIds,
          status: 1,
          type: ['menu_dir', 'menu']
        },
        order: [['weigh', 'DESC'], ['id', 'ASC']]
      })

      const menuTree = this.buildMenuTree(menuRules)

      return this.success(menuTree, '获取成功')
    } catch (error) {
      return this.fail(error)
    }
  }

  buildMenuTree(menuRules) {
    const menuMap = new Map()
    const rootMenus = []

    menuRules.forEach(rule => {
      const menuItem = {
        id: rule.id,
        key: rule.name.split('.').pop(),
        title: rule.title,
        name: rule.name,
        path: rule.path,
        icon: rule.icon,
        type: rule.type,
        component: rule.component,
        children: []
      }
      menuMap.set(rule.id, menuItem)
      
      if (rule.pid === 0) {
        rootMenus.push(menuItem)
      }
    })

    menuRules.forEach(rule => {
      if (rule.pid !== 0) {
        const parent = menuMap.get(rule.pid)
        const child = menuMap.get(rule.id)
        if (parent && child) {
          parent.children.push(child)
        }
      }
    })

    return rootMenus
  }
  
  async generateCaptcha() {
    try {
      const captcha = svgCaptcha.create({
        size: captchaConfig.size,
        ignoreChars: captchaConfig.ignoreChars,
        noise: captchaConfig.noise,
        color: captchaConfig.color,
        background: captchaConfig.background
      })
      const key = crypto.randomBytes(16).toString('hex')

      return this.success({
        svg: captcha.data,
        text: captcha.text.toLowerCase(),
        key
      })
    } catch (error) {
      return this.fail(error)
    }
  }
  
  async verifyCaptcha(captchaKey, captchaText, session) {
    try {
      if (!captchaKey || !captchaText) {
        throw { code: 400, message: '验证码参数不完整' }
      }

      this.cleanupExpiredCaptchas()

      const normalizedCaptcha = String(captchaText).toLowerCase()
      const sessionCaptcha = session?.captcha
      const storeCaptcha = this.captchaStore.get(captchaKey)
      const targetCaptcha = (
        sessionCaptcha && sessionCaptcha.key === captchaKey ? sessionCaptcha : storeCaptcha
      )

      if (!targetCaptcha) {
        throw new Error('验证码已过期，请重新获取')
      }
      
      if (Date.now() > targetCaptcha.expires) {
        this.captchaStore.delete(captchaKey)
        if (session?.captcha?.key === captchaKey) {
          delete session.captcha
        }
        throw new Error('验证码已过期，请重新获取')
      }
      
      if (normalizedCaptcha !== targetCaptcha.text) {
        throw new Error('验证码错误')
      }
      
      this.captchaStore.delete(captchaKey)
      if (session?.captcha?.key === captchaKey) {
        delete session.captcha
      }
      
      return this.success()
    } catch (error) {
      return this.fail(error)
    }
  }

  async checkPermission(userId, ruleName) {
    try {
      const admin = await Admin.findByPk(userId)
      if (!admin) {
        return false
      }

      if (!admin.role_id) {
        return false
      }

      const adminGroup = await AdminGroup.findByPk(admin.role_id)
      if (!adminGroup || adminGroup.status !== 1) {
        return false
      }

      const rule = await AdminRule.findOne({
        where: { name: ruleName, status: 1 }
      })

      if (!rule) {
        return false
      }

      return adminGroup.hasRule(rule.id)
    } catch (error) {
      return false
    }
  }
}

module.exports = new AuthService() 