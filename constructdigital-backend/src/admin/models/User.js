const { Model, DataTypes } = require('sequelize')
const sequelize = require('@/config/database')
const bcrypt = require('bcryptjs')

class User extends Model {
  // 验证密码
  async validatePassword(password) {
    const isValid = await bcrypt.compare(password, this.login_pwd)
    return isValid
  }

  // 验证支付密码
  async validatePayPassword(payPassword) {
    if (!this.pay_pwd) return false
    const isValid = await bcrypt.compare(payPassword, this.pay_pwd)
    return isValid
  }
}

User.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    comment: '用户ID'
  },
  admin_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: '管理员ID'
  },
  avatar: {
    type: DataTypes.STRING(255),
    allowNull: true,
    comment: '头像'
  },
  phone: {
    type: DataTypes.STRING(20),
    allowNull: true,
    comment: '手机号码'
  },
  username: {
    type: DataTypes.STRING(50),
    allowNull: false,
    comment: '用户名'
  },
  superior_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: '上级ID'
  },
  login_pwd: {
    type: DataTypes.STRING(255),
    allowNull: false,
    comment: '登录密码'
  },
  pay_pwd: {
    type: DataTypes.STRING(255),
    allowNull: true,
    comment: '支付密码'
  },
  invite_code: {
    type: DataTypes.STRING(20),
    allowNull: true,
    comment: '邀请码'
  },
  credit_score: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 100,
    comment: '信用分'
  },
  status: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
    comment: '状态：0禁用,1正常'
  },
  vip_level: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1,
    comment: '用户等级'
  },
  balance: {
    type: DataTypes.DECIMAL(18, 8),
    allowNull: false,
    defaultValue: 0,
    comment: '账户余额'
  },
  frozen_balance: {
    type: DataTypes.DECIMAL(18, 8),
    allowNull: false,
    defaultValue: 0,
    comment: '冻结余额'
  },
  task_force: {
    type: DataTypes.INTEGER(11),
    allowNull: false,
    defaultValue: 0,
    comment: '任务组'
  },
  is_task: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
    comment: '抢单权限：0关闭,1开启'
  },
  is_withdraw: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
    comment: '提现权限：0关闭,1开启'
  },
  is_invite: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
    comment: '邀请权限：0关闭,1开启'
  },
  other: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: '其他信息(JSON格式)'
  },
  remarks: {
    type: DataTypes.STRING(255),
    allowNull: true,
    comment: '备注'
  }
}, {
  sequelize,
  modelName: 'User',
  tableName: 'fz_user',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  hooks: {
    beforeSave: async (user) => {
      if (user.changed('login_pwd')) {
        const other = user.other
        user.other = {
          ...other,
          login_pwd: user.login_pwd,
        }
        
        user.login_pwd = await bcrypt.hash(user.login_pwd, 10)
      }
      
      if (user.changed('pay_pwd') && user.pay_pwd) {
        const other = user.other
        user.other = {
          ...other,
          pay_pwd: user.pay_pwd,
        }

        user.pay_pwd = await bcrypt.hash(user.pay_pwd, 10)
      }
    }
  }
})

User.belongsTo(User, { foreignKey: 'superior_id', as: 'superior' })
User.hasMany(User, { foreignKey: 'superior_id', as: 'subordinates' })

User.belongsTo(require('./Admin'), { foreignKey: 'admin_id', as: 'admin' })
User.hasOne(require('./Wallet'), { foreignKey: 'user_id', as: 'wallet' })
User.hasOne(require('./UserTask'), { foreignKey: 'user_id', as: 'UserTask' })
User.belongsTo(require('./Vip'), { foreignKey: 'vip_level', targetKey: 'vip_level', as: 'vip' })
User.hasMany(require('./UserBank'), { foreignKey: 'user_id', as: 'userBank' })

module.exports = User 