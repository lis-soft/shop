function normalizeBaseUrl(value) {
  const text = String(value || '').trim()
  return text ? text.replace(/\/$/, '') : ''
}

function normalizeHostname(value) {
  return String(value || '').replace(/^www\./i, '')
}

function getSameSiteApiBaseUrl(value) {
  const baseUrl = normalizeBaseUrl(value)

  if (!baseUrl || !/^(https?:)?\/\//i.test(baseUrl) || typeof window === 'undefined') {
    return baseUrl
  }

  try {
    const url = new URL(baseUrl, window.location.origin)
    const currentHostname = normalizeHostname(window.location.hostname)
    const apiHostname = normalizeHostname(url.hostname)

    if (url.pathname.replace(/\/$/, '') === '/api' && apiHostname === currentHostname) {
      return ''
    }
  } catch {
    return baseUrl
  }

  return baseUrl
}

function readRuntimeConfig() {
  const config = globalThis.__APP_CONFIG__
  return config && typeof config === 'object' ? config : {}
}

export function getApiBaseUrl() {
  if (import.meta.env.DEV) {
    return normalizeBaseUrl(import.meta.env.VITE_API_URL)
  }

  const runtimeConfig = readRuntimeConfig()
  if (Object.prototype.hasOwnProperty.call(runtimeConfig, 'apiBaseUrl')) {
    return getSameSiteApiBaseUrl(runtimeConfig.apiBaseUrl)
  }

  return getSameSiteApiBaseUrl(import.meta.env.VITE_API_URL)
}

export function buildApiUrl(path) {
  if (!path) {
    return getApiBaseUrl()
  }

  if (/^(https?:)?\/\//i.test(path)) {
    return path
  }

  const baseUrl = getApiBaseUrl()
  if (!baseUrl) {
    return path
  }

  return `${baseUrl}${path.startsWith('/') ? path : `/${path}`}`
}

export function getApiOrigin() {
  const baseUrl = getApiBaseUrl()

  if (!baseUrl || !/^(https?:)?\/\//i.test(baseUrl)) {
    return ''
  }

  return baseUrl
    .replace(/\/api\/?$/, '')
    .replace(/\/$/, '')
}
