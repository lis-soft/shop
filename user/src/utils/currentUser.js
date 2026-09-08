import { ref } from 'vue'
import { request } from '@/utils/request'
import { getApiOrigin } from '@/utils/appConfig'
import { identifyCustomerSupportUser } from '@/utils/customerSupport'

const USER_INFO_KEY = 'userInfo'

function readStoredCurrentUser() {
  const rawUserInfo = localStorage.getItem(USER_INFO_KEY)

  if (!rawUserInfo) {
    return null
  }

  try {
    return JSON.parse(rawUserInfo)
  } catch {
    localStorage.removeItem(USER_INFO_KEY)
    return null
  }
}

export const currentUser = ref(readStoredCurrentUser())
export const isCurrentUserLoading = ref(false)

export function setCurrentUser(userInfo) {
  const previousUser = currentUser.value
  currentUser.value = userInfo || null

  if (userInfo) {
    localStorage.setItem(USER_INFO_KEY, JSON.stringify(userInfo))
    identifyCustomerSupportUser(userInfo).catch(() => {})
    return
  }

  localStorage.removeItem(USER_INFO_KEY)

  if (previousUser) {
    identifyCustomerSupportUser(null).catch(() => {})
  }
}

export function clearCurrentUser() {
  localStorage.removeItem('token')
  setCurrentUser(null)
}

export async function refreshCurrentUser() {
  const token = localStorage.getItem('token')

  if (!token) {
    setCurrentUser(null)
    return null
  }

  isCurrentUserLoading.value = true

  try {
    const result = await request('/api/user/info')
    const userInfo = result?.data || null

    setCurrentUser(userInfo)
    return userInfo
  } catch (error) {
    const message = String(error?.message || '')

    if (message.includes('401') || message.includes('未登录') || message.includes('过期') || message.includes('无效')) {
      clearCurrentUser()
    }

    throw error
  } finally {
    isCurrentUserLoading.value = false
  }
}

export function resolveFileUrl(filePath) {
  if (!filePath) {
    return ''
  }

  if (/^(https?:)?\/\//i.test(filePath) || filePath.startsWith('data:') || filePath.startsWith('blob:')) {
    return filePath
  }

  const normalizedOrigin = getApiOrigin()

  if (!normalizedOrigin) {
    return filePath
  }

  return filePath.startsWith('/') ? `${normalizedOrigin}${filePath}` : `${normalizedOrigin}/${filePath}`
}

export function resolveUserAvatar(avatarPath) {
  return resolveFileUrl(avatarPath)
}

export function getAvailableBalance(userInfo) {
  const balance = Number(userInfo?.balance ?? 0)
  const frozenBalance = Number(userInfo?.frozen_balance ?? 0)
  const normalizedBalance = Number.isFinite(balance) ? balance : 0
  const normalizedFrozenBalance = Number.isFinite(frozenBalance) ? frozenBalance : 0

  return +(normalizedBalance - normalizedFrozenBalance).toFixed(8)
}
