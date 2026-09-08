const { app } = require('@/config/config')
const { Op } = require('sequelize')

class BaseService {
  hasCondition(condition) {
    return Boolean(condition) && Reflect.ownKeys(condition).length > 0
  }

  /**
   * 成功响应
   * @param {*} data 响应数据
   * @param {string} message 响应消息
   * @returns {object} 标准响应格式
   */
  success(data = null, message = '操作成功') {
    return {
      code: 200,
      message,
      data
    }
  }

  /**
   * 失败响应
   * @param {Error|object} error 错误对象
   * @throws {object} 抛出标准错误格式
   */
  fail(error) {
    if (app.debug) {
      console.error('Service error:', error)
    }
    if (error.code) throw error
    throw { code: error.code || 500, message: error.message || '操作失败' }
  }

  /**
   * 获取分页参数
   * @param {object} params 查询参数
   * @param {number} params.page 页码
   * @param {number} params.pageSize 每页数量
   * @returns {object} 分页参数
   */
  getPagination(params) {
    const page = Math.max(parseInt(params.page) || 1, 1)
    const pageSize = Math.min(Math.max(parseInt(params.pageSize) || 10, 1), 100)
    const offset = (page - 1) * pageSize

    return { page, pageSize, offset }
  }

  /**
   * 格式化分页响应
   * @param {Array} rows 数据列表
   * @param {number} count 总数量
   * @param {number} page 当前页码
   * @param {number} pageSize 每页数量
   * @returns {object} 格式化后的分页数据
   */
  formatPagination(rows, count, page, pageSize) {
    const totalPages = Math.ceil(count / pageSize)
    
    return {
      list: rows,
      pagination: {
        total: count,
        current: Number(page),
        pageSize: Number(pageSize),
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    }
  }

  /**
   * 构建搜索条件
   * @param {object} params 查询参数
   * @param {Array} searchFields 可搜索的字段
   * @returns {object} Sequelize where 条件
   */
  buildSearchCondition(params, searchFields = []) {
    const where = {}
    const { keyword } = params

    if (keyword && searchFields.length > 0) {
      where[Op.or] = searchFields.map(field => ({
        [field]: { [Op.like]: `%${keyword}%` }
      }))
    }

    return where
  }

  /**
   * 构建日期范围条件
   * @param {object} params 查询参数
   * @param {string} params.startDate 开始日期
   * @param {string} params.endDate 结束日期
   * @param {string} field 日期字段名，默认为 'created_at'
   * @returns {object} 日期范围条件
   */
  buildDateRangeCondition(params, field = 'created_at') {
    const { startDate, endDate } = params
    const condition = {}

    if (startDate && endDate) {
      condition[field] = {
        [Op.between]: [
          new Date(startDate + ' 00:00:00'),
          new Date(endDate + ' 23:59:59')
        ]
      }
    } else if (startDate) {
      condition[field] = { [Op.gte]: new Date(startDate + ' 00:00:00') }
    } else if (endDate) {
      condition[field] = { [Op.lte]: new Date(endDate + ' 23:59:59') }
    }

    return condition
  }

  /**
   * 构建通用查询条件
   * @param {object} params 查询参数
   * @returns {object} 查询条件
   */
  buildCommonConditions(params) {
    const where = {}
    
    // 状态查询
    if (params.status !== undefined && params.status !== '') {
      where.status = parseInt(params.status)
    }
    
    // 用户ID查询
    if (params.user_id !== undefined && params.user_id !== '') {
      where.user_id = parseInt(params.user_id)
    }
    
    // 类型查询
    if (params.type !== undefined && params.type !== '') {
      where.type = parseInt(params.type)
    }
    
    return where
  }

  /**
   * 标准化分页查询
   * @param {object} model Sequelize 模型
   * @param {object} options 查询选项
   * @param {object} options.params 查询参数
   * @param {object} options.where 额外的查询条件
   * @param {Array} options.searchFields 可搜索字段
   * @param {Array} options.include 关联查询
   * @param {Array} options.attributes 选择字段
   * @param {Array} options.order 排序条件
   * @returns {Promise<object>} 分页查询结果
   */
  async paginate(model, options = {}) {
    try {
      const {
        params = {},
        where = {},
        searchFields = [],
        include = [],
        attributes,
        order = [['id', 'DESC']]
      } = options

      const { page, pageSize, offset } = this.getPagination(params)

      const conditions = [
        where,
        this.buildCommonConditions(params),
        this.buildSearchCondition(params, searchFields),
        this.buildDateRangeCondition(params)
      ].filter(condition => this.hasCondition(condition))

      const finalWhere = conditions.length <= 1
        ? (conditions[0] || {})
        : { [Op.and]: conditions }

      const { count, rows } = await model.findAndCountAll({
        where: finalWhere,
        offset,
        limit: pageSize,
        order,
        include,
        attributes,
        distinct: include.length > 0
      })

      return this.success(
        this.formatPagination(rows, count, page, pageSize)
      )
    } catch (error) {
      return this.fail(error)
    }
  }

  /**
   * 验证必填字段
   * @param {object} data 数据对象
   * @param {Array} requiredFields 必填字段数组
   * @throws {object} 字段验证失败时抛出错误
   */
  validateRequiredFields(data, requiredFields) {
    const missingFields = requiredFields.filter(field => 
      data[field] === undefined || data[field] === null || data[field] === ''
    )

    if (missingFields.length > 0) {
      throw { 
        code: 400, 
        message: `缺少必填字段: ${missingFields.join(', ')}` 
      }
    }
  }

  /**
   * 过滤允许的字段
   * @param {object} data 原始数据
   * @param {Array} allowedFields 允许的字段
   * @returns {object} 过滤后的数据
   */
  filterAllowedFields(data, allowedFields) {
    const filtered = {}
    allowedFields.forEach(field => {
      if (data[field] !== undefined) {
        filtered[field] = data[field]
      }
    })
    return filtered
  }

  /**
   * 获取管理员可访问的所有用户ID（包括下级用户）
   * @param {number} adminId 管理员ID
   * @returns {Promise<Array>} 用户ID数组
   */
  async getAllAccessibleUserIds(adminId) {
    const User = require('@/admin/models/User')
    
    const directUsers = await User.findAll({
      where: { admin_id: adminId },
      attributes: ['id']
    })
    
    const allUserIds = new Set(directUsers.map(u => u.id))
    
    let currentLevelIds = directUsers.map(u => u.id)
    
    while (currentLevelIds.length > 0) {
      const nextLevelUsers = await User.findAll({
        where: { superior_id: currentLevelIds },
        attributes: ['id']
      })
      
      const nextLevelIds = nextLevelUsers.map(u => u.id)
      nextLevelIds.forEach(id => allUserIds.add(id))
      
      currentLevelIds = nextLevelIds
    }
    
    return Array.from(allUserIds)
  }

  /**
   * 构建基于用户权限的查询条件
   * @param {number} adminId 管理员ID
   * @param {number} roleId 角色ID
   * @param {object} additionalWhere 额外的查询条件
   * @returns {Promise<object>} 查询条件
   */
  async buildUserAccessWhereCondition(adminId, roleId, additionalWhere = {}) {
    const whereCondition = { ...additionalWhere }
    
    if (roleId !== 1) {
      const allAccessibleUserIds = await this.getAllAccessibleUserIds(adminId)
      
      whereCondition[Op.or] = [
        { '$user.admin_id$': adminId },
        { '$user.id$': allAccessibleUserIds }
      ]
    }
    
    return whereCondition
  }
}

module.exports = BaseService 
