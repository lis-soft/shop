const { Model, DataTypes } = require('sequelize')
const sequelize = require('@/config/database')
const User = require('./User')

class Withdraw extends Model {}

Withdraw.init({
  id: {
    type: DataTypes.INTEGER.UNSIGNED,
    primaryKey: true,
    autoIncrement: true,
    comment: 'ID'
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: '用户ID'
  },
  type: {
    type: DataTypes.TINYINT.UNSIGNED,
    allowNull: false,
    defaultValue: 1,
    comment: '类型: 0=PayPay, 1=银行卡'
  },
  paypay_id: {
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: 'PayPay账号ID'
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
    comment: '持卡人姓名'
  },
  bank_name: {
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: '银行名称'
  },
  branch_name: {
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: '支行名称'
  },
  branch_code: {
    type: DataTypes.STRING(50),
    allowNull: true,
    comment: '支行号'
  },
  account_number: {
    type: DataTypes.STRING(50),
    allowNull: true,
    comment: '账户号'
  },
  id_card: {
    type: DataTypes.STRING(30),
    allowNull: true,
    comment: '身份证号'
  },
  amount: {
    type: DataTypes.DECIMAL(18,8),
    allowNull: false,
    defaultValue: 0,
    comment: '提现金额'
  },
  status: {
    type: DataTypes.TINYINT,
    allowNull: false,
    defaultValue: 0,
    comment: '状态 0待审核 1已通过 2已拒绝 3已打款'
  },
  remarks: {
    type: DataTypes.STRING(255),
    allowNull: true,
    comment: '备注'
  },
  created_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
    comment: '创建时间'
  },
  updated_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
    comment: '更新时间'
  }
}, {
  sequelize,
  modelName: 'Withdraw',
  tableName: 'fz_withdraw',
  timestamps: false
})

// 添加与User模型的关联
Withdraw.belongsTo(User, {
  foreignKey: 'user_id',
  as: 'user'
})

module.exports = Withdraw 