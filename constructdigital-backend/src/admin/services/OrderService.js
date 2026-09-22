const BaseService = require('./BaseService')
const Order = require('../models/Order')
const User = require('../models/User')
const Product = require('../models/Product')
const MoneyLog = require('../models/MoneyLog')
const AdminLog = require('../models/AdminLog')
const { Op } = require('sequelize')
const sequelize = require('@/config/database')
const XLSX = require('xlsx')
const apiOrderService = require('@/api/services/OrderService')

const ALLOWED_NON_SETTLEMENT_STATUSES = new Set([0, 2, 3, 5])

class OrderService extends BaseService {
  getAvailableBalance(user) {
    const balance = parseFloat(user?.balance)
    const frozenBalance = parseFloat(user?.frozen_balance)
    const normalizedBalance = Number.isFinite(balance) ? balance : 0
    const normalizedFrozenBalance = Number.isFinite(frozenBalance) ? frozenBalance : 0

    return +(normalizedBalance - normalizedFrozenBalance).toFixed(8)
  }

  async getOrderSpendLog(orderId, transaction = null) {
    if (!orderId) {
      return null
    }

    return MoneyLog.findOne({
      where: {
        order_id: orderId,
        type: 4
      },
      order: [['id', 'DESC']],
      transaction
    })
  }

  async resolveOrderSettlement(user, orderLike, transaction = null) {
    const total = parseFloat(orderLike?.order_price ?? orderLike?.total ?? 0)
    const commission = parseFloat(orderLike?.order_commission ?? orderLike?.commission ?? 0)
    const normalizedTotal = Number.isFinite(total) ? total : 0
    const normalizedCommission = Number.isFinite(commission) ? commission : 0
    const standardFreezeAmount = +(normalizedTotal + normalizedCommission).toFixed(8)
    const currentFrozen = parseFloat(user?.frozen_balance)
    const normalizedFrozen = Number.isFinite(currentFrozen) ? currentFrozen : 0
    const spendLog = await this.getOrderSpendLog(orderLike?.order_id, transaction)

    let settlementMode = 'preissued'
    if (spendLog?.status === 2) {
      settlementMode = 'deferred'
    } else if (normalizedFrozen + 1e-8 < standardFreezeAmount && normalizedFrozen + 1e-8 >= normalizedTotal) {
      settlementMode = 'legacy'
    }

    return {
      total: normalizedTotal,
      commission: normalizedCommission,
      freezeAmount: settlementMode === 'preissued' ? standardFreezeAmount : normalizedTotal,
      legacyMode: settlementMode === 'legacy',
      settlementMode,
      spendLog
    }
  }

  async markOrderSpendLogSettled(orderId, transaction = null) {
    if (!orderId) {
      return
    }

    await MoneyLog.update({
      status: 1
    }, {
      where: {
        order_id: orderId,
        type: 4,
        status: 2
      },
      transaction
    })
  }

