const BaseService = require('./BaseService')
const User = require('@/admin/models/User')
const UserToken = require('@/admin/models/UserToken')
const Config = require('@/admin/models/Config')
const MoneyLog = require('@/admin/models/MoneyLog')
const jwt = require('jsonwebtoken')
const { jwt: jwtConfig } = require('@/config/config')
const { Op } = require('sequelize')
const Wallet = require('@/admin/models/Wallet')
const sequelize = require('@/config/database')
const { getClientIp } = require('@/utils/getClientIp')
const authService = require('@/admin/services/AuthService')
const crypto = require('crypto')
const { normalizeLanguage } = require('@/api/lang')

class IndexService extends BaseService {
  constructor() {
    super()
    this.verifiedCaptchaStore = new Map()
  }

  cleanupVerifiedCaptchas() {
    const now = Date.now()
    this.verifiedCaptchaStore.forEach((value, key) => {
      if (!value || now > value.expires) {
        this.verifiedCaptchaStore.delete(key)
      }
    })
  }

  createVerifiedCaptchaToken() {
    const token = crypto.randomBytes(24).toString('hex')
    const expires = Date.now() + 5 * 60 * 1000

    this.cleanupVerifiedCaptchas()
    this.verifiedCaptchaStore.set(token, { expires })

    return token
  }

  consumeVerifiedCaptchaToken(token) {
    this.cleanupVerifiedCaptchas()

    if (!token) {
      throw { code: 400, message: 'Captcha verification required' }
    }

    const storedToken = this.verifiedCaptchaStore.get(token)
    if (!storedToken || Date.now() > storedToken.expires) {
      this.verifiedCaptchaStore.delete(token)
      throw { code: 400, message: 'Captcha verification expired, please verify again' }
    }

    this.verifiedCaptchaStore.delete(token)
  }

  async verifyCaptcha(req) {
    const { captcha, captchaKey } = req.body

    try {
      await authService.verifyCaptcha(captchaKey, captcha)
    } catch (error) {
      throw { code: 400, message: 'Invalid or expired captcha' }
    }

    return {
      captchaToken: this.createVerifiedCaptchaToken()
    }
  }

  async register(req) {
    const { username, login_pwd, inviteCode, phone, country } = req.body
    const defaultPayPassword = '000000'
    const clientIp = getClientIp(req)
    const userAgent = req.headers['user-agent']
    const language = normalizeLanguage(req.headers['accept-language'])

    if (!username) {
      throw new Error('用户名不能为空')
    }

    const existingUser = await User.findOne({
      where: { username }
    })

    if (existingUser) {
      throw new Error('用户名已存在')
    }

    if (!login_pwd) {
      throw new Error('登录密码不能为空')
    }
    if (login_pwd.length < 6) {
      throw new Error('密码长度不能少于6个字符')
    }
    if (!inviteCode) {
      throw new Error('邀请码不能为空')
    }

    const superior = await User.findOne({
      where: { invite_code: inviteCode }
    })

    if (!superior) {
      throw new Error('邀请码无效')
    }

    if (superior.is_invite === 0) {
      throw new Error('邀请码无效')
    }

    const userData = {
      username,
      phone: phone || null,
      login_pwd,
      pay_pwd: defaultPayPassword,
      superior_id: superior.id,
      invite_code: this.generateInviteCode(),
      admin_id: superior.admin_id,
      other: {
        register: {
          time: new Date().toISOString(),
          ip: clientIp,
          country: country || '',
          invite_code: inviteCode
        },
        device_info: this.parseUserAgent(userAgent)
      }
    }

    const transaction = await sequelize.transaction()

    try {
      const user = await User.create(userData, { transaction })

      const token = this.generateToken(user)

      const expiresAt = new Date()
      expiresAt.setSeconds(expiresAt.getSeconds() + this.parseExpiration(jwtConfig.expires_in))

      const refreshExpiresAt = new Date()
      refreshExpiresAt.setDate(refreshExpiresAt.getDate() + 30)

      const deviceId = 'web_' + Date.now() + '_' + Math.random().toString(36).substring(2, 15)
      const refreshToken = require('crypto').randomBytes(32).toString('hex')

      await UserToken.create({
        user_id: user.id,
        token: token,
        refresh_token: refreshToken,
        language,
        device_type: 'web',
        device_id: deviceId,
        user_agent: userAgent,
        ip_address: clientIp,
        expires_at: expiresAt,
        refresh_expires_at: refreshExpiresAt,
        login_time: new Date()
      }, { transaction })

      const registerBonusConfig = await Config.findOne({
        where: { key: 'register_bonus' },
        transaction
      })

      const registerBonus = parseFloat(registerBonusConfig?.value) || 0
      const beforeBalance = parseFloat(user.balance) || 0
      const afterBalance = beforeBalance + registerBonus

      await User.update(
        { balance: afterBalance },
        { where: { id: user.id }, transaction }
      )

      await MoneyLog.createLog({
        user_id: user.id,
        type: 5,
        amount: registerBonus,
        before_balance: beforeBalance,
        after_balance: afterBalance,
        remark: `注册赠送`,
        status: 1,
        ip: clientIp,
        transaction
      })

      await transaction.commit()

      const updatedUser = await User.findByPk(user.id, {
        attributes: { exclude: ['login_pwd', 'pay_pwd'] }
      })

      return {
        token,
        userInfo: updatedUser.toJSON()
      }
    } catch (error) {
      await transaction.rollback()
      throw error
    }
  }

