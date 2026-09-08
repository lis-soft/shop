const BaseService = require('./BaseService')
const User = require('@/admin/models/User')
const { Op } = require('sequelize')
const sequelize = require('@/config/database')
const crypto = require('crypto')
const MoneyLog = require('@/admin/models/MoneyLog')
const Order = require('@/admin/models/Order')
const Admin = require('@/admin/models/Admin')
const UserTask = require('@/admin/models/UserTask')
const Product = require('@/admin/models/Product')
const Wallet = require('@/admin/models/Wallet')
const Vip = require('@/admin/models/Vip')
const UserBank = require('@/admin/models/UserBank')
const { getClientIp, getIpLocation } = require('@/utils/getClientIp')
const orderService = require('./OrderService')

const ACTIVE_FROZEN_ORDER_STATUSES = [0, 2, 3, 5]

class UserService extends BaseService {
  normalizeCreditScore(value, fallback = undefined) {
    if (value === undefined || value === null || value === '') {
      return fallback
    }

    const parsedValue = Number(value)
    if (!Number.isFinite(parsedValue)) {
      throw new Error('信誉分必须为数字')
    }

    const normalizedValue = Math.round(parsedValue)
    if (normalizedValue < 0 || normalizedValue > 100) {
      throw new Error('信誉分必须在 0 到 100 之间')
    }

    return normalizedValue
  }

  async getList(req) {
    try {
      const { query: params, user: { id: adminId, role_id: roleId } } = req
      const whereCondition = await this.buildUserAccessCondition(adminId, roleId)
      const trimmedRemark = String(params.remark || '').trim()
      const sortFieldMap = {
        id: 'id',
        balance: 'balance',
        creditScore: 'credit_score',
        recharge: 'id',
        withdraw: 'id',
        commission: 'id'
      }
      const normalizedSortField = sortFieldMap[String(params.sortBy || '').trim()] || 'id'
      const normalizedSortOrder = String(params.sortOrder || '').toLowerCase() === 'asc' ? 'ASC' : 'DESC'

      if (trimmedRemark) {
        whereCondition.remarks = {
          [Op.like]: `%${trimmedRemark}%`
        }
      }

      if (params.vip_level !== undefined && params.vip_level !== null && params.vip_level !== '') {
        whereCondition.vip_level = parseInt(params.vip_level, 10)
      }

      if (params.admin_id !== undefined && params.admin_id !== null && params.admin_id !== '') {
        whereCondition.admin_id = parseInt(params.admin_id, 10)
      }

      ;['is_task', 'is_withdraw', 'is_invite'].forEach(field => {
        if (params[field] !== undefined && params[field] !== null && params[field] !== '') {
          whereCondition[field] = parseInt(params[field], 10)
        }
      })

      const result = await this.paginate(User, {
        params,
        searchFields: ['username', 'phone', 'invite_code', 'remarks'],
        attributes: { exclude: ['password', 'pay_password'] },
        where: whereCondition,
        include: [
          { model: User, as: 'superior', attributes: ['id', 'username', 'phone'] },
          { model: Vip, as: 'vip', required: false },
          { model: UserBank, as: 'userBank', required: false }
        ],
        order: [[normalizedSortField, normalizedSortOrder], ['id', 'DESC']]
      });

      const enrichedUsers = await Promise.all(
        result.data.list.map(user => this.enrichUserWithStats(user))
      )

      return this.success({
        ...result.data,
        list: enrichedUsers
      });
    } catch (error) {
      throw error;
    }
  }

  async getDetail(req) {
    try {
      const { params: { id }, user: { id: adminId, role_id: roleId } } = req
      const whereCondition = await this.buildUserAccessCondition(adminId, roleId, { id })
      const user = await User.findOne({
        where: whereCondition,
        include: [
          { model: User, as: 'superior', attributes: ['id', 'username', 'phone'] },
          { model: UserTask, as: 'UserTask' },
          { model: Wallet, as: 'wallet' },
          { model: Vip, as: 'vip', required: false },
          { model: UserBank, as: 'userBank', required: false }
        ]
      })

      if (!user) {
        throw new Error('用户不存在')
      }

      const enrichedUser = await this.enrichUserWithStats(user)

      return this.success(enrichedUser)
    } catch (error) {
      return this.fail(error)
    }
  }

