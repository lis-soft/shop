const BaseController = require('./BaseController')
const MoneyLogService = require('@/admin/services/MoneyLogService')

class MoneyLogController extends BaseController {
  static resource = '财务记录'

  getList = async (req, res) => {
    try {
      const result = await MoneyLogService.getList(req.query, req.user.id, req.user.role)
      return this.success(req, res, result.data)
    } catch (error) {
      return this.fail(req, res, error)
    }
  }

  getDetail = async (req, res) => {
    try {
      const { id } = req.params
      const result = await MoneyLogService.getDetail(id, req.user.id, req.user.role)
      return this.success(req, res, result.data)
    } catch (error) {
      return this.fail(req, res, error)
    }
  }

  getStats = async (req, res) => {
    try {
      const result = await MoneyLogService.getStats(req.query, req.user.id, req.user.role)
      return this.success(req, res, result.data)
    } catch (error) {
      return this.fail(req, res, error)
    }
  }
}

module.exports = new MoneyLogController() 