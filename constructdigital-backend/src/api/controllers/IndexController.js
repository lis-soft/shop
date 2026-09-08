const BaseController = require('./BaseController')
const indexService = require('../services/IndexService')
const { getClientIp } = require('@/utils/getClientIp')
const { t } = require('../lang')
const Config = require('@/admin/models/Config')
const authService = require('@/admin/services/AuthService')
const { captcha: captchaConfig } = require('@/config/config')

class IndexController extends BaseController {
  //首页数据
  index = async (req, res) => {
    try {
      this.success(req, res, {
        title: 'API首页',
        version: '1.0.0'
      }, '请求成功')
    } catch (error) {
      this.fail(req, res, error)
    }
  }
  
  //用户注册
  register = async (req, res) => {
    try {
      const result = await indexService.register(req)
      this.success(req, res, result, '注册成功')
    } catch (error) {
      this.fail(req, res, error)
    }
  }
  
  //用户登录
  verifyCaptcha = async (req, res) => {
    try {
      const result = await indexService.verifyCaptcha(req)
      this.success(req, res, result, '楠岃瘉鎴愬姛')
    } catch (error) {
      this.fail(req, res, error)
    }
  }

  captcha = async (req, res) => {
    try {
      const result = await authService.generateCaptcha()
      const expiresAt = Date.now() + captchaConfig.expires

      authService.cacheCaptcha(result.data.key, result.data.text, expiresAt)

      Object.entries(captchaConfig.headers).forEach(([key, value]) => {
        res.setHeader(key, value)
      })
      res.setHeader('Captcha-Key', result.data.key)
      res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate')
      res.setHeader('Pragma', 'no-cache')
      res.setHeader('Expires', '0')
      res.setHeader('Surrogate-Control', 'no-store')

      return res.send(result.data.svg)
    } catch (error) {
      this.fail(req, res, error)
    }
  }

  login = async (req, res) => {
    try {
      const result = await indexService.login(req)
      this.success(req, res, result, '登录成功')
    } catch (error) {
      this.fail(req, res, error)
    }
  }
}

module.exports = new IndexController() 