  async create(req) {
    const { body: data, user: { id: adminId } } = req
    const exists = await User.findOne({ where: { username: data.username } });
    if (exists) {
      throw new Error('用户名已存在');
    }

    if (data.phone) {
      const phoneExists = await User.findOne({ where: { phone: data.phone } });
      if (phoneExists) {
        throw new Error('手机号已被使用');
      }
    }

    const transaction = await sequelize.transaction();

    try {

      data.admin_id = adminId;
      data.credit_score = this.normalizeCreditScore(data.credit_score, 100)

      const user = await User.create(data, { transaction });

      await transaction.commit();

      return this.success(user);
    } catch (error) {
      await transaction.rollback();
      return this.fail(error);
    }
  }

  async update(req) {
    const { params: { id }, body: data, user: { id: adminId, role_id: roleId } } = req
    const whereCondition = await this.buildUserAccessCondition(adminId, roleId, { id })
    const user = await User.findOne({ where: whereCondition })

    if (!user) {
      throw new Error('用户不存在')
    }

    const checkExistence = async (field, value) => {
      if (value && value !== user[field]) {
        const exists = await User.findOne({ where: { [field]: value } });
        if (exists) throw new Error(`${field}已存在`);
      }
    };

    await checkExistence('username', data.username);
    await checkExistence('phone', data.phone);

    const transaction = await sequelize.transaction();

    try {
      if (data.status !== undefined) data.status = data.status === 1 || data.status === true;
      if (data.is_task !== undefined) data.is_task = data.is_task === 1 || data.is_task === true;
      if (data.is_withdraw !== undefined) data.is_withdraw = data.is_withdraw === 1 || data.is_withdraw === true;
      if (data.is_invite !== undefined) data.is_invite = data.is_invite === 1 || data.is_invite === true;
      data.task_rate = data.task_rate !== undefined ? parseFloat(data.task_rate) : data.task_rate;
      data.credit_score = this.normalizeCreditScore(data.credit_score, user.credit_score);

      ['balance', 'frozen_balance', 'login_pwd', 'pay_pwd'].forEach(field => {
        if (!data[field]) delete data[field];
      });

      await user.update(data, { transaction })

      await transaction.commit()
      return this.success(user)
    } catch (error) {
      await transaction.rollback()
      return this.fail(error)
    }
  }

  async delete(req) {
    const { params: { id }, user: { id: adminId, role_id: roleId } } = req
    const whereCondition = await this.buildUserAccessCondition(adminId, roleId, { id })
    const user = await User.findOne({ where: whereCondition })

    if (!user) {
      throw new Error('用户不存在')
    }

    const hasSubordinates = await User.count({
      where: { superior_id: id }
    })

    if (hasSubordinates > 0) {
      throw new Error('该用户有下级用户，无法删除')
    }

    if (parseFloat(user.balance) > 0 || parseFloat(user.frozen_balance) > 0) {
      throw new Error('该用户有余额，无法删除')
    }

    const transaction = await sequelize.transaction()

    try {
      await user.destroy({ transaction })

      await transaction.commit()

      return this.success()
    } catch (error) {
      await transaction.rollback()
      throw error
    }
  }

  async adjustBalance(req) {
    const { body: data, user: { id: admin_id } } = req
    const { userId, type, amount, remark, createLog = true } = data

    if (!userId) {
      throw new Error('用户ID不能为空')
    }

    if (amount === undefined || amount === null || amount === 0) {
      throw new Error('调整金额不能为空或0')
    }

    const user = await User.findByPk(userId)

    if (!user) {
      throw new Error('用户不存在')
    }

    const transaction = await sequelize.transaction()

    try {
      const currentBalance = parseFloat(user.balance)
      const adjustAmount = parseFloat(amount)
      const newBalance = currentBalance + adjustAmount
      const normalizedType = type === 'activity_gift' ? 5 : parseInt(type, 10)
      const normalizedRemark = type === 'activity_gift'
        ? (String(remark || '').trim() || '活动赠送')
        : remark

      if (createLog && !Number.isInteger(normalizedType)) {
        throw new Error('调整类型不合法')
      }

      await user.update({ balance: newBalance }, { transaction })

      if (createLog) {
        await MoneyLog.create({
          admin_id,
          user_id: userId,
          type: normalizedType,
          amount: adjustAmount,
          before_balance: currentBalance,
          after_balance: newBalance,
          remark: normalizedRemark,
          ip: getClientIp(req),
          status: 1
        }, { transaction })
      }

      await transaction.commit()

      return this.success({
        balance: newBalance,
        amount: adjustAmount,
        type: normalizedType
      })
    } catch (error) {
      await transaction.rollback()
      throw error
    }
  }

