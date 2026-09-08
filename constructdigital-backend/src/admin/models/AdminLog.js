const { DataTypes } = require('sequelize')
const sequelize = require('@/config/database')
const Admin = require('./Admin')

const AdminLog = sequelize.define('AdminLog', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  adminId: {
    type: DataTypes.INTEGER,
    field: 'admin_id',
    allowNull: true,
    comment: '管理员ID'
  },
  ip: {
    type: DataTypes.STRING(50),
    allowNull: false,
    comment: 'IP地址'
  },
  method: {
    type: DataTypes.STRING(10),
    allowNull: false,
    comment: '请求方法'
  },
  path: {
    type: DataTypes.STRING(255),
    allowNull: false,
    comment: '请求路径'
  },
  params: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: '请求参数'
  },
  action: {
    type: DataTypes.STRING(100),
    allowNull: false,
    comment: '操作行为'
  },
  userAgent: {
    type: DataTypes.STRING(255),
    field: 'user_agent',
    allowNull: true,
    comment: '用户代理'
  },
  status: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: '响应状态码'
  },
  response: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: '响应内容'
  },
  createdAt: {
    type: DataTypes.DATE,
    field: 'created_at',
    defaultValue: DataTypes.NOW,
    comment: '创建时间'
  }
}, {
  tableName: 'fz_admin_log',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false
})

// 建立与Admin模型的关联
AdminLog.belongsTo(Admin, { foreignKey: 'adminId', as: 'admin' })

module.exports = AdminLog