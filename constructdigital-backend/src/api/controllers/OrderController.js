const BaseController = require('./BaseController')
const orderService = require('@/api/services/OrderService')
const { t } = require('../lang')

class OrderController extends BaseController {
  //获取当前未完成订单
  getCurrentOrder = async (req, res) => {
    try {
      const result = await orderService.getCurrentOrder(req)
      this.success(req, res, result, '获取当前订单成功')
    } catch (error) {
      this.fail(req, res, error)
    }
  }

  //创建订单
  createOrder = async (req, res) => {
    try {
      const result = await orderService.createOrder(req)
      this.success(req, res, result, '订单创建成功')
    } catch (error) {
      this.fail(req, res, error)
    }
  }

  //用户提交订单，结算返还本金和佣金
  submitOrder = async (req, res) => {
    try {
      const result = await orderService.submitOrder(req)
      const message = result?.settlement_held ? '连单未结束，完成后统一返还' : '订单已完成'
      this.success(req, res, result, message)
    } catch (error) {
      this.fail(req, res, error)
    }
  }

  //订单统计
  getOrderStats = async (req, res) => {
    try {
      const result = await orderService.getOrderStats(req)
      this.success(req, res, result, '获取成功')
    } catch (error) {
      this.fail(req, res, error)
    }
  }

  //订单列表
  getOrderList = async (req, res) => {
    try {
      const result = await orderService.getOrderList(req)
      this.success(req, res, result, '获取成功')
    } catch (error) {
      this.fail(req, res, error)
    }
  }
}

module.exports = new OrderController() 