  async getBalanceRecords(req) {
    try {
      const { params: { userId }, query: params } = req
      return await this.paginate(MoneyLog, {
        params,
        where: { user_id: userId },
        include: [
          {
            model: Admin,
            as: 'admin',
            attributes: ['username', 'realName']
          }
        ],
        order: [['id', 'DESC']]
      })
    } catch (error) {
      return this.fail(error)
    }
  }

  async toggleStatus(req) {
    const { params: { id }, user: { id: adminId, role_id: roleId } } = req
    const whereCondition = await this.buildUserAccessCondition(adminId, roleId, { id })
    const user = await User.findOne({ where: whereCondition })

    if (!user) {
      throw new Error('用户不存在')
    }

    const transaction = await sequelize.transaction()

    try {
      await user.update({ status: !user.status }, { transaction })

      await transaction.commit()

      return this.success(user)
    } catch (error) {
      await transaction.rollback()
      throw error
    }
  }

  async toggleTaskStatus(req) {
    const { params: { id }, body: { status }, user: { id: adminId, role_id: roleId } } = req
    const whereCondition = await this.buildUserAccessCondition(adminId, roleId, { id })
    const user = await User.findOne({ where: whereCondition })

    if (!user) {
      throw new Error('用户不存在')
    }

    const transaction = await sequelize.transaction()

    try {
      await user.update({ is_task: status === 1 }, { transaction })

      await transaction.commit()

      return this.success(user)
    } catch (error) {
      await transaction.rollback()
      throw error
    }
  }

  async getTeam(req) {
    try {
      const { params: { id: userId }, query: queryParams, user: { id: adminId, role } } = req

      if (role === 1) {
        const admin = await Admin.findByPk(adminId)
        if (!admin || !admin.user_id) {
          throw new Error('代理未关联用户账号')
        }

        const agentUserId = admin.user_id

        if (parseInt(userId) !== agentUserId) {
          const userIds = await this.getAgentUserIds(agentUserId)
          if (!userIds.includes(parseInt(userId))) {
            throw new Error('无权查看该用户的团队')
          }
        }
      }

      const { level = 1, page = 1, pageSize = 20, keyword } = queryParams
      const user = await User.findByPk(userId, {
        attributes: ['id', 'username', 'avatar', 'created_at']
      })

      if (!user) {
        throw new Error('用户不存在')
      }

      let teamMembers = []

      if (level == 1) {
        teamMembers = await User.findAll({
          where: { superior_id: userId },
          attributes: ['id', 'username', 'avatar', 'created_at', 'task_force']
        })
      } else if (level == 2) {
        const level1Members = await User.findAll({
          where: { superior_id: userId },
          attributes: ['id']
        })
        const level1Ids = level1Members.map(m => m.id)

        if (level1Ids.length > 0) {
          teamMembers = await User.findAll({
            where: { superior_id: { [Op.in]: level1Ids } },
            attributes: ['id', 'username', 'avatar', 'created_at', 'task_force']
          })
        }
      } else if (level == 3) {
        const level1Members = await User.findAll({
          where: { superior_id: userId },
          attributes: ['id']
        })
        const level1Ids = level1Members.map(m => m.id)

        if (level1Ids.length > 0) {
          const level2Members = await User.findAll({
            where: { superior_id: { [Op.in]: level1Ids } },
            attributes: ['id']
          })
          const level2Ids = level2Members.map(m => m.id)

          if (level2Ids.length > 0) {
            teamMembers = await User.findAll({
              where: { superior_id: { [Op.in]: level2Ids } },
              attributes: ['id', 'username', 'avatar', 'created_at', 'task_force']
            })
          }
        }
      }

      if (keyword && teamMembers.length > 0) {
        teamMembers = teamMembers.filter(m =>
          m.username && m.username.includes(keyword) ||
          m.id.toString().includes(keyword)
        )
      }

      const level1Stats = await this.getTeamLevelStats([userId])
      const level2Stats = await this.getTeamLevelStats(level1Stats.userIds)
      const level3Stats = await this.getTeamLevelStats(level2Stats.userIds)

      const totalMembers = level1Stats.count + level2Stats.count + level3Stats.count
      const totalRecharge = level1Stats.recharge + level2Stats.recharge + level3Stats.recharge
      const totalWithdraw = level1Stats.withdraw + level2Stats.withdraw + level3Stats.withdraw
      const totalCommission = level1Stats.commission + level2Stats.commission + level3Stats.commission

      const total = teamMembers.length
      const start = (page - 1) * pageSize
      const end = Math.min(start + parseInt(pageSize), total)
      const paginatedMembers = teamMembers.slice(start, end)

      const enrichedMembers = await Promise.all(paginatedMembers.map(async (member) => {
        const memberData = member.toJSON()

        const orderCount = await Order.count({
          where: { user_id: member.id, task_force: member.task_force }
        })

        const [recharge, withdraw, commission] = await Promise.all([
          this.getMoneyLogSum(member.id, 1),
          this.getMoneyLogSum(member.id, 2),
          this.getMoneyLogSum(member.id, 3)
        ])

        return {
          ...memberData,
          orderCount,
          recharge,
          withdraw,
          commission
        }
      }))

      return this.success({
        user,
        members: enrichedMembers,
        total,
        stats: {
          totalMembers,
          level1Count: level1Stats.count,
          level2Count: level2Stats.count,
          level3Count: level3Stats.count,
          totalRecharge,
          totalWithdraw,
          totalCommission,
          level1Recharge: level1Stats.recharge,
          level1Withdraw: level1Stats.withdraw,
          level1Commission: level1Stats.commission,
          level2Recharge: level2Stats.recharge,
          level2Withdraw: level2Stats.withdraw,
          level2Commission: level2Stats.commission,
          level3Recharge: level3Stats.recharge,
          level3Withdraw: level3Stats.withdraw,
          level3Commission: level3Stats.commission
        }
      })
    } catch (error) {
      return this.fail(error)
    }
  }

