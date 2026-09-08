const { Model, DataTypes } = require('sequelize')
const sequelize = require('@/config/database')

class AdminGroup extends Model {
  // 获取权限规则ID数组
  getRulesArray() {
    if (!this.rules) return []
    try {
      return this.rules.split(',').map(id => parseInt(id)).filter(id => !isNaN(id))
    } catch (error) {
      return []
    }
  }

  // 设置权限规则ID数组
  setRulesArray(rulesArray) {
    if (Array.isArray(rulesArray)) {
      this.rules = rulesArray.join(',')
    } else {
      this.rules = ''
    }
  }

  // 检查是否有指定权限
  hasRule(ruleId) {
    const rulesArray = this.getRulesArray()
    return rulesArray.includes(parseInt(ruleId))
  }

  // 添加权限规则
  addRule(ruleId) {
    const rulesArray = this.getRulesArray()
    const id = parseInt(ruleId)
    if (!rulesArray.includes(id)) {
      rulesArray.push(id)
      this.setRulesArray(rulesArray)
    }
  }

  // 移除权限规则
  removeRule(ruleId) {
    const rulesArray = this.getRulesArray()
    const id = parseInt(ruleId)
    const index = rulesArray.indexOf(id)
    if (index > -1) {
      rulesArray.splice(index, 1)
      this.setRulesArray(rulesArray)
    }
  }
}

AdminGroup.init({
  id: {
    type: DataTypes.INTEGER.UNSIGNED,
    primaryKey: true,
    autoIncrement: true,
    comment: 'ID'
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
    comment: '组名'
  },
  rules: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: '权限规则ID',
    get() {
      const value = this.getDataValue('rules')
      return value || ''
    },
    set(value) {
      if (Array.isArray(value)) {
        this.setDataValue('rules', value.join(','))
      } else {
        this.setDataValue('rules', value || '')
      }
    }
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
  sequelize,
  modelName: 'AdminGroup',
  tableName: 'fz_admin_group',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  comment: '管理员角色分组表'
})

// 建立关联关系 - 只需要单方面关联
const Admin = require('./Admin')
AdminGroup.hasMany(Admin, {
  foreignKey: 'role_id',
  as: 'admins',
  constraints: false
})

module.exports = AdminGroup
