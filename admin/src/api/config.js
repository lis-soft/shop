import request from '@/utils/request'

// 获取系统配置
export function getConfig(key) {
  return request({
    url: '/admin/config',
    method: 'get',
    params: key ? { key } : {}
  })
}

// 更新系统配置
export function updateConfig(data) {
  return request({
    url: '/admin/config',
    method: 'put',
    data
  })
}

// 获取所有系统配置（包含描述信息）
export function getAllConfig() {
  return request({
    url: '/admin/config/all',
    method: 'get'
  })
} 