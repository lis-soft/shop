const { Model, DataTypes } = require('sequelize')
const sequelize = require('@/config/database')

class UserBank extends Model {}

UserBank.init({
  id: {
    type: DataTypes.BIGINT.UNSIGNED,
    primaryKey: true,
    autoIncrement: true,
    comment: 'ID'
  },
  user_id: {
    type: DataTypes.BIGINT.UNSIGNED,
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
    type: DataTypes.STRING(50),
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
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    comment: '创建时间'
  },
  updated_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    onUpdate: DataTypes.NOW,
    comment: '更新时间'
  }
}, {
  sequelize,
  modelName: 'UserBank',
  tableName: 'fz_user_bank',
  timestamps: false,
  underscored: true,
  indexes: [
    {
      fields: ['user_id']
    },
    {
      fields: ['type']
    }
  ]
})

module.exports = UserBank
