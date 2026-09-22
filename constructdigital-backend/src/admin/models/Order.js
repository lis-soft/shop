const { Model, DataTypes } = require('sequelize')
const sequelize = require('@/config/database')
const User = require('./User')
const Product = require('./Product')

class Order extends Model {}

Order.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: '用户ID'
  },
  order_id: {
    type: DataTypes.STRING(50),
    allowNull: false,
    comment: '订单号'
  },
  task_force: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    comment: '任务组'
  },
  product_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: '商品ID'
  },
  product_title: {
    type: DataTypes.STRING(255),
    allowNull: false,
    comment: '商品名'
  },
  product_pic: {
    type: DataTypes.STRING(255),
    allowNull: true,
    comment: '商品图'
  },
  product_price: {
    type: DataTypes.DECIMAL(10,2),
    allowNull: false,
    comment: '商品价格'
  },
  order_nums: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1,
    comment: '订单数量'
  },
  order_price: {
    type: DataTypes.DECIMAL(10,2),
    allowNull: false,
    comment: '订单总价'
  },
  order_commission: {
    type: DataTypes.DECIMAL(10,2),
    allowNull: false,
    comment: '订单佣金'
  },
  is_lucky: {
    type: DataTypes.TINYINT,
    allowNull: false,
    defaultValue: 0,
    comment: '幸运订单 0-否 1-是'
  },
  is_manual: {
    type: DataTypes.TINYINT,
    allowNull: false,
    defaultValue: 0,
    comment: '卡单 0-否 1-是'
  },
  sequence_no: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    comment: '本轮订单序号'
  },
  settlement_held: {
    type: DataTypes.TINYINT,
    allowNull: false,
    defaultValue: 0,
    comment: '连单待统一结算 0-否 1-是'
  },
  status: {
    type: DataTypes.TINYINT,
    allowNull: false,
    defaultValue: 0,
    comment: '状态 0-已派单 1-已完成 2-待结算 3-已冻结 4-已解冻 5-待反佣'
  },
  created_at: {
    type: DataTypes.DATE,
    allowNull: true,
    defaultValue: DataTypes.NOW,
    comment: '创建时间'
  },
  updated_at: {
    type: DataTypes.DATE,
    allowNull: true,
    defaultValue: DataTypes.NOW,
    comment: '更新时间'
  }
}, {
  sequelize,
  modelName: 'Order',
  tableName: 'fz_order',
  timestamps: false
})

Order.belongsTo(User, { foreignKey: 'user_id', as: 'user' })
Order.belongsTo(Product, { foreignKey: 'product_id', as: 'product' })

module.exports = Order 