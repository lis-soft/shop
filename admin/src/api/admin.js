import request from '@/utils/request'


// 获取用户信息
export function getUserInfo() {
    return request({
      url: '/admin/user/info',
      method: 'get'
    })
  }

// 获取用户菜单
export function getUserMenus() {
    return request({
      url: '/admin/user/menus',
      method: 'get'
    })
  }
  
// 更新用户头像
export function updateUserAvatar(data) {
    return request({
      url: '/admin/admin/avatar',
      method: 'post',
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      data
    })
  }
  
  // 修改密码
  export function changePassword(data) {
    return request({
      url: '/admin/admin/password',
      method: 'put',
      data
    })
  }
  
  // 获取用户资料
  export function getProfile() {
    return request({
      url: '/admin/admin/profile',
      method: 'get'
    })
  }
  
  // 更新用户资料
  export function updateProfile(data) {
    return request({
      url: '/admin/admin/profile',
      method: 'put',
      data
    })
  }
  
  // 获取登录日志
  export function getLoginLogs() {
    return request({
      url: '/admin/logs',
      method: 'get',
      params: {
        action: '登录'
      }
    })
  }

  // 获取管理员列表
  export function getAdmins(params) {
    return request({
      url: '/admin/admins',
      method: 'get',
      params
    })
  }

  // 创建管理员
  export function createAdmin(data) {
    return request({
      url: '/admin/admins',
      method: 'post',
      data
    })
  }

  // 更新管理员
  export function updateAdmin(id, data) {
    return request({
      url: `/admin/admins/${id}`,
      method: 'put',
      data
    })
  }

  // 删除管理员
  export function deleteAdmin(id) {
    return request({
      url: `/admin/admins/${id}`,
      method: 'delete'
    })
  }