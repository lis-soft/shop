const BaseController = require('./BaseController')
const vipService = require('@/admin/services/VipService')

class VipController extends BaseController {
  getList = async (req, res) => {
    try {
      const result = await vipService.getList(req)
      return this.success(req, res, result.data, result.message)
    } catch (error) {
      return this.fail(req, res, error)
    }
  }

  getDetail = async (req, res) => {
    try {
      const result = await vipService.getDetail(req)
      return this.success(req, res, result.data, result.message)
    } catch (error) {
      return this.fail(req, res, error)
    }
  }

  create = async (req, res) => {
    try {
      const result = await vipService.create(req)
      return this.success(req, res, result.data, result.message)
    } catch (error) {
      return this.fail(req, res, error)
    }
  }

  update = async (req, res) => {
    try {
      const result = await vipService.update(req)
      return this.success(req, res, result.data, result.message)
    } catch (error) {
      return this.fail(req, res, error)
    }
  }

  delete = async (req, res) => {
    try {
      const result = await vipService.delete(req)
      return this.success(req, res, result.data, result.message)
    } catch (error) {
      return this.fail(req, res, error)
    }
  }

  toggleStatus = async (req, res) => {
    try {
      const result = await vipService.toggleStatus(req)
      return this.success(req, res, result.data, result.message)
    } catch (error) {
      return this.fail(req, res, error)
    }
  }
}

module.exports = new VipController()