  async resetTasks(req) {
    const {
      params: { id: userId },
      user: { id: adminId, role_id: roleId }
    } = req
    const whereCondition = await this.buildUserAccessCondition(adminId, roleId, { id: userId })
    const transaction = await sequelize.transaction()

    try {
      const user = await User.findOne({
        where: whereCondition,
        transaction,
        lock: transaction.LOCK.UPDATE
      })
      if (!user) throw new Error('用户不存在')

      const activeOrders = await Order.findAll({
        where: {
          user_id: user.id,
          status: { [Op.in]: ACTIVE_FROZEN_ORDER_STATUSES }
        },
        order: [['id', 'ASC']],
        transaction,
        lock: transaction.LOCK.UPDATE
      })

      let currentBalance = parseFloat(user.balance)
      let currentFrozen = parseFloat(user.frozen_balance)
      currentBalance = Number.isFinite(currentBalance) ? currentBalance : 0
      currentFrozen = Number.isFinite(currentFrozen) ? currentFrozen : 0

      for (const order of activeOrders) {
        const userSnapshot = {
          balance: currentBalance,
          frozen_balance: currentFrozen
        }
        const beforeAvailable = orderService.getAvailableBalance(userSnapshot)
        const { total, commission, freezeAmount, legacyMode, settlementMode } = await orderService.resolveOrderSettlement(userSnapshot, order, transaction)

        if (currentFrozen + 1e-8 < freezeAmount) {
          throw new Error(`订单 ${order.order_id} 冻结金额不足，无法重置`)
        }

        const afterFrozen = +(currentFrozen - freezeAmount).toFixed(8)
        const afterBalance = legacyMode
          ? +(currentBalance + total).toFixed(8)
          : settlementMode === 'deferred'
            ? currentBalance
            : +(currentBalance - commission).toFixed(8)
        const afterDisplayBalance = legacyMode
          ? afterBalance
          : +(beforeAvailable + total).toFixed(8)

        await MoneyLog.createLog({
          user_id: user.id,
          type: 5,
          amount: total,
          before_balance: legacyMode ? currentBalance : beforeAvailable,
          after_balance: afterDisplayBalance,
          remark: '订单返还本金 订单号{order_id}',
          order_id: order.order_id,
          status: 1,
          ip: req.ip,
          transaction
        })

        await orderService.markOrderSpendLogSettled(order.order_id, transaction)

        await order.update({ status: 4 }, { transaction })

        currentBalance = afterBalance
        currentFrozen = afterFrozen
      }

      const currentTaskForce = Number(user.task_force)
      await user.update({
        balance: currentBalance,
        frozen_balance: currentFrozen,
        task_force: (Number.isFinite(currentTaskForce) ? currentTaskForce : 0) + 1
      }, { transaction })

      await transaction.commit()
      return this.success(null)
    } catch (error) {
      await transaction.rollback()
      throw error
    }
  }

