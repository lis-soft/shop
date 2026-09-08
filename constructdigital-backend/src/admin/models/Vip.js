const { Model, DataTypes } = require('sequelize')
const sequelize = require('@/config/database')

class Vip extends Model {}

Vip.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    comment: '主键ID'
  },
  vip_level: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: 'VIP等级序号'
  },
  vip_name: {
    type: DataTypes.STRING(50),
    allowNull: false,
    comment: 'VIP名称'
  },
  vip_image: {
    type: DataTypes.STRING(255),
    allowNull: true,
    comment: 'VIP图标'
  },
  balance_limit: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false,
    comment: '所需余额'
  },
  daily_sets: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: '每日任务组数'
  },
  task_count: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: '每组任务数量'
  },
  reward_rate: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: false,
    comment: '利润率（%）'
  },
  card_reward_rate: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: true,
    comment: '卡单利润率（%）'
  },
  min_salary: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false,
    comment: '最低可获得薪资（日元）'
  },
  status: {
    type: DataTypes.TINYINT,
    allowNull: false,
    defaultValue: 1,
    comment: '状态：0=禁用，1=启用'
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
  modelName: 'Vip',
  tableName: 'fz_vip',
  timestamps: false
})

module.exports = Vip
