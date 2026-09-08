import axios from 'axios'
import { message } from 'ant-design-vue'
import router from '@/router'

const service = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 10000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
})

service.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`
    }
    return config
  },
  error => {
    return Promise.reject(error)
  }
)

service.interceptors.response.use(
  response => {
    return response
  },
  error => {
    if (error.response) {
      const { status, data } = error.response
      
      if (status === 401) {
        message.error(data.message || '登录已过期，请重新登录')
        localStorage.removeItem('token')
        localStorage.removeItem('userInfo')
        router.push('/login')
      } 
      else if (status === 403) {
        message.error(data.message || '没有权限访问')
      } 
      else if (status === 404) {
        message.error(data.message || '请求的资源不存在')
      } 
      else if (status === 500) {
        message.error(data.message || '服务器错误，请稍后再试')
      } 
    }
    return Promise.reject(error)
  }
)

export default service 