const BaseController = require('@/admin/controllers/BaseController')
const adminGroupService = require('@/admin/services/AdminGroupService')
const { RESOURCES } = require('@/config/resources')

class AdminGroupController extends BaseController {
  static resource = RESOURCES.ADMIN
  constructor() {
    super()
  }

  getList = async (req, res) => {
    try {
      const result = await adminGroupService.getList(req)
      return this.success(req, res, result.data, result.message)
    } catch (error) {
      return this.fail(req, res, error)
    }
  }

  getDetail = async (req, res) => {
    try {
      const result = await adminGroupService.getDetail(req)
      return this.success(req, res, result.data, result.message)
    } catch (error) {
      return this.fail(req, res, error)
    }
  }

  create = async (req, res) => {
    try {
      const result = await adminGroupService.create(req)
      return this.success(req, res, result.data, result.message)
    } catch (error) {
      return this.fail(req, res, error)
    }
  }

  update = async (req, res) => {
    try {
      const result = await adminGroupService.update(req)
      return this.success(req, res, result.data, result.message)
    } catch (error) {
      return this.fail(req, res, error)
    }
  }

  delete = async (req, res) => {
    try {
      const result = await adminGroupService.delete(req)
      return this.success(req, res, null, result.message)
    } catch (error) {
      return this.fail(req, res, error)
    }
  }

  toggleStatus = async (req, res) => {
    try {
      const result = await adminGroupService.toggleStatus(req)
      return this.success(req, res, result.data, result.message)
    } catch (error) {
      return this.fail(req, res, error)
    }
  }

  getAllRules = async (req, res) => {
    try {
      const result = await adminGroupService.getAllRules(req)
      return this.success(req, res, result.data, result.message)
    } catch (error) {
      return this.fail(req, res, error)
    }
  }
}

module.exports = new AdminGroupController()
