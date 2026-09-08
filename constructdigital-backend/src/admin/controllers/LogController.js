const BaseController = require('@/admin/controllers/BaseController')
const logService = require('@/admin/services/LogService')
const { RESOURCES } = require('@/config/resources')

class LogController extends BaseController {
  static resource = RESOURCES.LOG

  getList = async (req, res) => {
    try {
      const result = await logService.getList(req)
      return this.success(req, res, result.data, result.message)
    } catch (error) {
      return this.fail(req, res, error)
    }
  }

  getDetail = async (req, res) => {
    try {
      const result = await logService.getDetail(req)
      return this.success(req, res, result.data, result.message)
    } catch (error) {
      return this.fail(req, res, error)
    }
  }

  clear = async (req, res) => {
    try {
      const result = await logService.clear(req)
      return this.success(req, res, result.data, result.message)
    } catch (error) {
      return this.fail(req, res, error)
    }
  }
}

module.exports = new LogController() 