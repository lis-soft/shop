const { Model, DataTypes } = require('sequelize')
const sequelize = require('@/config/database')
const bcrypt = require('bcryptjs')

class Admin extends Model {
  // 验证密码
  async validatePassword(password) {
    const isValid = await bcrypt.compare(password, this.password)
    return isValid
  }
}

Admin.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  username: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true
  },
  password: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  realName: {
    type: DataTypes.STRING(50),
    field: 'real_name'
  },
  email: {
    type: DataTypes.STRING(100),
    validate: {
      isEmail: true
    }
  },
  mobile: {
    type: DataTypes.STRING(20)
  },
  avatar: {
    type: DataTypes.STRING(255)
  },
  status: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  role_id: {
    type: DataTypes.INTEGER,
    field: 'role_id',
    allowNull: true,
    defaultValue: null,
    comment: '权限组ID'
  },
}, {
  sequelize,
  modelName: 'Admin',
  tableName: 'fz_admin',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  hooks: {
    beforeSave: async (admin) => {
      if (admin.changed('password')) {
        admin.password = await bcrypt.hash(admin.password, 10)
      }
    }
  }
})

// 建立关联关系

module.exports = Admin 