  async getUserTask(req) {
    try {
      const { params: { id: userId } } = req
      const user = await User.findByPk(userId)
      if (!user) {
        throw new Error('用户不存在')
      }

      const userTask = await UserTask.findOne({
        where: { user_id: userId }
      })

      return this.success(userTask || null)
    } catch (error) {
      return this.fail(error)
    }
  }

  async saveUserTask(req) {
    const { params: { id: userId }, body: data, user: { id: admin_id } } = req
    const user = await User.findByPk(userId)
    if (!user) {
      throw new Error('用户不存在')
    }

    const transaction = await sequelize.transaction()

    try {
      const existingTask = await UserTask.findOne({
        where: { user_id: userId },
        transaction
      })

      const taskData = {
        user_id: userId,
        status: data.status || 0,
        start_after: data.start_after || 0,
        continuous_order: data.continuous_order ? JSON.stringify(data.continuous_order) : null,
        lucky_order: data.lucky_order ? JSON.stringify(data.lucky_order) : null,
        admin_id: admin_id
      }

      let result

      if (existingTask) {
        result = await existingTask.update(taskData, { transaction })
      } else {
        result = await UserTask.create(taskData, { transaction })
      }

      await transaction.commit()
      return this.success(result)
    } catch (error) {
      await transaction.rollback()
      throw error
    }
  }

  async buildUserAccessCondition(adminId, roleId, additionalWhere = {}) {
    const whereCondition = { ...additionalWhere }

    if (roleId !== 1) {
      const allAccessibleUserIds = await this.getAllAccessibleUserIdsLegacy(adminId)

      whereCondition[Op.or] = [
        { admin_id: adminId },
        { id: allAccessibleUserIds }
      ]
    }

    return whereCondition
  }

