import request from '@/utils/request'

export function getWithdrawList(params) {
  return request({
    url: '/admin/withdraws',
    method: 'get',
    params
  })
}

export function getWithdrawDetail(id) {
  return request({
    url: `/admin/withdraws/${id}`,
    method: 'get'
  })
}

export function approveWithdraw(id, data) {
  return request({
    url: `/admin/withdraws/${id}/approve`,
    method: 'post',
    data
  })
}

export function rejectWithdraw(id, data) {
  return request({
    url: `/admin/withdraws/${id}/reject`,
    method: 'post',
    data
  })
}

export function confirmPayment(id, data) {
  return request({
    url: `/admin/withdraws/${id}/confirm-payment`,
    method: 'post',
    data
  })
} 