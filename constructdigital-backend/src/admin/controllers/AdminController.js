const BaseController = require('@/admin/controllers/BaseController')
const adminService = require('@/admin/services/AdminService')
const { RESOURCES } = require('@/config/resources')

class AdminController extends BaseController {
  static resource = RESOURCES.ADMIN

  getList = async (req, res) => {
    try {
      const result = await adminService.getList(req)
      return this.success(req, res, result.data, result.message)
    } catch (error) {
      return this.fail(req, res, error)
    }
  }

  create = async (req, res) => {
    try {
      const result = await adminService.create(req)
      return this.success(req, res, result.data, result.message)
    } catch (error) {
      return this.fail(req, res, error)
    }
  }

  update = async (req, res) => {
    try {
      const result = await adminService.update(req)
      return this.success(req, res, result.data, result.message)
    } catch (error) {
      return this.fail(req, res, error)
    }
  }

  delete = async (req, res) => {
    try {
      const result = await adminService.delete(req)
      return this.success(req, res, result.data, result.message)
    } catch (error) {
      return this.fail(req, res, error)
    }
  }

  toggleStatus = async (req, res) => {
    try {
      const result = await adminService.toggleStatus(req)
      return this.success(req, res, result.data, result.message)
    } catch (error) {
      return this.fail(req, res, error)
    }
  }

  // 获取管理员个人信息
  getProfile = async (req, res) => {
    try {
      const result = await adminService.getProfile(req.user.id)
      return this.success(req, res, result.data, result.message)
    } catch (error) {
      return this.fail(req, res, error)
    }
  }

  // 更新管理员个人信息
  updateProfile = async (req, res) => {
    try {
      const result = await adminService.updateProfile(req.user.id, req.body)
      return this.success(req, res, result.data, result.message)
    } catch (error) {
      return this.fail(req, res, error)
    }
  }

  // 更新管理员头像
  updateAvatar = async (req, res) => {
    try {
      const result = await adminService.updateAvatar(req.user.id, req.file)
      return this.success(req, res, result.data, result.message)
    } catch (error) {
      return this.fail(req, res, error)
    }
  }

  // 更新管理员密码
  updatePassword = async (req, res) => {
    try {
      const result = await adminService.updatePassword(req.user.id, req.body)
      return this.success(req, res, result.data, result.message)
    } catch (error) {
      return this.fail(req, res, error)
    }
  }
}

module.exports = new AdminController() 