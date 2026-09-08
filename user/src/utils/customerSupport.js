const LOGIN_INFO_ACTION = 'setLoginInfo'
const CLEAR_USER_ACTION = 'clearUser'
const LOGIN_INFO_RETRY_DELAYS = [500, 1500, 3000]
const CUSTOMER_SUPPORT_SCRIPT_ID = 'salesmartly-customer-support-sdk'
const CUSTOMER_SUPPORT_BOOTSTRAP_SCRIPT_ID = 'ss-chat'
const CUSTOMER_SUPPORT_TYPES = {
  GUEST: 'guest',
  PUBLIC: 'public',
  DEDICATED: 'dedicated'
}
const CUSTOMER_SUPPORT_CONFIG = {
  // 访客客服：未登录访客使用。
  [CUSTOMER_SUPPORT_TYPES.GUEST]: {
    label: '访客客服',
    scriptUrl: 'https://plugin-code.salesmartly.com/js/project_692106_713807_1776946747.js'
  },
  // 普通客服：已登录普通用户使用。
  [CUSTOMER_SUPPORT_TYPES.PUBLIC]: {
    label: '普通客服',
    scriptUrl: 'https://plugin-code.salesmartly.com/js/project_669020_689992_1774967314.js'
  },
  // 专属客服：邀请码链路命中 4FP687、4Q8J39、P148M9 的用户使用。
  [CUSTOMER_SUPPORT_TYPES.DEDICATED]: {
    label: '专属客服',
    scriptUrl: 'https://plugin-code.salesmartly.com/js/project_682615_704007_1776176648.js'
  }
}
let lastLoginInfoSignature = ''
let activeCustomerSupportType = typeof window !== 'undefined' ? String(window.__CUSTOMER_SUPPORT_TYPE__ || '') : ''
let isReloadingForCustomerSupport = false
let pendingSupportCommands = []

function isCustomerSupportEnabled() {
  if (typeof window === 'undefined') {
    return false
  }

  if (Boolean(window.__APP_CONFIG__?.enableCustomerSupport)) {
    window.__CUSTOMER_SUPPORT_DISABLED__ = false
    return true
  }

  return false
}

function getText(...values) {
  for (const value of values) {
    const text = String(value ?? '').trim()

    if (text) {
      return text
    }
  }

  return ''
}

function getContactPhone(userInfo) {
  return getText(
    userInfo?.phone,
    userInfo?.mobile,
    userInfo?.other?.phone,
    userInfo?.other?.mobile,
    userInfo?.other?.profile?.phone,
    userInfo?.other?.profile?.mobile,
    userInfo?.other?.contact?.phone,
    userInfo?.other?.contact?.mobile
  )
}

function getContactEmail(userInfo) {
  return getText(
    userInfo?.email,
    userInfo?.mail,
    userInfo?.other?.email,
    userInfo?.other?.mail,
    userInfo?.other?.profile?.email,
    userInfo?.other?.profile?.mail,
    userInfo?.other?.contact?.email,
    userInfo?.other?.contact?.mail
  )
}

function toHex(buffer) {
  return Array.from(new Uint8Array(buffer))
    .map(byte => byte.toString(16).padStart(2, '0'))
    .join('')
}

function normalizeSupportId(value) {
  return String(value ?? '')
    .trim()
    .replace(/[^A-Za-z0-9_-]/g, '_')
    .slice(0, 300)
}

async function buildSupportUserId(userInfo) {
  const rawUserId = getText(userInfo?.id, userInfo?.user_id, userInfo?.username, getContactPhone(userInfo))

  if (!rawUserId) {
    return ''
  }

  if (typeof crypto !== 'undefined' && crypto.subtle && typeof TextEncoder !== 'undefined') {
    try {
      const data = new TextEncoder().encode(`user:${rawUserId}`)
      const digest = await crypto.subtle.digest('SHA-256', data)
      return normalizeSupportId(`u_${toHex(digest)}`)
    } catch { }
  }

  return normalizeSupportId(`u_${rawUserId}`)
}