  async getAllAccessibleUserIdsLegacy(adminId) {
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

  async getMoneyLogSum(userIds, type) {
    if (!userIds || userIds.length === 0) return 0

    const result = await MoneyLog.sum('amount', {
      where: {
        user_id: Array.isArray(userIds) ? { [Op.in]: userIds } : userIds,
        type,
        status: 1
      }
    })

    return Number(result || 0)
  }

  async getTeamLevelStats(parentIds) {
    if (!parentIds || parentIds.length === 0) {
      return { count: 0, recharge: 0, withdraw: 0, commission: 0, userIds: [] }
    }

    const users = await User.findAll({
      where: { superior_id: { [Op.in]: parentIds } },
      attributes: ['id']
    })

    const userIds = users.map(u => u.id)
    const count = userIds.length

    if (count === 0) {
      return { count: 0, recharge: 0, withdraw: 0, commission: 0, userIds: [] }
    }

    const [recharge, withdraw, commission] = await Promise.all([
      this.getMoneyLogSum(userIds, 1),
      this.getMoneyLogSum(userIds, 2),
      this.getMoneyLogSum(userIds, 3)
    ])

    return { count, recharge, withdraw, commission, userIds }
  }

  async enrichUserWithStats(user) {
    const userData = user.toJSON ? user.toJSON() : user
    const wallet = await Wallet.findOne({ where: { user_id: userData.id } })
    const completedTasks = await Order.count({
      where: { user_id: userData.id, task_force: userData.task_force, status: 1 }
    })

    const [rechargeAmount, withdrawAmount, commission] = await Promise.all([
      this.getMoneyLogSum(userData.id, 1),
      this.getMoneyLogSum(userData.id, 2),
      this.getMoneyLogSum(userData.id, 3)
    ])

    const userTask = await UserTask.findOne({ where: { user_id: userData.id, status: 1 } })

    let ipInfo = { ip: null, location: null }
    if (userData.other && userData.other.last_login && userData.other.last_login.ip) {
      const ip = userData.other.last_login.ip
      const location = getIpLocation(ip)
      ipInfo = {
        ip: ip,
        location: location,
        login_time: userData.other.last_login.time || null
      }
    } else if (userData.other && userData.other.register && userData.other.register.ip) {
      const ip = userData.other.register.ip
      const location = getIpLocation(ip)
      ipInfo = {
        ip: ip,
        location: location,
        login_time: userData.other.register.time || null
      }
    }

    let luckyOrderAmount = 0
    let balanceDifference = null

    if (userTask?.lucky_order) {
      try {
        const luckyOrderData = JSON.parse(userTask.lucky_order)
        if (luckyOrderData?.product_id) {
          const product = await Product.findByPk(luckyOrderData.product_id)
          if (product) {
            luckyOrderAmount = parseFloat(product.price)
            balanceDifference = parseFloat(userData.balance) - luckyOrderAmount
          }
        }
      } catch (e) {
        console.error('幸运订单数据解析失败:', e)
      }
    } else {
      const luckyOrder = await Order.findOne({
        where: { user_id: userData.id, status: 0, is_lucky: 1 }
      })
      if (luckyOrder) {
        luckyOrderAmount = parseFloat(luckyOrder.order_price)
        balanceDifference = parseFloat(userData.balance)
      }
    }

    // 计算总收益
    const profit = parseFloat(await Order.sum('order_commission', {
      where: {
        user_id: userData.id,
        status: 1
      }
    }) || 0)

    return {
      ...userData,
      completed_tasks: completedTasks,
      total_tasks: 60,
      recharge_amount: rechargeAmount,
      withdraw_amount: withdrawAmount,
      commission: commission,
      transactions_amount: luckyOrderAmount,
      balance_difference: balanceDifference,
      profit: profit,
      ip_address: ipInfo
    }
  }

  async getAgentUserIds(userId) {
    try {
      const directUser = await User.findByPk(userId)
      if (!directUser) return []

      const allSubUserIds = await this.getAllAccessibleUserIdsLegacy(userId)
      return [userId, ...allSubUserIds]
    } catch (error) {
      console.error('获取代理用户ID失败:', error)
      return []
    }
  }

  async updateBankCard(req) {
    const { id: userId } = req.params;
    const { id: bankCardId, type, name, paypay_id, bank_name, branch_name, branch_code, account_number } = req.body;

    const user = await User.findByPk(userId);
    if (!user) {
      throw new Error('用户不存在');
    }

    const bankCard = await UserBank.findOne({
      where: { id: bankCardId, user_id: userId }
    });
    if (!bankCard) {
      throw new Error('银行卡信息不存在');
    }

    if (!name) {
      throw new Error('持卡人姓名不能为空');
    }

    if (type === 0) {
      if (!paypay_id) {
        throw new Error('PayPay ID不能为空');
      }
      await bankCard.update({ name, paypay_id });
    } else {
      if (!bank_name) {
        throw new Error('银行名称不能为空');
      }
      if (!account_number) {
        throw new Error('账户号不能为空');
      }

      await bankCard.update({
        name,
        bank_name,
        branch_name: branch_name || null,
        branch_code: branch_code || null,
        account_number
      });
    }

    const updatedBankCard = await UserBank.findByPk(bankCardId);
    return this.success(updatedBankCard);
  }

  async getAdminList(req) {
    try {
      const admins = await Admin.findAll({
        attributes: ['id', 'username'],
        where: {
          status: 1
        },
        order: [['id', 'ASC']]
      })

      return this.success({
        list: admins
      })
    } catch (error) {
      throw error
    }
  }

  generateInviteCode(length = 6) {
    const characters = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ'
    let result = ''
    const randomBytes = crypto.randomBytes(length)

    for (let i = 0; i < length; i++) {
      const randomIndex = randomBytes[i] % characters.length
      result += characters.charAt(randomIndex)
    }

    return result
  }

}

module.exports = new UserService() 
