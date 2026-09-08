import request from '@/utils/request'

// 获取仪表盘统计数据
export function getDashboardStats() {
  return request({
    url: '/admin/dashboard/stats',
    method: 'get'
  })
}

// 获取最近注册的用户
export function getRecentUsers(limit = 10) {
  return request({
    url: '/admin/dashboard/recent-users',
    method: 'get',
    params: { limit }
  })
} 