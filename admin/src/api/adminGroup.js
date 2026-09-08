import request from '@/utils/request'

// 获取权限组列表
export function getAdminGroupList(params) {
  return request({
    url: '/admin/admin-groups',
    method: 'get',
    params
  })
}

// 获取权限组详情
export function getAdminGroupDetail(id) {
  return request({
    url: `/admin/admin-groups/${id}`,
    method: 'get'
  })
}

// 创建权限组
export function createAdminGroup(data) {
  return request({
    url: '/admin/admin-groups',
    method: 'post',
    data
  })
}

// 更新权限组
export function updateAdminGroup(id, data) {
  return request({
    url: `/admin/admin-groups/${id}`,
    method: 'put',
    data
  })
}

// 删除权限组
export function deleteAdminGroup(id) {
  return request({
    url: `/admin/admin-groups/${id}`,
    method: 'delete'
  })
}

// 切换权限组状态
export function toggleAdminGroupStatus(id) {
  return request({
    url: `/admin/admin-groups/${id}/status`,
    method: 'put'
  })
}

// 获取所有权限规则
export function getAllAdminRules() {
  return request({
    url: '/admin/admin-rules',
    method: 'get'
  })
}
