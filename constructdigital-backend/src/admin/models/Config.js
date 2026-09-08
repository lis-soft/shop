const { DataTypes } = require('sequelize')
const sequelize = require('@/config/database')

const Config = sequelize.define('Config', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    comment: 'ID'
  },
  key: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true,
    comment: '配置键名'
  },
  value: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: '配置值'
  },
  type: {
    type: DataTypes.STRING(20),
    allowNull: true,
    defaultValue: 'string',
    comment: '配置类型: string, number, boolean, json, text, images'
  },
  group: {
    type: DataTypes.STRING(50),
    allowNull: true,
    defaultValue: 'system',
    comment: '配置分组'
  },
  group_description: {
    type: DataTypes.STRING(255),
    allowNull: true,
    comment: '分组描述'
  },
  description: {
    type: DataTypes.STRING(255),
    allowNull: true,
    comment: '配置描述'
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    allowNull: true,
    defaultValue: true,
    comment: '是否启用: 0禁用 1启用'
  },
  sort: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: 0,
    comment: '排序序号'
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
  tableName: 'fz_config',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  comment: '系统配置表'
})

module.exports = Config