  async login(req) {
    const { username, password } = req.body
    const clientIp = getClientIp(req)
    const userAgent = req.headers['user-agent']
    const language = normalizeLanguage(req.headers['accept-language'])

    if (!username) {
      throw new Error('用户名不能为空')
    }
    if (!password) {
      throw new Error('密码不能为空')
    }

    let user = await User.findOne({
      where: {
        [Op.or]: [
          { username },
          { phone: username }
        ]
      }
    })

    if (!user) {
      throw new Error('用户名或密码错误')
    }

    const isValid = await user.validatePassword(password)
    if (!isValid) {
      throw new Error('用户名或密码错误')
    }
    if (user.status === 0) {
      throw new Error('账号已被禁用')
    }

    const otherData = user.other ? JSON.parse(JSON.stringify(user.other)) : {}

    if (!otherData.last_login) {
      otherData.last_login = {}
    }

    otherData.last_login.time = new Date().toISOString()
    otherData.last_login.ip = clientIp
    otherData.device_info = this.parseUserAgent(userAgent)

    const token = this.generateToken(user)

    const expiresAt = new Date()
    expiresAt.setSeconds(expiresAt.getSeconds() + this.parseExpiration(jwtConfig.expires_in))

    const refreshExpiresAt = new Date()
    refreshExpiresAt.setDate(refreshExpiresAt.getDate() + 30)

    const deviceId = 'web_' + Date.now() + '_' + Math.random().toString(36).substring(2, 15)
    const refreshToken = require('crypto').randomBytes(32).toString('hex')

    const transaction = await sequelize.transaction()

    try {
      await User.update(
        { other: otherData },
        { where: { id: user.id }, transaction }
      )

      await UserToken.destroy({
        where: { user_id: user.id },
        transaction
      })

      await UserToken.create({
        user_id: user.id,
        token: token,
        refresh_token: refreshToken,
        language,
        device_type: 'web',
        device_id: deviceId,
        user_agent: userAgent,
        ip_address: clientIp,
        expires_at: expiresAt,
        refresh_expires_at: refreshExpiresAt,
        login_time: new Date()
      }, { transaction })

      await transaction.commit()

      user = await User.findByPk(user.id, {
        attributes: { exclude: ['login_pwd', 'pay_pwd'] }
      })

      return {
        token,
        userInfo: user.toJSON()
      }
    } catch (error) {
      await transaction.rollback()
      throw error
    }
  }

  generateToken(user) {
    return jwt.sign(
      { id: user.id },
      jwtConfig.secret,
      { expiresIn: jwtConfig.expires_in }
    )
  }

  generateInviteCode() {
    const numbers = '0123456789'
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'

    let code = ''

    for (let i = 0; i < 2; i++) {
      code += letters[Math.floor(Math.random() * letters.length)]
    }

    for (let i = 0; i < 4; i++) {
      code += numbers[Math.floor(Math.random() * numbers.length)]
    }

    return code.split('').sort(() => Math.random() - 0.5).join('')
  }

  parseExpiration(expiresIn) {
    const match = expiresIn.match(/^(\d+)([dhms])$/)
    if (!match) return 3600

    const value = parseInt(match[1])
    const unit = match[2]

    switch (unit) {
      case 'd': return value * 24 * 60 * 60
      case 'h': return value * 60 * 60
      case 'm': return value * 60
      case 's': return value
      default: return 3600
    }
  }

  parseUserAgent(userAgent) {
    const deviceInfo = {
      user_agent: userAgent,
      device_type: 'unknown',
      os: 'unknown',
      browser: 'unknown'
    }

    if (/mobile/i.test(userAgent)) deviceInfo.device_type = 'mobile'
    else if (/tablet/i.test(userAgent)) deviceInfo.device_type = 'tablet'
    else deviceInfo.device_type = 'desktop'

    if (/windows/i.test(userAgent)) deviceInfo.os = 'Windows'
    else if (/android/i.test(userAgent)) deviceInfo.os = 'Android'
    else if (/iphone|ipad|ipod/i.test(userAgent)) deviceInfo.os = 'iOS'
    else if (/mac/i.test(userAgent)) deviceInfo.os = 'macOS'
    else if (/linux/i.test(userAgent)) deviceInfo.os = 'Linux'

    if (/chrome/i.test(userAgent)) deviceInfo.browser = 'Chrome'
    else if (/firefox/i.test(userAgent)) deviceInfo.browser = 'Firefox'
    else if (/safari/i.test(userAgent)) deviceInfo.browser = 'Safari'
    else if (/edge/i.test(userAgent)) deviceInfo.browser = 'Edge'
    else if (/opera/i.test(userAgent)) deviceInfo.browser = 'Opera'
    else if (/msie|trident/i.test(userAgent)) deviceInfo.browser = 'Internet Explorer'

    return deviceInfo
  }
}

module.exports = new IndexService() 
