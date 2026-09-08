const BaseController = require('./BaseController')
const homeService = require('../services/HomeService')
const { t } = require('../lang')

class HomeController extends BaseController {
  //获取财务记录
  getMoneyLogs = async (req, res) => {
    try {
      const result = await homeService.getMoneyLogs(req)
      this.success(req, res, result, '获取成功')
    } catch (error) {
      this.fail(req, res, error)
    }
  }

  //随机获取商品信息
  getRandomProducts = async (req, res) => {
    try {
      const result = await homeService.getRandomProducts(req)
      this.success(req, res, result, '获取商品信息成功')
    } catch (error) {
      this.fail(req, res, error)
    }
  }

  //获取VIP等级列表
  getVipLevels = async (req, res) => {
    try {
      const result = await homeService.getVipLevels(req)
      this.success(req, res, result, '获取VIP等级列表成功')
    } catch (error) {
      this.fail(req, res, error)
    }
  }

  //获取充值返现活动配置
  getEventConfig = async (req, res) => {
    try {
      const result = await homeService.getEventConfig(req)
      this.success(req, res, result, '获取活动配置成功')
    } catch (error) {
      this.fail(req, res, error)
    }
  }

  //获取合作商配置
  getPartnerConfig = async (req, res) => {
    try {
      const result = await homeService.getPartnerConfig(req)
      this.success(req, res, result, '获取合作商配置成功')
    } catch (error) {
      this.fail(req, res, error)
    }
  }

  //获取About Us配置
  getAboutConfig = async (req, res) => {
    try {
      const result = await homeService.getAboutConfig(req)
      this.success(req, res, result, '获取About Us配置成功')
    } catch (error) {
      this.fail(req, res, error)
    }
  }

  //获取网站配置
  getWebsiteConfig = async (req, res) => {
    try {
      const result = await homeService.getWebsiteConfig(req)
      this.success(req, res, result, '获取网站配置成功')
    } catch (error) {
      this.fail(req, res, error)
    }
  }
}

module.exports = new HomeController()
