const { DataTypes } = require('sequelize')
const sequelize = require('@/config/database')

const AdminRule = sequelize.define('AdminRule', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    comment: 'ID'
  },
  pid: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: false,
    defaultValue: 0,
    comment: '上级菜单'
  },
  type: {
    type: DataTypes.ENUM('menu_dir', 'menu', 'button'),
    allowNull: false,
    defaultValue: 'menu',
    comment: '类型:menu_dir=菜单目录,menu=菜单项,button=页面按钮'
  },
  title: {
    type: DataTypes.STRING(50),
    allowNull: false,
    comment: '标题'
  },
  name: {
    type: DataTypes.STRING(50),
    allowNull: false,
    comment: '规则名称'
  },
  path: {
    type: DataTypes.STRING(100),
    allowNull: false,
    comment: '路由路径'
  },
  icon: {
    type: DataTypes.STRING(50),
    allowNull: false,
    defaultValue: '',
    comment: '图标'
  },
  menu_type: {
    type: DataTypes.ENUM('tab', 'link', 'iframe'),
    allowNull: true,
    comment: '菜单类型:tab=选项卡,link=链接,iframe=Iframe'
  },
  url: {
    type: DataTypes.STRING(255),
    allowNull: false,
    defaultValue: '',
    comment: 'Url'
  },
  component: {
    type: DataTypes.STRING(100),
    allowNull: false,
    defaultValue: '',
    comment: '组件路径'
  },
  keepalive: {
    type: DataTypes.TINYINT.UNSIGNED,
    allowNull: false,
    defaultValue: 0,
    comment: '缓存:0=关闭,1=开启'
  },
  extend: {
    type: DataTypes.ENUM('none', 'add_rules_only', 'add_menu_only'),
    allowNull: false,
    defaultValue: 'none',
    comment: '扩展属性:none=无,add_rules_only=只添加为路由,add_menu_only=只添加为菜单'
  },
  remark: {
    type: DataTypes.STRING(255),
    allowNull: false,
    defaultValue: '',
    comment: '备注'
  },
  weigh: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    comment: '权重'
  },
  status: {
    type: DataTypes.TINYINT.UNSIGNED,
    allowNull: false,
    defaultValue: 1,
    comment: '状态:0=禁用,1=启用'
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
  tableName: 'fz_admin_rule',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  comment: '权限规则表'
})

// 定义关联关系
AdminRule.hasMany(AdminRule, {
  as: 'children',
  foreignKey: 'pid',
  sourceKey: 'id'
})

AdminRule.belongsTo(AdminRule, {
  as: 'parent',
  foreignKey: 'pid',
  targetKey: 'id'
})

module.exports = AdminRule
