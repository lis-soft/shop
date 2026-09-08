const BaseService = require('./BaseService')
const MoneyLog = require('@/admin/models/MoneyLog')
const User = require('@/admin/models/User')
const { Op, Sequelize } = require('sequelize')

class MoneyLogService extends BaseService {

  async getList(params, adminId, role) {
    try {
      const whereCondition = await this.buildUserAccessWhereCondition(adminId, role)

      return await this.paginate(MoneyLog, {
        params,
        searchFields: ['remark', 'order_id'],
        where: whereCondition,
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['username', 'avatar'],
            required: true
          },
          {
            model: User,
            as: 'relatedUser',
            attributes: ['username', 'avatar']
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
      const moneyLog = await MoneyLog.findByPk(id, {
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['id', 'username', 'avatar', 'balance', 'frozen_balance']
          },
          {
            model: User,
            as: 'relatedUser',
            attributes: ['id', 'username', 'avatar']
          }
        ]
      })
      
      if (!moneyLog) {
        throw new Error('财务记录不存在')
      }

      await this.checkMoneyLogAccess(moneyLog, adminId, role)
      
      return this.success(moneyLog)
    } catch (error) {
      return this.fail(error)
    }
  }

  async getStats(params, adminId, role) {
    try {
      const { startDate, endDate, userId } = params
      const whereCondition = await this.buildUserAccessWhereCondition(adminId, role)
      
      if (userId !== undefined && userId !== '') {
        whereCondition.user_id = Number(userId)
      }
      
      if (startDate && endDate) {
        whereCondition.created_at = {
          [Op.between]: [
            new Date(startDate + ' 00:00:00'),
            new Date(endDate + ' 23:59:59')
          ]
        }
      }

      const stats = await MoneyLog.findAll({
        where: whereCondition,
        include: [
          {
            model: User,
            as: 'user',
            attributes: [],
            required: true
          }
        ],
        attributes: [
          'type',
          [Sequelize.fn('SUM', Sequelize.col('amount')), 'totalAmount'],
          [Sequelize.fn('COUNT', Sequelize.col('MoneyLog.id')), 'count']
        ],
        group: ['type']
      })

      let totalIncome = 0
      let totalExpense = 0
      
      const typeStats = stats.map(item => {
        const type = item.type
        const totalAmount = parseFloat(item.dataValues.totalAmount || 0)
        const count = parseInt(item.dataValues.count || 0)
        
        if ([1, 3, 5].includes(type)) {
          totalIncome += totalAmount
        } else if ([2, 4, 6].includes(type)) {
          totalExpense += totalAmount
        }
        
        return {
          type,
          totalAmount,
          count
        }
      })
      
      return this.success({
        typeStats,
        totalIncome,
        totalExpense,
        netAmount: totalIncome - totalExpense
      })
    } catch (error) {
      return this.fail(error)
    }
  }

  async checkMoneyLogAccess(moneyLog, adminId, roleId) {
    if (roleId === 1) return

    const user = moneyLog.user
    if (!user) {
      throw new Error('用户不存在')
    }

    if (user.admin_id === adminId) return

    const allAccessibleUserIds = await this.getAllAccessibleUserIds(adminId)
    if (!allAccessibleUserIds.includes(user.id)) {
      throw new Error('无权限查看此财务记录')
    }
  }
}

module.exports = new MoneyLogService() 