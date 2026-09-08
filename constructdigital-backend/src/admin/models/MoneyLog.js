const { Model, DataTypes } = require('sequelize')
const sequelize = require('@/config/database')
const User = require('./User')
const UserToken = require('./UserToken')
const { t, normalizeLanguage } = require('@/api/lang')

class MoneyLog extends Model {
  static async createLog({
    user_id,
    type,
    amount,
    before_balance,
    after_balance,
    remark,
    order_id = null,
    status = 1,
    ip = null,
    related_user_id = null,
    transaction = null
  }) {
    let userToken = await UserToken.findOne({
      where: { user_id },
      order: [['id', 'DESC']],
      transaction
    })
    
    if (!userToken && transaction) {
      userToken = await UserToken.findOne({
        where: { user_id },
        order: [['id', 'DESC']]
      })
    }
    
    let userLanguage = 'ja-jp'
    if (userToken && userToken.language) {
      userLanguage = normalizeLanguage(userToken.language)
    }
    
    let translatedRemark = remark
    const paramMatches = remark.match(/\{(\w+)\}/g)
    
    if (paramMatches) {
      const params = {}
      paramMatches.forEach(match => {
        const key = match.slice(1, -1)
        if (key === 'amount') params[key] = Math.abs(amount)
        if (key === 'order_id') params[key] = order_id
      })
      translatedRemark = t(remark, userLanguage, params)
    } else {
      translatedRemark = t(remark, userLanguage)
    }
    
    return await MoneyLog.create({
      user_id,
      type,
      amount,
      before_balance,
      after_balance,
      remark: translatedRemark,
      order_id,
      status,
      ip,
      related_user_id
    }, { transaction })
  }
}

MoneyLog.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    comment: 'ID'
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: '用户ID'
  },
  related_user_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: '关联用户ID（佣金来源用户）'
  },
  type: {
    type: DataTypes.TINYINT,
    allowNull: false,
    comment: '类型 1-充值 2-提现 3-佣金收入 4-订单支出 5-系统调整 6-购买VIP'
  },
  amount: {
    type: DataTypes.DECIMAL(18, 8),
    allowNull: false,
    comment: '金额'
  },
  before_balance: {
    type: DataTypes.DECIMAL(18, 8),
    allowNull: false,
    comment: '变动前余额'
  },
  after_balance: {
    type: DataTypes.DECIMAL(18, 8),
    allowNull: false,
    comment: '变动后余额'
  },
  remark: {
    type: DataTypes.STRING(255),
    allowNull: true,
    comment: '备注'
  },
  order_id: {
    type: DataTypes.STRING(50),
    allowNull: true,
    comment: '关联订单号'
  },
  status: {
    type: DataTypes.TINYINT,
    allowNull: false,
    defaultValue: 1,
    comment: '状态 0-失败 1-成功 2-处理中'
  },
  ip: {
    type: DataTypes.STRING(50),
    allowNull: true,
    comment: '操作IP'
  }
}, {
  sequelize,
  modelName: 'MoneyLog',
  tableName: 'fz_money_log',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
})

// 关联关系
MoneyLog.belongsTo(User, { foreignKey: 'user_id', as: 'user' })
MoneyLog.belongsTo(User, { foreignKey: 'related_user_id', as: 'relatedUser' })

module.exports = MoneyLog 
