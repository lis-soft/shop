import request from '@/utils/request'

// 获取操作日志列表
export function getLogList(params) {
  return request({
    url: '/admin/logs',
    method: 'get',
    params
  })
}

// 获取操作日志详情
export function getLogDetail(id) {
  return request({
    url: `/admin/logs/${id}`,
    method: 'get',
    // 确保响应直接返回，不要自动解构
    transformResponse: [(data) => {
      // 保持原始响应格式
      return typeof data === 'string' ? JSON.parse(data) : data;
    }]
  })
}

// 清空操作日志
export function clearLogs() {
  return request({
    url: '/admin/logs/clear',
    method: 'delete'
  })
} 