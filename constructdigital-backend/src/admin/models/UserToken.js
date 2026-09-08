const { DataTypes, Model } = require('sequelize')
const sequelize = require('@/config/database')

class UserToken extends Model {
  // 检查token是否过期
  isExpired() {
    return new Date() > this.expires_at
  }

  // 检查refresh token是否过期
  isRefreshExpired() {
    if (!this.refresh_expires_at) return true
    return new Date() > this.refresh_expires_at
  }

  // 更新最后使用时间
  async updateLastUsed() {
    this.last_used_at = new Date()
    await this.save()
  }

  // 使token失效
  async invalidate() {
    this.status = 0
    await this.save()
  }
}

UserToken.init({
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
  token: {
    type: DataTypes.STRING(255),
    allowNull: false,
    comment: '令牌值'
  },
  refresh_token: {
    type: DataTypes.STRING(255),
    allowNull: true,
    comment: '刷新令牌'
  },
  language: {
    type: DataTypes.STRING(10),
    allowNull: true,
    defaultValue: 'zh-cn',
    comment: '语言'
  },
  device_type: {
    type: DataTypes.ENUM('web', 'ios', 'android', 'h5'),
    defaultValue: 'h5',
    comment: '设备类型'
  },
  device_id: {
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: '设备唯一标识'
  },
  user_agent: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: '用户代理信息'
  },
  ip_address: {
    type: DataTypes.STRING(45),
    allowNull: true,
    comment: 'IP地址'
  },
  status: {
    type: DataTypes.TINYINT.UNSIGNED,
    defaultValue: 1,
    comment: '状态: 0=已失效, 1=有效'
  },
  login_time: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    comment: '登录时间'
  },
  expires_at: {
    type: DataTypes.DATE,
    allowNull: false,
    comment: '过期时间'
  },
  refresh_expires_at: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: '刷新令牌过期时间'
  },
  last_used_at: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: '最后使用时间'
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
  modelName: 'UserToken',
  tableName: 'fz_user_token',
  timestamps: false,
  indexes: [
    {
      fields: ['user_id']
    },
    {
      fields: ['token'],
      unique: true
    },
    {
      fields: ['refresh_token'],
      unique: true
    },
    {
      fields: ['device_id']
    },
    {
      fields: ['status']
    },
    {
      fields: ['expires_at']
    }
  ]
})

UserToken.belongsTo(require('./User'), { foreignKey: 'user_id', as: 'user' })
module.exports = UserToken
