const BaseService = require('@/admin/services/BaseService')
const AdminLog = require('@/admin/models/AdminLog')
const Admin = require('@/admin/models/Admin')
const { Op } = require('sequelize')

class LogService extends BaseService {
  async getList(req) {
    try {
      const { query: params } = req
      const where = {}
      
      if (params.adminId !== undefined && params.adminId !== '') {
        where.adminId = parseInt(params.adminId)
      }
      
      if (params.action) {
        where.action = { [Op.like]: `%${params.action}%` }
      }
      
      if (params.method) {
        where.method = params.method
      }
      
      if (params.path) {
        where.path = { [Op.like]: `%${params.path}%` }
      }
      
      if (params.status !== undefined && params.status !== '') {
        where.status = parseInt(params.status)
      }

      return await this.paginate(AdminLog, {
        params,
        where,
        include: [
          {
            model: Admin,
            as: 'admin',
            attributes: ['id', 'username']
          }
        ],
        order: [['createdAt', 'DESC']]
      })
    } catch (error) {
      return this.fail(error)
    }
  }

  async getDetail(req) {
    try {
      const { params: { id } } = req
      
      const log = await AdminLog.findByPk(id, {
        include: [
          {
            model: Admin,
            as: 'admin',
            attributes: ['id', 'username']
          }
        ]
      })
      
      if (!log) {
        throw new Error('操作日志不存在')
      }
      
      return this.success(log, '获取成功')
    } catch (error) {
      return this.fail(error)
    }
  }

  async clear(req) {
    try {
      await AdminLog.destroy({ where: {} })
      
      return this.success(null, '清空成功')
    } catch (error) {
      return this.fail(error)
    }
  }
}

module.exports = new LogService()