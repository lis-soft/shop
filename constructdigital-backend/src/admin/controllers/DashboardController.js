const BaseController = require('@/admin/controllers/BaseController')
const DashboardService = require('@/admin/services/DashboardService')
const { RESOURCES } = require('@/config/resources')

class DashboardController extends BaseController {
  static resource = RESOURCES.DASHBOARD

  // 获取仪表盘统计数据
  getDashboardStats = async (req, res) => {
    try {
      const { id: adminId, role } = req.user
      const stats = await DashboardService.getDashboardStats(adminId, role)
      return this.success(req, res, stats, '获取仪表盘数据成功')
    } catch (error) {
      console.error('获取仪表盘数据失败:', error)
      return this.fail(req, res, error)
    }
  }

  // 获取最近注册的用户
  getRecentUsers = async (req, res) => {
    try {
      const { limit } = req.query
      const { id: adminId, role } = req.user
      const data = await DashboardService.getRecentUsers(parseInt(limit) || 10, adminId, role)
      return this.success(req, res, data, '获取最近注册用户成功')
    } catch (error) {
      console.error('获取最近注册用户失败:', error)
      return this.fail(req, res, error)
    }
  }
}

module.exports = new DashboardController() 