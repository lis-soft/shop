import request from '@/utils/request'

// 登录API
export function login(data) {
  return request({
    url: '/admin/login',
    method: 'post',
    data
  })
}

// 获取用户信息
export function getUserInfo() {
  return request({
    url: '/admin/user/info',
    method: 'get'
  })
}

// 退出登录
export function logout() {
  return request({
    url: '/admin/logout',
    method: 'post'
  })
}

// 获取验证码
export function getCaptcha() {
  return request({
    url: '/admin/captcha',
    method: 'get',
    responseType: 'blob' // 直接返回图片blob
  })
} 