function buildDescription(userInfo) {
  const parts = [
    getText(userInfo?.vip?.vip_name, userInfo?.vip_name) ? `VIP: ${getText(userInfo?.vip?.vip_name, userInfo?.vip_name)}` : '',
    getText(userInfo?.invite_code, userInfo?.inviteCode) ? `Invite code: ${getText(userInfo?.invite_code, userInfo?.inviteCode)}` : '',
    getText(userInfo?.country_code, userInfo?.other?.register?.country) ? `Country: ${getText(userInfo?.country_code, userInfo?.other?.register?.country)}` : '',
    userInfo?.status !== undefined ? `Status: ${userInfo.status ? 'active' : 'disabled'}` : '',
    userInfo?.credit_score !== undefined ? `Credit score: ${userInfo.credit_score}` : ''
  ]

  return parts.filter(Boolean).join('\n')
}

function getSupportQueue() {
  if (typeof window === 'undefined') {
    return null
  }

  return window.ssq && typeof window.ssq.push === 'function' ? window.ssq : null
}

function getCustomerSupportType(userInfo) {
  const type = String(userInfo?.customer_support?.type || '').trim()

  return type === CUSTOMER_SUPPORT_TYPES.DEDICATED
    ? CUSTOMER_SUPPORT_TYPES.DEDICATED
    : CUSTOMER_SUPPORT_TYPES.PUBLIC
}

function removeCustomerSupportScript() {
  if (typeof document === 'undefined') {
    return
  }

  document.getElementById(CUSTOMER_SUPPORT_SCRIPT_ID)?.remove()
  document.getElementById(CUSTOMER_SUPPORT_BOOTSTRAP_SCRIPT_ID)?.remove()
}

function hasCustomerSupportScript(type) {
  if (typeof document === 'undefined') {
    return false
  }

  const config = CUSTOMER_SUPPORT_CONFIG[type] || CUSTOMER_SUPPORT_CONFIG[CUSTOMER_SUPPORT_TYPES.GUEST]
  const existingScript = document.getElementById(CUSTOMER_SUPPORT_SCRIPT_ID)
  const bootstrapScript = document.getElementById(CUSTOMER_SUPPORT_BOOTSTRAP_SCRIPT_ID)

  return existingScript?.getAttribute('src') === config.scriptUrl && Boolean(bootstrapScript || getSupportQueue())
}

function loadCustomerSupportScript(type) {
  if (typeof document === 'undefined') {
    return
  }

  const config = CUSTOMER_SUPPORT_CONFIG[type] || CUSTOMER_SUPPORT_CONFIG[CUSTOMER_SUPPORT_TYPES.GUEST]
  const existingScript = document.getElementById(CUSTOMER_SUPPORT_SCRIPT_ID)

  if (existingScript?.getAttribute('src') === config.scriptUrl) {
    window.__CUSTOMER_SUPPORT_TYPE__ = type
    window.__CUSTOMER_SUPPORT_SCRIPT_URL__ = config.scriptUrl
    return
  }

  removeCustomerSupportScript()
  delete window.ssq
  delete window.__ssc

  const script = document.createElement('script')
  script.id = CUSTOMER_SUPPORT_SCRIPT_ID
  script.src = config.scriptUrl
  script.async = true
  script.dataset.customerSupportLabel = config.label
  script.onload = () => {
    flushPendingSupportCommands()
  }
  script.onerror = () => {
    script.remove()
    if (window.__CUSTOMER_SUPPORT_SCRIPT_URL__ === config.scriptUrl) {
      window.__CUSTOMER_SUPPORT_SCRIPT_URL__ = ''
    }
  }
  document.body.appendChild(script)
  window.__CUSTOMER_SUPPORT_TYPE__ = type
  window.__CUSTOMER_SUPPORT_SCRIPT_URL__ = config.scriptUrl
}

