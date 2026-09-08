const { Model, DataTypes } = require('sequelize')
const sequelize = require('@/config/database')

class Wallet extends Model {}

Wallet.init({
  id: {
    type: DataTypes.INTEGER.UNSIGNED,
    primaryKey: true,
    autoIncrement: true,
    comment: '主键ID'
  },
  user_id: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: false,
    comment: '用户ID'
  },
  trx_balance: {
    type: DataTypes.DECIMAL(32, 6),
    allowNull: false,
    defaultValue: 0,
    comment: 'TRX余额'
  },
  usdt_balance: {
    type: DataTypes.DECIMAL(32, 6),
    allowNull: false,
    defaultValue: 0,
    comment: 'USDT余额'
  },
  wallet_address: {
    type: DataTypes.STRING(128),
    allowNull: false,
    comment: '钱包地址'
  },
  wallet_key: {
    type: DataTypes.STRING(256),
    allowNull: true,
    comment: '钱包私钥'
  }
}, {
  sequelize,
  modelName: 'Wallet',
  tableName: 'fz_wallet',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
})

module.exports = Wallet 