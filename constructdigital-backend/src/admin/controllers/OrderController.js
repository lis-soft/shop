const BaseController = require('./BaseController')
const orderService = require('../services/OrderService')
const { getClientIp } = require('@/utils/getClientIp')

class OrderController extends BaseController {
  static resource = '订单'

  // 获取订单列表
  getList = async (req, res) => {
    try {
      const result = await orderService.getList(req.query, req.user.id, req.user.role)
      return this.success(req, res, result.data)
    } catch (error) {
      return this.fail(req, res, error)
    }
  }

  // 获取订单详情
  getDetail = async (req, res) => {
    try {
      const result = await orderService.getDetail(req.params.id, req.user.id, req.user.role)
      return this.success(req, res, result.data)
    } catch (error) {
      return this.fail(req, res, error)
    }
  }

  // 更新订单状态
  updateStatus = async (req, res) => {
    try {
      const { status } = req.body
      const result = await orderService.updateStatus(req.params.id, status, {
        admin_id: req.user.id,
        ip: getClientIp(req)
      }, req.user.role)
      return this.success(req, res, result.data, '订单状态更新成功')
    } catch (error) {
      return this.fail(req, res, error)
    }
  }

  // 手动完成订单
  completeOrder = async (req, res) => {
    try {
      const result = await orderService.completeOrder(req.params.id, {
        admin_id: req.user.id,
        ip: getClientIp(req)
      }, req.user.role)
      return this.success(req, res, result.data, '订单已完成')
    } catch (error) {
      return this.fail(req, res, error)
    }
  }

  // 删除订单
  delete = async (req, res) => {
    try {
      const result = await orderService.delete(req.params.id, {
        admin_id: req.user.id,
        ip: getClientIp(req)
      }, req.user.role)
      return this.success(req, res, null, '订单删除成功')
    } catch (error) {
      return this.fail(req, res, error)
    }
  }

  // 导出订单数据
  exportOrders = async (req, res) => {
    try {
      const result = await orderService.exportOrders(req.query, req.user.id, req.user.role)
      
      // 设置响应头
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
      res.setHeader('Content-Disposition', `attachment; filename=orders_${new Date().toISOString().slice(0, 10)}.xlsx`)
      
      return res.send(result.data)
    } catch (error) {
      return this.fail(req, res, error)
    }
  }
}

module.exports = new OrderController() 