  async getList(params, adminId, role) {
    try {
      const whereCondition = await this.buildUserAccessWhereCondition(adminId, role)

      return await this.paginate(Order, {
        params,
        searchFields: ['order_id'],
        where: whereCondition,
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['id', 'username', 'phone'],
            required: true
          },
          {
            model: Product,
            as: 'product',
            attributes: ['id', 'product_title']
          }
        ],
        order: [['id', 'DESC']]
      })
    } catch (error) {
      return this.fail(error)
    }
  }
  
  
  async getDetail(id, adminId, role) {
    try {
      const order = await Order.findByPk(id, {
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['id', 'username', 'phone', 'balance', 'frozen_balance']
          },
          {
            model: Product,
            as: 'product',
            attributes: ['id', 'product_title', 'product_pic', 'price', 'commission']
          }
        ]
      })
      
      if (!order) {
        throw new Error('订单不存在')
      }

      await this.checkOrderAccess(order, adminId, role)
      
      return this.success(order)
    } catch (error) {
      return this.fail(error)
    }
  }
  
  async updateStatus(id, status, { admin_id, ip }, role) {
    try {
      const order = await Order.findByPk(id, {
        include: [
          {
            model: User,
            as: 'user'
          }
        ]
      })
      
      if (!order) {
        throw new Error('订单不存在')
      }

      await this.checkOrderAccess(order, admin_id, role)

      const normalizedStatus = parseInt(status, 10)
      if (!Number.isInteger(normalizedStatus)) {
        throw new Error('订单状态不合法')
      }

      if (!ALLOWED_NON_SETTLEMENT_STATUSES.has(normalizedStatus)) {
        throw new Error('请通过专用资金流程处理完成或解冻状态')
      }

      if (order.status === 1) {
        throw new Error('已完成订单不能再修改状态')
      }

      if (order.status === normalizedStatus) {
        return this.success(order)
      }
      
      await order.update({ status: normalizedStatus })
      
      return this.success(order)
    } catch (error) {
      return this.fail(error)
    }
  }
  
  async completeOrder(id, { admin_id, ip }, role) {
    const transaction = await sequelize.transaction()
    
    try {
      const order = await Order.findByPk(id, {
        transaction,
        lock: transaction.LOCK.UPDATE
      })
      
      if (!order) {
        throw new Error('订单不存在')
      }

      const user = await User.findByPk(order.user_id, {
        transaction,
        lock: transaction.LOCK.UPDATE
      })
      if (!user) {
        throw new Error('用户不存在')
      }

      order.setDataValue('user', user)
      await this.checkOrderAccess(order, admin_id, role)
      
      if (order.status !== 0) {
        throw new Error('只有未完成的订单才能手动完成')
      }

      await apiOrderService.finalizeOrderCompletion(user, order, {
        ip,
        transaction,
        skipAvailableCheck: true,
        distributeTeam: false,
        principalRemark: '返还本金 订单号{order_id}',
        commissionRemark: '发放佣金 订单号{order_id}'
      })
      
      await transaction.commit()
      
      return this.success(order)
    } catch (error) {
      await transaction.rollback()
      return this.fail(error)
    }
  }
  
  async delete(id, { admin_id, ip }, role) {
    const transaction = await sequelize.transaction()

    try {
      const order = await Order.findByPk(id, {
        transaction,
        lock: transaction.LOCK.UPDATE
      })

      if (!order) {
        throw new Error('订单不存在')
      }

      const user = await User.findByPk(order.user_id, {
        transaction,
        lock: transaction.LOCK.UPDATE
      })
      if (!user) {
        throw new Error('用户不存在')
      }

      order.setDataValue('user', user)
      await this.checkOrderAccess(order, admin_id, role)
      
      if (order.status === 1) {
        throw new Error('已完成的订单不能删除')
      }

      const settlement = await this.resolveOrderSettlement(user, order, transaction)
      const { total, commission, freezeAmount, legacyMode, settlementMode } = settlement
      const beforeFrozen = parseFloat(user.frozen_balance)
      const beforeBalance = parseFloat(user.balance)
      const beforeAvailable = this.getAvailableBalance(user)

      if (beforeFrozen < freezeAmount) {
        throw new Error('冻结金额不足')
      }

      const afterFrozen = +(beforeFrozen - freezeAmount).toFixed(8)
      const afterBalance = legacyMode
        ? +(beforeBalance + total).toFixed(8)
        : settlementMode === 'deferred'
          ? beforeBalance
          : +(beforeBalance - commission).toFixed(8)
      const afterDisplayBalance = legacyMode
        ? afterBalance
        : +(beforeAvailable + total).toFixed(8)

      await user.update({
        frozen_balance: afterFrozen,
        balance: afterBalance
      }, { transaction })

      await MoneyLog.createLog({
        user_id: user.id,
        type: 5,
        amount: total,
        before_balance: legacyMode ? beforeBalance : beforeAvailable,
        after_balance: afterDisplayBalance,
        remark: `删除订单返还本金 订单号{order_id}`,
        order_id: order.order_id,
        status: 1,
        ip,
        transaction
      })

      await this.markOrderSpendLogSettled(order.order_id, transaction)
      
      await order.destroy({ transaction })

      user.frozen_balance = afterFrozen
      user.balance = afterBalance
      await apiOrderService.settleBrokenComboGroups(user.id, {
        ip,
        transaction,
        user
      })

      await transaction.commit()
      
      return this.success(null)
    } catch (error) {
      await transaction.rollback()
      return this.fail(error)
    }
  }

  async exportOrders(params, adminId, role) {
    try {
      const whereCondition = await this.buildUserAccessWhereCondition(adminId, role)

      const result = await this.paginate(Order, {
        params: { ...params, page: 1, pageSize: 999999 },
        searchFields: ['order_id'],
        where: whereCondition,
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['id', 'username', 'phone', 'balance', 'frozen_balance'],
            required: true
          },
          {
            model: Product,
            as: 'product',
            attributes: ['id', 'product_title']
          }
        ],
        order: [['id', 'DESC']]
      })

      if (!result.data || !result.data.list || result.data.list.length === 0) {
        throw new Error('没有找到订单数据')
      }

      const orders = result.data.list
      const wb = XLSX.utils.book_new()

      const exportData = orders.map(order => ({
        '订单ID': order.id,
        '订单号': order.order_id,
        '用户ID': order.user?.id || '',
        '用户名': order.user?.username || '',
        '手机号': order.user?.phone || '',
        '商品名称': order.product_title,
        '商品价格': order.product_price,
        '订单数量': order.order_nums,
        '订单金额': order.order_price,
        '订单佣金': order.order_commission,
        '订单类型': order.is_lucky === 1 ? '幸运订单' : '普通订单',
        '订单状态': this.getStatusText(order.status),
        '任务组': order.task_force || '',
        '创建时间': order.created_at,
        '更新时间': order.updated_at
      }))

      const ws = XLSX.utils.json_to_sheet(exportData)
      ws['!cols'] = [
        { wch: 10 }, { wch: 20 }, { wch: 10 }, { wch: 15 }, { wch: 15 },
        { wch: 25 }, { wch: 12 }, { wch: 10 }, { wch: 12 }, { wch: 12 },
        { wch: 12 }, { wch: 12 }, { wch: 15 }, { wch: 20 }, { wch: 20 }
      ]
      XLSX.utils.book_append_sheet(wb, ws, '订单数据')

      const userStats = new Map()
      const productStats = new Map()
      const statusStats = new Map()
      const dailyStats = new Map()
      let totalAmount = 0
      let totalCommission = 0
      let luckyOrderCount = 0
      let normalOrderCount = 0

      orders.forEach(order => {
        const userId = order.user?.id
        const userName = order.user?.username || '未知用户'
        const userPhone = order.user?.phone || ''
        const productTitle = order.product_title
        const status = order.status
        const amount = parseFloat(order.order_price) || 0
        const commission = parseFloat(order.order_commission) || 0
        const date = order.created_at ? order.created_at.split(' ')[0] : ''

        totalAmount += amount
        totalCommission += commission

        if (order.is_lucky === 1) {
          luckyOrderCount++
        } else {
          normalOrderCount++
        }

        if (userId) {
          if (!userStats.has(userId)) {
            userStats.set(userId, {
              用户ID: userId,
              用户名: userName,
              手机号: userPhone,
              订单数量: 0,
              订单总金额: 0,
              佣金总额: 0,
              幸运订单数: 0,
              普通订单数: 0,
              已完成订单: 0,
              待处理订单: 0
            })
          }
          const userStat = userStats.get(userId)
          userStat.订单数量++
          userStat.订单总金额 += amount
          userStat.佣金总额 += commission
          if (order.is_lucky === 1) userStat.幸运订单数++
          else userStat.普通订单数++
          if (status === 1) userStat.已完成订单++
          else userStat.待处理订单++
        }

        if (productTitle) {
          if (!productStats.has(productTitle)) {
            productStats.set(productTitle, {
              商品名称: productTitle,
              订单数量: 0,
              销售总额: 0,
              佣金总额: 0
            })
          }
          const productStat = productStats.get(productTitle)
          productStat.订单数量++
          productStat.销售总额 += amount
          productStat.佣金总额 += commission
        }

        const statusText = this.getStatusText(status)
        statusStats.set(statusText, (statusStats.get(statusText) || 0) + 1)

        if (date) {
          if (!dailyStats.has(date)) {
            dailyStats.set(date, {
              日期: date,
              订单数量: 0,
              订单总额: 0,
              佣金总额: 0,
              幸运订单数: 0
            })
          }
          const dailyStat = dailyStats.get(date)
          dailyStat.订单数量++
          dailyStat.订单总额 += amount
          dailyStat.佣金总额 += commission
          if (order.is_lucky === 1) dailyStat.幸运订单数++
        }
      })

      const userStatsArray = Array.from(userStats.values())
        .sort((a, b) => b.订单数量 - a.订单数量)
      
      const productStatsArray = Array.from(productStats.values())
        .sort((a, b) => b.订单数量 - a.订单数量)
      
      const dailyStatsArray = Array.from(dailyStats.values())
        .sort((a, b) => new Date(b.日期) - new Date(a.日期))

      const topUserByOrders = userStatsArray[0]
      const topUserByAmount = userStatsArray.sort((a, b) => b.订单总金额 - a.订单总金额)[0]
      const topUserByCommission = userStatsArray.sort((a, b) => b.佣金总额 - a.佣金总额)[0]
      const topProduct = productStatsArray[0]

      const summaryData = [
        { 统计项目: '订单总数', 数值: orders.length },
        { 统计项目: '订单总金额', 数值: totalAmount.toFixed(2) },
        { 统计项目: '佣金总额', 数值: totalCommission.toFixed(2) },
        { 统计项目: '幸运订单数', 数值: luckyOrderCount },
        { 统计项目: '普通订单数', 数值: normalOrderCount },
        { 统计项目: '平均订单金额', 数值: (totalAmount / orders.length).toFixed(2) },
        { 统计项目: '平均佣金', 数值: (totalCommission / orders.length).toFixed(2) },
        { 统计项目: '', 数值: '' },
        { 统计项目: '订单最多用户ID', 数值: topUserByOrders?.用户ID || '' },
        { 统计项目: '订单最多用户名', 数值: topUserByOrders?.用户名 || '' },
        { 统计项目: '订单最多用户订单数', 数值: topUserByOrders?.订单数量 || 0 },
        { 统计项目: '', 数值: '' },
        { 统计项目: '金额最多用户ID', 数值: topUserByAmount?.用户ID || '' },
        { 统计项目: '金额最多用户名', 数值: topUserByAmount?.用户名 || '' },
        { 统计项目: '金额最多用户总额', 数值: topUserByAmount?.订单总金额?.toFixed(2) || 0 },
        { 统计项目: '', 数值: '' },
        { 统计项目: '佣金最多用户ID', 数值: topUserByCommission?.用户ID || '' },
        { 统计项目: '佣金最多用户名', 数值: topUserByCommission?.用户名 || '' },
        { 统计项目: '佣金最多用户佣金', 数值: topUserByCommission?.佣金总额?.toFixed(2) || 0 },
        { 统计项目: '', 数值: '' },
        { 统计项目: '热门商品', 数值: topProduct?.商品名称 || '' },
        { 统计项目: '热门商品订单数', 数值: topProduct?.订单数量 || 0 },
        { 统计项目: '热门商品销售额', 数值: topProduct?.销售总额?.toFixed(2) || 0 }
      ]

      const summaryWs = XLSX.utils.json_to_sheet(summaryData)
      summaryWs['!cols'] = [{ wch: 20 }, { wch: 20 }]
      XLSX.utils.book_append_sheet(wb, summaryWs, '统计概览')

      const userStatsWs = XLSX.utils.json_to_sheet(userStatsArray)
      userStatsWs['!cols'] = [
        { wch: 10 }, { wch: 15 }, { wch: 15 }, { wch: 12 },
        { wch: 15 }, { wch: 12 }, { wch: 12 }, { wch: 12 },
        { wch: 12 }, { wch: 12 }
      ]
      XLSX.utils.book_append_sheet(wb, userStatsWs, '用户统计')

      const productStatsWs = XLSX.utils.json_to_sheet(productStatsArray)
      productStatsWs['!cols'] = [{ wch: 25 }, { wch: 12 }, { wch: 15 }, { wch: 12 }]
      XLSX.utils.book_append_sheet(wb, productStatsWs, '商品统计')

      const dailyStatsWs = XLSX.utils.json_to_sheet(dailyStatsArray)
      dailyStatsWs['!cols'] = [{ wch: 12 }, { wch: 12 }, { wch: 15 }, { wch: 12 }, { wch: 12 }]
      XLSX.utils.book_append_sheet(wb, dailyStatsWs, '每日统计')

      const statusStatsArray = Array.from(statusStats.entries()).map(([status, count]) => ({
        订单状态: status,
        订单数量: count,
        占比: ((count / orders.length) * 100).toFixed(2) + '%'
      }))
      const statusStatsWs = XLSX.utils.json_to_sheet(statusStatsArray)
      statusStatsWs['!cols'] = [{ wch: 12 }, { wch: 12 }, { wch: 10 }]
      XLSX.utils.book_append_sheet(wb, statusStatsWs, '状态统计')

      const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' })
      return this.success(buffer)
    } catch (error) {
      return this.fail(error)
    }
  }

  getStatusText(status) {
    const statusMap = {
      0: '已派单',
      1: '已完成',
      2: '待结算',
      3: '已冻结',
      4: '已解冻',
      5: '待反佣'
    }
    return statusMap[status] || '未知状态'
  }

  async checkOrderAccess(order, adminId, roleId) {
    if (roleId === 1) return

    const user = order.user
    if (!user) {
      throw new Error('用户不存在')
    }

    if (user.admin_id === adminId) return

    const allAccessibleUserIds = await this.getAllAccessibleUserIds(adminId)
    if (!allAccessibleUserIds.includes(user.id)) {
      throw new Error('无权限操作此订单')
    }
  }
}

module.exports = new OrderService() 