function reloadForCustomerSupportSwitch(type) {
  if (typeof window === 'undefined' || isReloadingForCustomerSupport) {
    return
  }

  isReloadingForCustomerSupport = true
  window.__CUSTOMER_SUPPORT_TYPE__ = type

  window.setTimeout(() => {
    window.location.reload()
  }, 300)
}

function ensureCustomerSupport(type) {
  if (typeof window === 'undefined') {
    return false
  }

  const normalizedType = CUSTOMER_SUPPORT_CONFIG[type] ? type : CUSTOMER_SUPPORT_TYPES.GUEST

  if (activeCustomerSupportType === normalizedType) {
    if (!hasCustomerSupportScript(normalizedType)) {
      loadCustomerSupportScript(normalizedType)
    }

    return true
  }

  if (activeCustomerSupportType) {
    pushSupportCommand(CLEAR_USER_ACTION)
    lastLoginInfoSignature = ''
    activeCustomerSupportType = normalizedType
    reloadForCustomerSupportSwitch(normalizedType)
    return false
  }

  lastLoginInfoSignature = ''
  activeCustomerSupportType = normalizedType
  loadCustomerSupportScript(normalizedType)
  return true
}

function pushSupportCommand(action, payload) {
  const ssq = getSupportQueue()

  if (!ssq) {
    pendingSupportCommands.push([action, payload])
    return
  }

  if (payload === undefined) {
    ssq.push(action)
    return
  }

  ssq.push(action, payload)
}

function flushPendingSupportCommands() {
  const ssq = getSupportQueue()

  if (!ssq || !pendingSupportCommands.length) {
    return
  }

  const commands = pendingSupportCommands
  pendingSupportCommands = []

  commands.forEach(([action, payload]) => {
    if (payload === undefined) {
      ssq.push(action)
      return
    }

    ssq.push(action, payload)
  })
}

function retryLoginInfo(loginInfo) {
  if (typeof window === 'undefined') {
    return
  }

  LOGIN_INFO_RETRY_DELAYS.forEach(delay => {
    window.setTimeout(() => {
      pushSupportCommand(LOGIN_INFO_ACTION, loginInfo)
    }, delay)
  })
}

export async function identifyCustomerSupportUser(userInfo) {
  if (!isCustomerSupportEnabled()) {
    return
  }

  if (!userInfo) {
    clearCustomerSupportUser()
    ensureCustomerSupport(CUSTOMER_SUPPORT_TYPES.GUEST)
    return
  }

  if (!ensureCustomerSupport(getCustomerSupportType(userInfo))) {
    return
  }

  const userId = await buildSupportUserId(userInfo)
  const phone = getContactPhone(userInfo)
  const email = getContactEmail(userInfo)
  const userName = getText(userInfo?.username, userInfo?.name, phone, userId)

  if (!userId || !userName) {
    return
  }

  const loginInfo = {
    user_id: userId,
    user_name: userName,
    language: 'en-US',
    phone,
    email,
    description: buildDescription(userInfo)
  }
  const signature = JSON.stringify(loginInfo)

  if (signature === lastLoginInfoSignature) {
    return
  }

  pushSupportCommand(LOGIN_INFO_ACTION, loginInfo)
  retryLoginInfo(loginInfo)
  lastLoginInfoSignature = signature
}

export function clearCustomerSupportUser() {
  if (!isCustomerSupportEnabled()) {
    return
  }

  lastLoginInfoSignature = ''

  pushSupportCommand(CLEAR_USER_ACTION)
}

export function initCustomerSupport() {
  if (!isCustomerSupportEnabled()) {
    removeCustomerSupportScript()
    window.__CUSTOMER_SUPPORT_DISABLED__ = true
    window.__CUSTOMER_SUPPORT_TYPE__ = ''
    window.__CUSTOMER_SUPPORT_SCRIPT_URL__ = ''
    return
  }

  if (typeof localStorage !== 'undefined' && localStorage.getItem('token')) {
    return
  }

  ensureCustomerSupport(CUSTOMER_SUPPORT_TYPES.GUEST)
}
