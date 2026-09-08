import request from '@/utils/request'

// 获取财务记录列表
export function getMoneyLogList(params) {
  return request({
    url: '/admin/money-logs',
    method: 'get',
    params
  })
}

// 获取财务记录详情
export function getMoneyLogDetail(id) {
  return request({
    url: `/admin/money-logs/${id}`,
    method: 'get'
  })
}

// 获取财务统计数据
export function getMoneyLogStats(params) {
  return request({
    url: '/admin/money-logs-stats',
    method: 'get',
    params
  })
} 