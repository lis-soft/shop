const { DataTypes } = require('sequelize')
const sequelize = require('@/config/database')

const UserTask = sequelize.define('UserTask', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    comment: '主键ID'
  },
  admin_id: {
    type: DataTypes.INTEGER,
    comment: '管理员ID',
    defaultValue: 0
  },
  user_id: {
    type: DataTypes.INTEGER,
    comment: '用户ID',
    allowNull: false
  },
  continuous_order: {
    type: DataTypes.TEXT,
    comment: '连续订单',
    defaultValue: null
  },
  lucky_order: {
    type: DataTypes.TEXT,
    comment: '幸运订单',
    defaultValue: null
  },
  start_after: {
    type: DataTypes.INTEGER,
    comment: '在第几个订单之后开始',
    defaultValue: 0
  },
  status: {
    type: DataTypes.TINYINT,
    comment: '状态：0关闭，1开启',
    defaultValue: 1
  }
}, {
  tableName: 'fz_user_task',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
})

module.exports = UserTask 