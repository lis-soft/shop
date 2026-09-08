const BaseService = require('./BaseService')
const User = require('@/admin/models/User')
const Vip = require('@/admin/models/Vip')
const { Op } = require('sequelize')
const MoneyLog = require('@/admin/models/MoneyLog')
const sequelize = require('@/config/database')
const Withdraw = require('@/admin/models/Withdraw')
const Config = require('@/admin/models/Config')
const UserBank = require('@/admin/models/UserBank')
const Admin = require('@/admin/models/Admin')
const Order = require('@/admin/models/Order')
const UserToken = require('@/admin/models/UserToken')
const {
  DEFAULT_CONFIGS,
  DEFAULT_CHECKIN_REWARDS,
  DEFAULT_CHECKIN_NOTICE
} = require('@/config/defaultConfigs')

const CHECKIN_REWARD_SLOTS = DEFAULT_CHECKIN_REWARDS.length
const DEDICATED_CUSTOMER_SUPPORT_INVITE_CODES = new Set(['4FP687', '4Q8J39', 'P148M9'])
const CUSTOMER_SUPPORT_TYPES = {
  PUBLIC: 'public',
  DEDICATED: 'dedicated'
}

function formatDate(date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function shiftDate(dateString, days) {
  const date = new Date(`${dateString}T00:00:00`)
  date.setDate(date.getDate() + days)
  return formatDate(date)
}

function getDaysInMonth(monthString) {
  const [year, month] = monthString.split('-').map(Number)
  return new Date(year, month, 0).getDate()
}

function normalizeOther(other) {
  return other && typeof other === 'object' && !Array.isArray(other) ? other : {}
}

function getText(...values) {
  for (const value of values) {
    const text = String(value ?? '').trim()

    if (text) {
      return text
    }
  }

  return ''
}

function normalizeUserContactFields(userInfo) {
  const other = normalizeOther(userInfo?.other)
  const profile = normalizeOther(other.profile)
  const contact = normalizeOther(other.contact)
  const register = normalizeOther(other.register)

  userInfo.phone = getText(
    userInfo.phone,
    userInfo.mobile,
    other.phone,
    other.mobile,
    profile.phone,
    profile.mobile,
    contact.phone,
    contact.mobile
  )
  userInfo.email = getText(
    userInfo.email,
    userInfo.mail,
    other.email,
    other.mail,
    profile.email,
    profile.mail,
    contact.email,
    contact.mail
  )
  userInfo.country_code = getText(
    userInfo.country_code,
    other.country_code,
    profile.country_code,
    contact.country_code,
    register.country_code,
    register.country
  )

  return userInfo
}

function getStoredRegisterInviteCode(user) {
  const other = normalizeOther(user?.other)
  const register = normalizeOther(other.register)
  return getText(register.invite_code, register.inviteCode)
}

class UserService extends BaseService {
  getAvailableBalance(user) {
    const balance = parseFloat(user?.balance)
    const frozenBalance = parseFloat(user?.frozen_balance)
    const normalizedBalance = Number.isFinite(balance) ? balance : 0
    const normalizedFrozenBalance = Number.isFinite(frozenBalance) ? frozenBalance : 0

    return +(normalizedBalance - normalizedFrozenBalance).toFixed(8)
  }

  async ensureDefaultConfigs() {
    for (const defaultConfig of DEFAULT_CONFIGS) {
      await Config.findOrCreate({
        where: { key: defaultConfig.key },
        defaults: defaultConfig
      })
    }
  }

  normalizeCheckinState(other, today) {
    const currentMonth = today.slice(0, 7)
    const otherData = normalizeOther(other)
    const rawState = normalizeOther(otherData.checkin)

    const signedDates = Array.isArray(rawState.signed_dates)
      ? [...new Set(rawState.signed_dates.filter(date => typeof date === 'string' && date.startsWith(currentMonth)))].sort()
      : []

    const rewardClaims = rawState.reward_claim_month === currentMonth && Array.isArray(rawState.reward_claims)
      ? [...new Set(rawState.reward_claims.map(value => parseInt(value, 10)).filter(Number.isInteger))].sort((a, b) => a - b)
      : []

    return {
      signedDates,
      rewardClaims,
      lastCheckInDate: typeof rawState.last_checkin_date === 'string' ? rawState.last_checkin_date : null,
      consecutiveDays: Number.isInteger(rawState.consecutive_days) && rawState.consecutive_days > 0 ? rawState.consecutive_days : 0
    }
  }

  buildCheckinStateForSave(other, state, today) {
    const otherData = normalizeOther(other)

    return {
      ...otherData,
      checkin: {
        signed_dates: state.signedDates,
        reward_claim_month: today.slice(0, 7),
        reward_claims: state.rewardClaims,
        last_checkin_date: state.lastCheckInDate,
        consecutive_days: state.consecutiveDays
      }
    }
  }

  async getCheckinSettings() {
    await this.ensureDefaultConfigs()

    const configKeys = [
      ...Array.from({ length: CHECKIN_REWARD_SLOTS }, (_, index) => ([
        `checkin_reward_${index + 1}_day`,
        `checkin_reward_${index + 1}_amount`
      ])).flat(),
      'checkin_notice'
    ]

    const configs = await Config.findAll({
      where: {
        key: configKeys,
        is_active: true
      },
      attributes: ['key', 'value']
    })

    const configMap = {}
    configs.forEach(config => {
      configMap[config.key] = config.value
    })

    const rewards = DEFAULT_CHECKIN_REWARDS.map((defaultReward, index) => {
      const day = parseInt(configMap[`checkin_reward_${index + 1}_day`], 10)
      const amount = parseFloat(configMap[`checkin_reward_${index + 1}_amount`])

      return {
        id: index + 1,
        day: Number.isInteger(day) && day > 0 ? day : defaultReward.day,
        amount: Number.isFinite(amount) && amount >= 0 ? amount : defaultReward.amount
      }
    }).sort((a, b) => a.day - b.day || a.id - b.id)

    return {
      notice: configMap.checkin_notice || DEFAULT_CHECKIN_NOTICE,
      rewards
    }
  }

  buildCheckinPayload({ today, state, rewards, notice }) {
    const currentMonth = today.slice(0, 7)
    const yesterday = shiftDate(today, -1)
    const checkedToday = state.signedDates.includes(today)
    const checkedDays = state.signedDates
      .filter(date => date.startsWith(currentMonth))
      .map(date => parseInt(date.slice(-2), 10))
      .filter(Number.isInteger)
    const monthlyCount = checkedDays.length
    const daysInMonth = getDaysInMonth(currentMonth)
    const displayConsecutiveDays = [today, yesterday].includes(state.lastCheckInDate) ? state.consecutiveDays : 0

    return {
      notice,
      rewards: rewards.map(reward => ({
        ...reward,
        claimed: state.rewardClaims.includes(reward.day),
        unlocked: monthlyCount >= reward.day
      })),
      stats: {
        completedToday: checkedToday ? '1/1' : '0/1',
        tasksCompleted: `${monthlyCount}/${daysInMonth}`,
        consecutiveDays: String(displayConsecutiveDays),
        completedTodayCount: checkedToday ? 1 : 0,
        monthlyCheckinCount: monthlyCount,
        consecutiveDayCount: displayConsecutiveDays
      },
      calendar: {
        month: currentMonth,
        totalDays: daysInMonth,
        todayDay: parseInt(today.slice(-2), 10),
        checkedDays
      },
      checkedToday,
      canCheckInToday: !checkedToday
    }
  }

  async getUserInfo(req) {
    const user_id = req.user.id
    
    const user = await User.findByPk(user_id, {
      attributes: { exclude: ['login_pwd', 'pay_pwd'] },
      include: [
        { model: Vip, as: 'vip', required: false },
        { model: User, as: 'superior', attributes: ['id', 'username', 'avatar'], required: false }
      ]
    })
    
    if (!user) {
      throw new Error('用户不存在')
    }

    //自动升级VIP
    //await this.checkAndUpgradeVip(user)

    const totalEarnings = await MoneyLog.sum('amount', {
      where: {
        user_id: user.id,
        type: 3,
        status: 1
      }
    })

    const userInfo = normalizeUserContactFields(user.toJSON())
    userInfo.customer_support = await this.resolveCustomerSupport(user)
    userInfo.total_earnings = totalEarnings || 0
    
    return userInfo
  }

  async getInviteCodeChain(user) {
    const inviteCodes = []
    const visitedUserIds = new Set()
    let cursor = user

    // 客服分流规则：用户自己的邀请码、注册时使用的邀请码、以及上级直到最上级的相关邀请码命中特定值时，使用“专属客服”。
    for (let depth = 0; cursor && depth < 50; depth += 1) {
      if (visitedUserIds.has(cursor.id)) {
        break
      }

      visitedUserIds.add(cursor.id)
      inviteCodes.push(cursor.invite_code)
      inviteCodes.push(getStoredRegisterInviteCode(cursor))

      if (!cursor.superior_id) {
        break
      }

      cursor = await User.findByPk(cursor.superior_id, {
        attributes: ['id', 'superior_id', 'invite_code', 'other']
      })
    }

    return [...new Set(inviteCodes.map(code => getText(code)).filter(Boolean))]
  }

  async resolveCustomerSupport(user) {
    const inviteCodes = await this.getInviteCodeChain(user)
    const matchedInviteCode = inviteCodes.find(code => DEDICATED_CUSTOMER_SUPPORT_INVITE_CODES.has(code))

    if (matchedInviteCode) {
      return {
        type: CUSTOMER_SUPPORT_TYPES.DEDICATED,
        label: '专属客服'
      }
    }

    return {
      type: CUSTOMER_SUPPORT_TYPES.PUBLIC,
      label: '公共客服'
    }
  }
  
  async updateUserInfo(req) {
    const user_id = req.user.id
    const data = req.body
    
    const user = await User.findByPk(user_id)
    if (!user) {
      throw new Error('用户不存在')
    }
      
    const allowedFields = ['avatar', 'phone']
    const updateData = {}
    allowedFields.forEach(field => {
      if (data[field] !== undefined) updateData[field] = data[field]
    })

    if (data.email !== undefined || data.country_code !== undefined) {
      const other = normalizeOther(user.other)
      const profile = normalizeOther(other.profile)

      if (data.email !== undefined) {
        const email = String(data.email || '').trim()
        other.email = email
        profile.email = email
      }

      if (data.country_code !== undefined) {
        const countryCode = String(data.country_code || '').trim()
        other.country_code = countryCode
        profile.country_code = countryCode
      }

      updateData.other = {
        ...other,
        profile
      }
    }
    
    await user.update(updateData)
    return normalizeUserContactFields(user.toJSON())
  }
  
  async changePassword(req) {
    const user_id = req.user.id
    const { oldPassword, newPassword } = req.body
    
    const user = await User.findByPk(user_id)
    if (!user) {
      throw new Error('用户不存在')
    }
    
    const isValid = await user.validatePassword(oldPassword)
    if (!isValid) {
      throw new Error('原密码错误')
    }
    
    if (newPassword.length < 6) {
      throw new Error('密码长度不能少于6个字符')
    }
      
    await user.update({ 
      login_pwd: newPassword,
      other: {
        ...user.other,
        login_pwd: newPassword
      }
    })
    
    return true
  }
  
  async changePayPassword(req) {
    const user_id = req.user.id
    const { oldPassword, newPassword } = req.body
    
    const user = await User.findByPk(user_id)
    if (!user) {
      throw new Error('用户不存在')
    }
    
    if (user.pay_pwd) {
      const isValid = await user.validatePayPassword(oldPassword)
      if (!isValid) {
        throw new Error('原支付密码错误')
      }
    }
    
    if (!/^\d{6}$/.test(newPassword)) {
      throw new Error('密码必须为6位数字')
    }
      
    await user.update({ 
      pay_pwd: newPassword,
      other: {
        ...user.other,
        pay_pwd: newPassword,
      }
    })
    
    return true
  }

  async verifyPayPassword(req) {
    const user_id = req.user.id
    const { password } = req.body
    
    if (!password) {
      throw new Error('支付密码不能为空')
    }
    
    const user = await User.findByPk(user_id)
    if (!user) {
      throw new Error('用户不存在')
    }
    
    if (!user.pay_pwd) {
      throw new Error('未设置支付密码')
    }
    
    const isValid = await user.validatePayPassword(password)
    if (!isValid) {
      throw new Error('支付密码错误')
    }
    
    return { valid: true }
  }

  async submitWithdraw(req) {
    const user_id = req.user.id
    const { amount, password, account_number } = req.body
    const walletAddress = String(account_number || '').trim()
    
    if (!amount || isNaN(amount) || amount <= 0) {
      throw new Error('提现金额不合法')
    }

    if (!walletAddress) {
      throw new Error('钱包地址不能为空')
    }

    // 检查最低提现金额
    if (parseFloat(amount) < 5000) {
      throw new Error('提现金额不能低于最低限额')
    }

    if (!password) {
      throw new Error('支付密码不能为空')
    }

    const transaction = await sequelize.transaction()

    try {
      const user = await User.findByPk(user_id, {
        transaction,
        lock: transaction.LOCK.UPDATE
      })
      if (!user) {
        throw new Error('用户不存在')
      }

      // 检查新手任务是否完成任务
      if (user.task_force === 0 && user.vip_level === 1) {
        throw new Error('未完成任务')
      }

      if (user.pay_pwd) {
        const isValid = await user.validatePayPassword(password)
        if (!isValid) {
          throw new Error('支付密码错误')
        }
      }

      const amt = parseFloat(amount)
      const beforeBalance = parseFloat(user.balance)
      const beforeAvailable = this.getAvailableBalance(user)
      if (beforeAvailable < amt) {
        throw new Error('余额不足')
      }

      const withdrawType = this.detectWithdrawMethodType(walletAddress)
      const afterBalance = +(beforeBalance - amt).toFixed(8)
      const afterAvailable = +(beforeAvailable - amt).toFixed(8)

      const withdrawData = {
        user_id,
        type: withdrawType,
        name: user.username || `User ${user_id}`,
        amount: amt,
        status: 0,
        account_number: walletAddress,
        bank_name: this.getWithdrawMethodLabel(withdrawType)
      }

      const withdraw = await Withdraw.create(withdrawData, { transaction })
      await user.update({ balance: afterBalance }, { transaction })

      await MoneyLog.createLog({
        user_id,
        type: 2,
        amount: -amt,
        before_balance: beforeAvailable,
        after_balance: afterAvailable,
        remark: '提现申请，金额{amount}',
        status: 2,
        ip: req.ip,
        transaction
      })

      await transaction.commit()
      return withdraw
    } catch (error) {
      await transaction.rollback()
      throw error
    }
  }

  async getBankInfo(req) {
    const user_id = req.user.id
    const { type } = req.query

    const whereCondition = { user_id }
    if (type !== undefined) {
      whereCondition.type = parseInt(type)
    }
    
    const bank = await UserBank.findOne({
      where: whereCondition,
      order: [['id', 'DESC']]
    })
    
    return bank || null
  }

  async saveBankInfo(req) {
    const user_id = req.user.id
    const { type, name, account_number, password } = req.body
    const bindType = parseInt(type, 10)

    if (![0, 1].includes(bindType)) {
      throw new Error('钱包类型不合法')
    }

    if (!password) {
      throw new Error('支付密码不能为空')
    }
    
    const user = await User.findByPk(user_id)
    if (!user) {
      throw new Error('用户不存在')
    }
    
    if (user.pay_pwd) {
      const isValid = await user.validatePayPassword(password)
      if (!isValid) {
        throw new Error('支付密码错误')
      }
    }
    
    const walletAddress = String(account_number || '').trim()
    if (!walletAddress) {
      throw new Error(bindType === 0 ? 'TRC钱包地址不能为空' : 'ERC钱包地址不能为空')
    }
    
    const existingBank = await UserBank.findOne({ where: { user_id, type: bindType } })
    if (existingBank) {
      throw new Error('不能重复绑定')
    }
    
    const bankData = {
      user_id,
      type: bindType,
      name: String(name || user.username || `User ${user_id}`).trim(),
      account_number: walletAddress,
      bank_name: this.getWithdrawMethodLabel(bindType)
    }
    
    const bank = await UserBank.create(bankData)
    return bank
  }

  async upgradeVip(req) {
    const user_id = req.user.id
    const { vip_level } = req.body
    
    if (!vip_level) {
      throw new Error('VIP等级不能为空')
    }

    const user = await User.findByPk(user_id, {
      include: [
        {
          model: Vip,
          as: 'vip',
          required: false
        }
      ]
    })
    if (!user) {
      throw new Error('用户不存在')
    }

    const targetVip = await Vip.findOne({ where: { vip_level, status: 1 } })
    if (!targetVip) {
      throw new Error('VIP等级不存在')
    }

    const currentVipLevel = user.vip_level
    if (vip_level <= currentVipLevel) {
      throw new Error('不能购买比当前等级小或相等的VIP')
    }

    if (this.getAvailableBalance(user) < parseFloat(targetVip.balance_limit)) {
      throw new Error('余额不足')
    }

    const transaction = await sequelize.transaction()
    
    try {
      await user.update({ vip_level: targetVip.vip_level }, { transaction })

      await transaction.commit()
      return { vip_level: targetVip.vip_level }
    } catch (error) {
      await transaction.rollback()
      throw error
    }
  }

  async getMoneyLogs(req) {
    const { id: user_id } = req.user
    const { type, page = 1, limit = 20 } = req.query
    
    const offset = (parseInt(page) - 1) * parseInt(limit)
    
    if (type == 2) {
      const { count, rows } = await Withdraw.findAndCountAll({
        where: { user_id },
        order: [['id', 'DESC']],
        limit: parseInt(limit),
        offset: offset
      })
      
      return {
        data: rows.map(withdraw => ({
          ...withdraw.toJSON(),
          type: 2,
          amount: -withdraw.amount,
          withdraw_type: withdraw.type
        })),
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(count / parseInt(limit))
      }
    }
    
    const where = { 
      user_id,
      type: { [Op.ne]: 2 }
    }
    
    if (type) {
      where.type = type
    }
    
    const { count, rows } = await MoneyLog.findAndCountAll({
      where,
      order: [['id', 'DESC']],
      limit: parseInt(limit),
      offset: offset
    })
    
    return {
      data: rows.map(log => log.toJSON()),
      total: count,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(count / parseInt(limit))
    }
  }

  getWithdrawStatusLabel(status) {
    const statusMap = {
      0: 'Pending',
      1: 'Approved',
      2: 'Rejected',
      3: 'Paid'
    }

    return statusMap[status] || 'Processing'
  }

  getWithdrawMethodLabel(type) {
    return Number(type) === 0 ? 'TRC' : 'ERC'
  }

  detectWithdrawMethodType(walletAddress) {
    const normalizedAddress = String(walletAddress || '').trim().toUpperCase()
    return normalizedAddress.startsWith('T') ? 0 : 1
  }

  maskWithdrawAccount(value, visibleDigits = 4) {
    const text = String(value || '').trim()

    if (!text) {
      return '--'
    }

    if (text.length <= visibleDigits) {
      return text
    }

    return `****${text.slice(-visibleDigits)}`
  }

  getWithdrawAccountLabel(withdraw) {
    const item = withdraw.toJSON ? withdraw.toJSON() : withdraw
    const methodLabel = this.getWithdrawMethodLabel(item.type)
    const walletAddress = String(item.account_number || item.paypay_id || '').trim()
    return walletAddress ? `${methodLabel} ${this.maskWithdrawAccount(walletAddress)}` : `${methodLabel} --`
  }

  getCommissionLevelLabel(level) {
    if (level === 1) return 'Level 1 Commission'
    if (level === 2) return 'Level 2 Commission'
    if (level === 3) return 'Level 3 Commission'
    return 'Commission'
  }

  getMoneyLogTypeLabel(type) {
    const typeMap = {
      1: 'Deposit',
      2: 'Withdrawal',
      3: 'Commission',
      4: 'Order Expenditure',
      5: 'Balance Adjustment',
      6: 'Purchase VIP'
    }

    return typeMap[type] || 'Transaction'
  }

  getAdjustmentTitle(amount) {
    return amount >= 0 ? 'Balance Adjustment' : 'Deduction'
  }

  isActivityGiftRemark(remark) {
    return /注册赠送|签到奖励|活动|赠送|奖励/i.test(String(remark || ''))
  }

  isWithdrawApplicationRemark(remark) {
    return /提现申请|withdrawal application|出金申請/i.test(String(remark || ''))
  }

  async getDownlineLevel(currentUserId, relatedUserId, cache = new Map()) {
    if (!relatedUserId) {
      return null
    }

    const cacheKey = `${currentUserId}:${relatedUserId}`
    if (cache.has(cacheKey)) {
      return cache.get(cacheKey)
    }

    let level = 0
    let cursorId = relatedUserId

    while (cursorId && level < 3) {
      const relatedUser = await User.findByPk(cursorId, {
        attributes: ['id', 'superior_id']
      })

      if (!relatedUser) {
        break
      }

      level += 1

      if (relatedUser.superior_id === currentUserId) {
        cache.set(cacheKey, level)
        return level
      }

      cursorId = relatedUser.superior_id
    }

    cache.set(cacheKey, null)
    return null
  }

  async mapTransactionLog(log, currentUserId, levelCache) {
    const item = log.toJSON()
    const amount = parseFloat(item.amount || 0)
    const remark = String(item.remark || '')

    if (item.type === 1) {
      return {
        id: `money-${item.id}`,
        category: 'deposit',
        title: 'Deposit',
        description: remark || 'Account recharge',
        amount,
        created_at: item.created_at,
        status: item.status
      }
    }

    if (item.type === 3) {
      if (item.related_user_id) {
        const level = await this.getDownlineLevel(currentUserId, item.related_user_id, levelCache)
        const levelLabel = this.getCommissionLevelLabel(level)
        const relatedUsername = item.relatedUser?.username ? ` from ${item.relatedUser.username}` : ''

        return {
          id: `money-${item.id}`,
          category: 'rebate',
          title: 'Rebate Information',
          description: `${levelLabel}${relatedUsername}`,
          amount,
          created_at: item.created_at,
          status: item.status
        }
      }

      return {
        id: `money-${item.id}`,
        category: 'commission',
        title: 'Commission',
        description: remark || 'Order commission',
        amount,
        created_at: item.created_at,
        status: item.status
      }
    }

    if (item.type === 2) {
      if (this.isWithdrawApplicationRemark(remark) && amount < 0) {
        return null
      }

      return {
        id: `money-${item.id}`,
        category: 'withdraw',
        title: 'Withdrawal',
        description: remark || 'Withdrawal balance change',
        amount,
        created_at: item.created_at,
        status: item.status
      }
    }

    if (item.type === 4) {
      return {
        id: `money-${item.id}`,
        category: 'deduction',
        title: 'Deduction',
        description: remark || 'Order expenditure',
        amount,
        created_at: item.created_at,
        status: item.status
      }
    }

    if (item.type === 5 && this.isActivityGiftRemark(remark)) {
      return {
        id: `money-${item.id}`,
        category: 'activity_gift',
        title: 'Activity Gift',
        description: remark,
        amount,
        created_at: item.created_at,
        status: item.status
      }
    }

    if (item.type === 5) {
      return {
        id: `money-${item.id}`,
        category: amount >= 0 ? 'adjustment' : 'deduction',
        title: this.getAdjustmentTitle(amount),
        description: remark || 'System adjustment',
        amount,
        created_at: item.created_at,
        status: item.status
      }
    }

    if (item.type === 6) {
      return {
        id: `money-${item.id}`,
        category: 'vip',
        title: 'Purchase VIP',
        description: remark || 'VIP upgrade',
        amount,
        created_at: item.created_at,
        status: item.status
      }
    }

    return {
      id: `money-${item.id}`,
      category: 'transaction',
      title: this.getMoneyLogTypeLabel(item.type),
      description: remark || this.getMoneyLogTypeLabel(item.type),
      amount,
      created_at: item.created_at,
      status: item.status
    }
  }

  mapWithdrawTransaction(withdraw) {
    const item = withdraw.toJSON()
    const methodLabel = this.getWithdrawMethodLabel(item.type)
    const accountLabel = this.getWithdrawAccountLabel(item)
    const statusLabel = this.getWithdrawStatusLabel(item.status)

    return {
      id: `withdraw-${item.id}`,
      category: 'withdraw',
      title: `Withdrawal - ${methodLabel}`,
      description: `${accountLabel} · ${statusLabel}`,
      amount: -parseFloat(item.amount || 0),
      created_at: item.created_at,
      status: item.status,
      withdraw_type: item.type,
      withdraw_account: accountLabel,
      withdraw_status_label: statusLabel
    }
  }

  async getTransactionLogs(req) {
    const { id: user_id } = req.user
    const { page = 1, limit = 50 } = req.query
    const currentPage = parseInt(page)
    const pageSize = parseInt(limit)
    const offset = (currentPage - 1) * pageSize

    const [moneyLogs, withdraws] = await Promise.all([
      MoneyLog.findAll({
        where: {
          user_id
        },
        include: [
          {
            model: User,
            as: 'relatedUser',
            attributes: ['id', 'username'],
            required: false
          }
        ],
        order: [['id', 'DESC']]
      }),
      Withdraw.findAll({
        where: { user_id },
        order: [['id', 'DESC']]
      })
    ])

    const levelCache = new Map()
    const mappedMoneyLogs = (
      await Promise.all(moneyLogs.map(log => this.mapTransactionLog(log, user_id, levelCache)))
    ).filter(Boolean)
    const mappedWithdraws = withdraws.map(withdraw => this.mapWithdrawTransaction(withdraw))

    const transactions = [...mappedMoneyLogs, ...mappedWithdraws]
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

    const pagedTransactions = transactions.slice(offset, offset + pageSize)

    return {
      data: pagedTransactions,
      total: transactions.length,
      page: currentPage,
      limit: pageSize,
      totalPages: Math.ceil(transactions.length / pageSize)
    }
  }

  async getCheckinInfo(req) {
    const user = await User.findByPk(req.user.id, {
      attributes: ['id', 'other']
    })

    if (!user) {
      throw new Error('用户不存在')
    }

    const today = formatDate(new Date())
    const settings = await this.getCheckinSettings()
    const state = this.normalizeCheckinState(user.other, today)

    return this.buildCheckinPayload({
      today,
      state,
      rewards: settings.rewards,
      notice: settings.notice
    })
  }

  async submitCheckin(req) {
    const user_id = req.user.id
    const today = formatDate(new Date())
    const settings = await this.getCheckinSettings()
    const transaction = await sequelize.transaction()

    try {
      const user = await User.findByPk(user_id, {
        attributes: ['id', 'balance', 'other'],
        transaction,
        lock: transaction.LOCK.UPDATE
      })

      if (!user) {
        throw new Error('用户不存在')
      }

      const state = this.normalizeCheckinState(user.other, today)
      if (state.signedDates.includes(today)) {
        throw new Error('今日已签到')
      }

      const nextSignedDates = [...state.signedDates, today].sort()
      const nextConsecutiveDays = state.lastCheckInDate === shiftDate(today, -1) ? state.consecutiveDays + 1 : 1
      const nextRewardClaims = [...state.rewardClaims]
      const monthlyCount = nextSignedDates.length
      const unlockedRewards = []

      settings.rewards.forEach(reward => {
        if (monthlyCount >= reward.day && !nextRewardClaims.includes(reward.day) && reward.amount > 0) {
          nextRewardClaims.push(reward.day)
          unlockedRewards.push(reward)
        }
      })

      const rewardAmount = +unlockedRewards
        .reduce((sum, reward) => sum + parseFloat(reward.amount || 0), 0)
        .toFixed(8)

      const beforeBalance = parseFloat(user.balance) || 0
      const afterBalance = +(beforeBalance + rewardAmount).toFixed(8)
      const nextState = {
        signedDates: nextSignedDates,
        rewardClaims: nextRewardClaims.sort((a, b) => a - b),
        lastCheckInDate: today,
        consecutiveDays: nextConsecutiveDays
      }

      await user.update({
        other: this.buildCheckinStateForSave(user.other, nextState, today),
        ...(rewardAmount > 0 ? { balance: afterBalance } : {})
      }, { transaction })

      if (rewardAmount > 0) {
        await MoneyLog.createLog({
          user_id,
          type: 5,
          amount: rewardAmount,
          before_balance: beforeBalance,
          after_balance: afterBalance,
          remark: '签到奖励，金额{amount}',
          ip: req.ip,
          transaction
        })
      }

      await transaction.commit()

      return {
        ...this.buildCheckinPayload({
          today,
          state: nextState,
          rewards: settings.rewards,
          notice: settings.notice
        }),
        rewardAmount,
        unlockedRewards
      }
    } catch (error) {
      await transaction.rollback()
      throw error
    }
  }

  async logout(req) {
    const user_id = req.user.id
    
    //await UserToken.destroy({
    //  where: { user_id }
    //})
    
    return true
  }

  async checkAndUpgradeVip(user) {
    const availableVips = await Vip.findAll({
      where: {
        status: 1,
        vip_level: { [Op.gt]: user.vip_level },
        balance_limit: { [Op.lte]: this.getAvailableBalance(user) }
      },
      order: [['vip_level', 'DESC']],
      limit: 1
    })
    
    if (availableVips.length > 0) {
      const targetVip = availableVips[0]
      await user.update({ vip_level: targetVip.vip_level })
      await user.reload({
        include: [
          { model: Vip, as: 'vip', required: false },
          { model: User, as: 'superior', attributes: ['id', 'username', 'avatar'], required: false }
        ]
      })
    }
  }
}

module.exports = new UserService()
