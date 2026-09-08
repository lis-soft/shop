const BaseController = require('./BaseController')
const withdrawService = require('@/admin/services/WithdrawService')

class WithdrawController extends BaseController {

  getList = async (req, res) => {
    try {
      const result = await withdrawService.getList(req)
      return this.success(req, res, result.data)
    } catch (error) {
      return this.fail(req, res, error)
    }
  }

  getDetail = async (req, res) => {
    try {
      const result = await withdrawService.getDetail(req.params.id, req)
      return this.success(req, res, result.data)
    } catch (error) {
      return this.fail(req, res, error)
    }
  }

  approve = async (req, res) => {
    try {
      const result = await withdrawService.approve(req.params.id, req)
      return this.success(req, res, result.data, result.message)
    } catch (error) {
      return this.fail(req, res, error)
    }
  }

  reject = async (req, res) => {
    try {
      const result = await withdrawService.reject(req.params.id, req)
      return this.success(req, res, result.data, result.message)
    } catch (error) {
      return this.fail(req, res, error)
    }
  }

  confirmPayment = async (req, res) => {
    try {
      const result = await withdrawService.confirmPayment(req.params.id, req)
      return this.success(req, res, result.data, result.message)
    } catch (error) {
      return this.fail(req, res, error)
    }
  }
}

module.exports = new WithdrawController() 