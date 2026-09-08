const { app } = require('@/config/config')
const sequelize = require('@/config/database')

class BaseService {
  success(data = null, message = '操作成功') {
    return {
      code: 200,
      message,
      data
    }
  }

  fail(error) {
    if (app.debug) {
      console.error('Service error:', error)
    }
    if (error.code) throw error
    throw { code: error.code || 500, message: error.message || '操作失败' }
  }

  getPagination(params) {
    const page = parseInt(params.page) || 1
    const pageSize = parseInt(params.pageSize) || 10
    const offset = (page - 1) * pageSize

    return { page, pageSize, offset }
  }

  formatPagination(rows, count, page, pageSize) {
    return {
      list: rows,
      pagination: {
        total: count,
        page: Number(page),
        pageSize: Number(pageSize)
      }
    }
  }

  async withTransaction(callback) {
    const transaction = await sequelize.transaction()
    
    try {
      const result = await callback(transaction)
      await transaction.commit()
      return result
    } catch (error) {
      await transaction.rollback()
      throw error
    }
  }
}

module.exports = BaseService 