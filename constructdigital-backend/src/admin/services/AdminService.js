const BaseService = require('@/admin/services/BaseService')
const Admin = require('@/admin/models/Admin')
const AdminGroup = require('@/admin/models/AdminGroup')
const { Op } = require('sequelize')
const { upload: uploadConfig } = require('@/config/config')
const User = require('@/admin/models/User')

class AdminService extends BaseService {
  async getList(req) {
    try {
      const { query: params } = req

      const result = await this.paginate(Admin, {
        params,
        searchFields: ['username', 'email', 'mobile', 'realName'],
        attributes: { exclude: ['password'] },
        order: [['id', 'DESC']]
      })

      const enrichedAdmins = await Promise.all(
        result.data.list.map(admin => this.enrichAdminWithGroup(admin))
      )

      return this.success({
        ...result.data,
        list: enrichedAdmins
      })
    } catch (error) {
      throw error
    }
  }

  async enrichAdminWithGroup(admin) {
    const adminData = admin.toJSON ? admin.toJSON() : admin
    
    if (adminData.role_id) {
      const adminGroup = await AdminGroup.findByPk(adminData.role_id, {
        attributes: ['id', 'name']
      })
      
      if (adminGroup) {
        adminData.adminGroup = adminGroup
      }
    }
    
    return adminData
  }

  async create(req) {
    try {
      const { body: data } = req
      
      const exists = await Admin.findOne({
        where: { username: data.username }
      })

      if (exists) {
        throw new Error('用户名已存在')
      }

      const adminData = {
        username: data.username,
        password: data.password,
        realName: data.name,
        mobile: data.phone,
        email: data.email,
        role_id: data.role_id,
        status: data.status
      }

      const admin = await Admin.create(adminData)
      return this.success(admin, '创建成功')
    } catch (error) {
      return this.fail(error)
    }
  }

  async update(req) {
    try {
      const { params: { id }, body: data } = req
      
      const admin = await Admin.findByPk(id)
      if (!admin) {
        throw new Error('管理员不存在')
      }

      if (data.username && data.username !== admin.username) {
        const exists = await Admin.findOne({
          where: { 
            username: data.username,
            id: { [Op.ne]: parseInt(id) }
          }
        })
        if (exists) {
          throw new Error('用户名已存在')
        }
      }

      const updateData = {
        username: data.username,
        realName: data.name,
        mobile: data.phone,
        email: data.email,
        role_id: data.role_id,
        status: data.status
      }

      await admin.update(updateData)
      return this.success(admin, '更新成功')
    } catch (error) {
      throw error
    }
  }

  async delete(req) {
    try {
      const { params: { id }, user: { id: currentUserId } } = req
      
      if (parseInt(id) === currentUserId) {
        throw new Error('不能删除自己')
      }

      const admin = await Admin.findByPk(id)
      if (!admin) {
        throw new Error('管理员不存在')
      }

      if (admin.username === 'admin') {
        throw new Error('超级管理员不能删除')
      }

      await admin.destroy()
      return this.success(null, '删除成功')
    } catch (error) {
      throw error
    }
  }

  async toggleStatus(req) {
    try {
      const { params: { id }, user: { id: currentUserId } } = req
      
      if (parseInt(id) === currentUserId) {
        throw new Error('不能修改自己的状态')
      }

      const admin = await Admin.findByPk(id)
      if (!admin) {
        throw new Error('管理员不存在')
      }

      await admin.update({ status: !admin.status })
      return this.success(admin, '状态更新成功')
    } catch (error) {
      throw error
    }
  }

  async getProfile(userId) {
    try {
      const user = await Admin.findByPk(userId, {
        attributes: [
          'id',
          'username',
          'mobile',
          'realName',
          'email',
          'avatar'
        ]
      })
      
      if (!user) {
        throw new Error('获取管理员信息失败：管理员不存在')
      }
      
      return this.success(user, '获取个人信息成功')
    } catch (error) {
      return this.fail(error)
    }
  }
  
  async updateProfile(userId, data) {
    try {
      const user = await Admin.findByPk(userId)
      
      if (!user) {
        throw new Error('更新失败：管理员不存在')
      }
      
      if (data.mobile && !/^1[3-9]\d{9}$/.test(data.mobile)) {
        throw new Error('手机号码格式不正确')
      }
      
      if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
        throw new Error('邮箱格式不正确')
      }
      
      const allowedFields = ['realName', 'mobile', 'email']
      const updateData = {}
      
      allowedFields.forEach(field => {
        if (data[field] !== undefined) {
          updateData[field] = data[field]
        }
      })
      
      await user.update(updateData)
      
      return this.success(user, '个人信息更新成功')
    } catch (error) {
      return this.fail(error)
    }
  }
  
  async updateAvatar(userId, file) {
    try {
      const user = await Admin.findByPk(userId)
  
      if (!user) {
        throw new Error('更新头像失败：管理员不存在')
      }
  
      if (!file) {
        throw new Error('请选择要上传的头像文件')
      }
  
      if (!uploadConfig.types.includes(file.mimetype)) {
        throw new Error('不支持的文件类型，请上传JPG/PNG格式的图片')
      }
  
      if (file.size > uploadConfig.max_size) {
        throw new Error(`文件大小不能超过${uploadConfig.max_size / 1024 / 1024}MB`)
      }
  
      const filename = file.filename
      const avatarUrl = `${file.destination}/${filename}`.replace(/\\/g, '/');
  
      user.avatar = avatarUrl
      await user.save()
  
      return this.success({ avatar: avatarUrl }, '头像更新成功')
    } catch (error) {
      return this.fail(error)
    }
  }  
  
  async updatePassword(userId, { oldPassword, newPassword }) {
    try {
      const user = await Admin.findByPk(userId)
      
      if (!user) {
        throw new Error('修改密码失败：管理员不存在')
      }
      
      if (!oldPassword || !newPassword) {
        throw new Error('请输入原密码和新密码')
      }
      
      if (newPassword.length < 6) {
        throw new Error('新密码长度不能少于6个字符')
      }
      
      const isValid = await user.validatePassword(oldPassword)
      if (!isValid) {
        throw new Error('原密码错误，请重新输入')
      }
      
      await user.update({ password: newPassword })
      
      return this.success(null, '密码修改成功')
    } catch (error) {
      return this.fail(error)
    }
  }
}

module.exports = new AdminService() 