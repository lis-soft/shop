import request from '@/utils/request'

export function getVipLevels(params) {
  return request({
    url: '/admin/vips',
    method: 'get',
    params
  })
}

export function getVipLevel(id) {
  return request({
    url: `/admin/vips/${id}`,
    method: 'get'
  })
}

export function createVipLevel(data) {
  return request({
    url: '/admin/vips',
    method: 'post',
    data
  })
}

export function updateVipLevel(id, data) {
  return request({
    url: `/admin/vips/${id}`,
    method: 'put',
    data
  })
}

export function deleteVipLevel(id) {
  return request({
    url: `/admin/vips/${id}`,
    method: 'delete'
  })
}
