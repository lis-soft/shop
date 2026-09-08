const BaseController = require('@/admin/controllers/BaseController')
const authService = require('@/admin/services/AuthService')
const { RESOURCES } = require('@/config/resources')
const { captcha: captchaConfig } = require('@/config/config')

class AuthController extends BaseController {
  static resource = RESOURCES.ADMIN
  constructor() {
    super()
  }

  login = async (req, res) => {
    try {
      const result = await authService.login(req)
      return this.success(req, res, result.data, result.message)
    } catch (error) {
      return this.fail(req, res, error)
    }
  }

  getUserInfo = async (req, res) => {
    try {
      const result = await authService.getUserInfo(req)
      return this.success(req, res, result.data, result.message)
    } catch (error) {
      return this.fail(req, res, error)
    }
  }

  logout = async (req, res) => {
    try {
      const result = await authService.logout(req)
      return this.success(req, res, null, result.message)
    } catch (error) {
      return this.fail(req, res, error)
    }
  }

  getUserMenus = async (req, res) => {
    try {
      const result = await authService.getUserMenus(req)
      return this.success(req, res, result.data, result.message)
    } catch (error) {
      return this.fail(req, res, error)
    }
  }
  
  // 生成验证码
  generateCaptcha = async (req, res) => {
    try {
      const result = await authService.generateCaptcha()
      const expiresAt = Date.now() + captchaConfig.expires
      
      authService.cacheCaptcha(result.data.key, result.data.text, expiresAt)

      Object.entries(captchaConfig.headers).forEach(([key, value]) => {
        res.setHeader(key, value)
      })
      res.setHeader('Captcha-Key', result.data.key)
      
      return res.send(result.data.svg)
    } catch (error) {
      return this.fail(req, res, error)
    }
  }
}

module.exports = new AuthController() 