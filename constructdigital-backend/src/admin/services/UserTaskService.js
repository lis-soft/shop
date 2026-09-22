const BaseService = require('./BaseService')
const UserTask = require('../models/UserTask')
const User = require('../models/User')
const { Op } = require('sequelize')
const sequelize = require('@/config/database')
const apiOrderService = require('@/api/services/OrderService')

function wrapLuckyOrder(val) {
  if (!val) return null
  if (typeof val === 'string' && val.trim().startsWith('[')) {
    try {
      const parsed = JSON.parse(val)
      return Array.isArray(parsed) && parsed.length === 0 ? null : val
    } catch (e) {
      return val
    }
  }
  if (typeof val === 'string' && val.trim()) return JSON.stringify([JSON.parse(val)])
  return null
}

function isEmptyLuckyOrder(val) {
  if (val === null || val === '') return true
  if (typeof val === 'string' && val.trim() === '') return true
  if (typeof val === 'string' && val.trim().startsWith('[')) {
    try {
      const parsed = JSON.parse(val)
      return Array.isArray(parsed) && parsed.length === 0
    } catch (e) {
      return false
    }
  }
  return false
}

function parseOrderList(val) {
  if (!val) return []
  if (Array.isArray(val)) return val.flat().filter(Boolean)

  if (typeof val === 'object') return [val]
  if (typeof val !== 'string' || !val.trim()) return []

  const trimmed = val.trim()
  let parsed = []

  if (trimmed.startsWith('[')) {
    parsed = JSON.parse(trimmed)
  } else if (trimmed.includes('},{')) {
    parsed = trimmed.split(/},\s*{/).map((str, idx, arr) => {
      if (idx === 0) return JSON.parse(str + '}')
      if (idx === arr.length - 1) return JSON.parse('{' + str)
      return JSON.parse('{' + str + '}')
    })
  } else {
    parsed = JSON.parse(trimmed)
  }

  if (Array.isArray(parsed) && parsed.length > 0 && Array.isArray(parsed[0])) {
    parsed = parsed.flat()
  }

  return (Array.isArray(parsed) ? parsed : [parsed]).filter(Boolean)
}

function normalizeOrderList(orders, label) {
  return orders.map(order => {
    const startAfter = Number(order.start_after)
    if (!Number.isInteger(startAfter) || startAfter < 0) {
      throw { code: 400, message: `${label}开始序号必须为大于等于 0 的整数` }
    }

    return {
      ...order,
      start_after: startAfter
    }
  })
}

function findDuplicateStartAfter(orders) {
  const seen = new Set()

  for (const order of orders) {
    const startAfter = Number(order.start_after)
    if (seen.has(startAfter)) {
      return startAfter
    }
    seen.add(startAfter)
  }

  return null
}

function mergeOrderList(existingOrders, incomingOrders, label) {
  const normalizedExisting = normalizeOrderList(existingOrders, `已有${label}`)
  const normalizedIncoming = normalizeOrderList(incomingOrders, `新增${label}`)

  const duplicatedIncomingStartAfter = findDuplicateStartAfter(normalizedIncoming)
  if (duplicatedIncomingStartAfter !== null) {
    throw { code: 400, message: `${label}开始序号 ${duplicatedIncomingStartAfter} 重复，不能重复派单` }
  }

  const existingStartAfters = new Set(normalizedExisting.map(order => Number(order.start_after)))
  const conflictedOrder = normalizedIncoming.find(order => existingStartAfters.has(Number(order.start_after)))
  if (conflictedOrder) {
    throw { code: 400, message: `${label}开始序号 ${conflictedOrder.start_after} 已存在，不能重复派单` }
  }

  return [...normalizedExisting, ...normalizedIncoming]
    .sort((a, b) => Number(a.start_after || 0) - Number(b.start_after || 0))
}

class UserTaskService extends BaseService {
  async getUserTasks(params = {}) {
    try {
      return await this.paginate(UserTask, {
        params,
        order: [['id', 'DESC']]
      })
    } catch (error) {
      return this.fail(error)
    }
  }
  
  async getUserTask(userId) {
    try {
      const userTask = await UserTask.findOne({
        where: { user_id: userId }
      })
      if (!userTask) throw new Error('用户任务不存在')
      
      let result = userTask.toJSON ? userTask.toJSON() : userTask
      if (result.lucky_order) {
        let luckyArr = []
        try {
          if (result.lucky_order.trim().startsWith('[')) {
            luckyArr = JSON.parse(result.lucky_order)
          } else if (result.lucky_order.includes('},{')) {
            luckyArr = result.lucky_order.split(/},\s*{/).map((str, idx, arr) => {
              if (idx === 0) return JSON.parse(str + '}')
              if (idx === arr.length - 1) return JSON.parse('{' + str)
              return JSON.parse('{' + str + '}')
            })
          } else {
            luckyArr = [JSON.parse(result.lucky_order)]
          }
          luckyArr = luckyArr.sort((a, b) => (a.start_after || 0) - (b.start_after || 0))
          result.lucky_order = JSON.stringify(luckyArr)
        } catch (e) {
          result.lucky_order = '[]'
        }
      }
      return this.success(result)
    } catch (error) {
      return this.fail(error)
    }
  }
  
