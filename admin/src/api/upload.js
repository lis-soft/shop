import request from '@/utils/request'

export function uploadImage(file) {
  const formData = new FormData()
  formData.append('file', file)
  
  return request({
    url: '/admin/upload/image',
    method: 'post',
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}

export function uploadMedia(file) {
  const formData = new FormData()
  formData.append('file', file)

  return request({
    url: '/admin/upload/media',
    method: 'post',
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}
