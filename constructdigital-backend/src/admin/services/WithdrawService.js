const BaseService = require('./BaseService')
const Withdraw = require('@/admin/models/Withdraw')
const User = require('@/admin/models/User')
const MoneyLog = require('@/admin/models/MoneyLog')
const { Op } = require('sequelize')
const sequelize = require('@/config/database')
const { getClientIp } = require('@/utils/getClientIp')

class WithdrawService extends BaseService {

  async getList(req) {
    try {
      const { query: params, user: { id: adminId, role_id: roleId } } = req
      const whereCondition = await this.buildUserAccessWhereCondition(adminId, roleId)

      return await this.paginate(Withdraw, {
        params,
        searchFields: ['name', 'bank_name', 'account_number'],
        where: whereCondition,
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['id', 'username', 'avatar'],
            required: true
          }
        ],
        order: [['id', 'DESC']]
      })
    } catch (error) {
      return this.fail(error)
    }
  }

  async getDetail(id, req) {
    try {
      const { user: { id: adminId, role_id: roleId } } = req
      
      const withdraw = await Withdraw.findByPk(id, {
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['id', 'username', 'balance', 'frozen_balance', 'avatar']
          }
        ]
      })
      
      if (!withdraw) {
        throw new Error('提现记录不存在')
      }

      await this.checkWithdrawAccess(withdraw, adminId, roleId)
      
      return this.success(withdraw, '获取成功')
    } catch (error) {
      return this.fail(error)
    }
  }

  async approve(id, req) {
    const { user: { id: adminId, role_id: roleId } } = req
    
    const withdraw = await Withdraw.findByPk(id, { 
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'username', 'balance', 'frozen_balance', 'avatar']
        }
      ]
    })
    
    if (!withdraw) {
      throw new Error('提现记录不存在')
    }

    await this.checkWithdrawAccess(withdraw, adminId, roleId)
    
    if (withdraw.status !== 0) {
      throw new Error('只能审核待审核状态的提现申请')
    }

    const transaction = await sequelize.transaction()
    
    try {
      const updateData = {
        status: 1
      }
      
      if (req.body.remarks !== undefined) {
        updateData.remarks = req.body.remarks
      }
      
      await withdraw.update(updateData, { transaction })
      
      await transaction.commit()
      
      return this.success(withdraw, '审核通过成功')
    } catch (error) {
      await transaction.rollback()
      return this.fail(error)
    }
  }

  async reject(id, req) {
    const { user: { id: adminId, role_id: roleId } } = req
    
    const withdraw = await Withdraw.findByPk(id, { 
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'username', 'balance', 'frozen_balance', 'avatar']
        }
      ]
    })
    
    if (!withdraw) {
      throw new Error('提现记录不存在')
    }

    await this.checkWithdrawAccess(withdraw, adminId, roleId)
    
    if (withdraw.status !== 0) {
      throw new Error('只能审核待审核状态的提现申请')
    }
    
    const user = withdraw.user
    if (!user) {
      throw new Error('用户不存在')
    }

    const transaction = await sequelize.transaction()
    
    try {
      const currentBalance = parseFloat(user.balance)
      const refundAmount = parseFloat(withdraw.amount)
      const newBalance = currentBalance + refundAmount
      
      await user.update({
        balance: newBalance
      }, { transaction })
      
      await MoneyLog.create({
        user_id: user.id,
        type: 2,
        amount: refundAmount,
        before_balance: currentBalance,
        after_balance: newBalance,
        remark: req.body.remarks,
        ip: getClientIp(req),
        status: 1
      }, { transaction })
      
      const updateData = {
        status: 2
      }
      
      if (req.body.remarks !== undefined) {
        updateData.remarks = req.body.remarks
      }
      
      await withdraw.update(updateData, { transaction })
      
      await transaction.commit()
      
      return this.success(withdraw, '拒绝提现成功，已退还金额')
    } catch (error) {
      await transaction.rollback()
      return this.fail(error)
    }
  }
  
  async confirmPayment(id, req) {
    const { user: { id: adminId, role_id: roleId } } = req
    
    const withdraw = await Withdraw.findByPk(id, { 
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'username', 'balance', 'frozen_balance', 'avatar']
        }
      ]
    })
    
    if (!withdraw) {
      throw new Error('提现记录不存在')
    }

    await this.checkWithdrawAccess(withdraw, adminId, roleId)
    
    if (withdraw.status !== 1) {
      throw new Error('只能确认已通过审核的提现申请')
    }

    const transaction = await sequelize.transaction()
    
    try {
      const updateData = {
        status: 3
      }
      
      if (req.body.remarks !== undefined) {
        updateData.remarks = req.body.remarks
      }
      
      await withdraw.update(updateData, { transaction })
      
      await transaction.commit()
      
      return this.success(withdraw, '确认打款成功')
    } catch (error) {
      await transaction.rollback()
      return this.fail(error)
    }
  }

  async checkWithdrawAccess(withdraw, adminId, roleId) {
    if (roleId === 1) return

    const user = withdraw.user
    if (!user) {
      throw new Error('用户不存在')
    }

    if (user.admin_id === adminId) return

    const allAccessibleUserIds = await this.getAllAccessibleUserIds(adminId)
    if (!allAccessibleUserIds.includes(user.id)) {
      throw new Error('无权限操作此提现记录')
    }
  }
}

module.exports = new WithdrawService() 