  async createOrUpdateUserTask(data) {
    const { user_id, admin_id, continuous_order, lucky_order, start_after } = data
    
    const user = await User.findByPk(user_id)
    if (!user) throw new Error('用户不存在')

    const transaction = await sequelize.transaction()
    
    try {
      const incomingContinuousOrders = continuous_order !== undefined
        ? normalizeOrderList(parseOrderList(continuous_order), '新增连续订单')
        : undefined
      const duplicatedContinuousStartAfter = incomingContinuousOrders
        ? findDuplicateStartAfter(incomingContinuousOrders)
        : null

      if (duplicatedContinuousStartAfter !== null) {
        throw { code: 400, message: `连续订单开始序号 ${duplicatedContinuousStartAfter} 重复，不能重复派单` }
      }

      const [userTask, created] = await UserTask.findOrCreate({
        where: { user_id },
        defaults: {
          user_id,
          admin_id: admin_id || 0,
          continuous_order: incomingContinuousOrders && incomingContinuousOrders.length > 0
            ? JSON.stringify(incomingContinuousOrders)
            : null,
          lucky_order: wrapLuckyOrder(lucky_order),
          start_after: start_after || 0,
          status: 1
        },
        transaction
      })
      
      if (!created) {
        const updateData = {
          status: 1
        }
        if (admin_id !== undefined) updateData.admin_id = admin_id
        if (continuous_order !== undefined) {
          const existingContinuousOrders = parseOrderList(userTask.continuous_order)
          const mergedContinuousOrders = mergeOrderList(
            existingContinuousOrders,
            incomingContinuousOrders,
            '连续订单'
          )
          updateData.continuous_order = mergedContinuousOrders.length > 0
            ? JSON.stringify(mergedContinuousOrders)
            : null
        }
        if (lucky_order !== undefined) {
          if (isEmptyLuckyOrder(lucky_order)) {
            updateData.lucky_order = null
          } else {
            const mergedLuckyOrders = mergeOrderList(
              parseOrderList(userTask.lucky_order),
              parseOrderList(lucky_order),
              '卡单'
            )
            updateData.lucky_order = mergedLuckyOrders.length > 0
              ? JSON.stringify(mergedLuckyOrders)
              : null
          }
        }
        if (start_after !== undefined) updateData.start_after = start_after
        
        await userTask.update(updateData, { transaction })
      }
      
      await transaction.commit()
      return this.success(userTask, created ? '创建用户任务成功' : '更新用户任务成功')
    } catch (error) {
      await transaction.rollback()
      return this.fail(error)
    }
  }
  
  async deleteUserTask(userId) {
    const userTask = await UserTask.findOne({
      where: { user_id: userId }
    })
    
    if (!userTask) throw new Error('用户任务不存在')

    const transaction = await sequelize.transaction()
    
    try {
      await userTask.destroy({ transaction })
      await apiOrderService.settleBrokenComboGroups(userId, { transaction })
      
      await transaction.commit()
      return this.success(null, '删除用户任务成功')
    } catch (error) {
      await transaction.rollback()
      return this.fail(error)
    }
  }
  
  async updateUserTaskStatus(userId, status) {
    const userTask = await UserTask.findOne({
      where: { user_id: userId }
    })
    
    if (!userTask) throw new Error('用户任务不存在')

    const transaction = await sequelize.transaction()
    
    try {
      await userTask.update({ status }, { transaction })
      if (Number(status) === 0) {
        await apiOrderService.settleBrokenComboGroups(userId, { transaction })
      }
      
      await transaction.commit()
      return this.success(userTask, '更新用户任务状态成功')
    } catch (error) {
      await transaction.rollback()
      return this.fail(error)
    }
  }

  async updateLuckyOrder(userId, lucky_order) {
    const userTask = await UserTask.findOne({ where: { user_id: userId } })
    if (!userTask) throw new Error('用户任务不存在')

    const transaction = await sequelize.transaction()
    
    try {
      let val = wrapLuckyOrder(lucky_order)
      if (val === '[]') val = null
      await userTask.update({ lucky_order: val }, { transaction })
      await transaction.commit()
      return this.success(userTask, '更新幸运订单成功')
    } catch (error) {
      await transaction.rollback()
      return this.fail(error)
    }
  }

  async updateContinuousOrder(userId, continuous_order) {
    const userTask = await UserTask.findOne({ where: { user_id: userId } })
    if (!userTask) throw new Error('用户任务不存在')

    const transaction = await sequelize.transaction()
    
    try {
      let val = continuous_order
      if (val === '[]') val = null
      await userTask.update({ continuous_order: val }, { transaction })
      await apiOrderService.settleBrokenComboGroups(userId, { transaction })
      await transaction.commit()
      return this.success(userTask, '更新连续订单成功')
    } catch (error) {
      await transaction.rollback()
      return this.fail(error)
    }
  }
}

module.exports = new UserTaskService() 
