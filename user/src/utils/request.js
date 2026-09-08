import { buildApiUrl } from '@/utils/appConfig'

const DEFAULT_TIMEOUT = 10000

function buildUrl(path) {
  return buildApiUrl(path)
}

async function parseResponse(response) {
  const text = await response.text()

  if (!text) {
    return null
  }

  try {
    return JSON.parse(text)
  } catch {
    throw new Error('The server returned unreadable data')
  }
}

export async function request(path, options = {}) {
  const controller = new AbortController()
  const timeoutId = window.setTimeout(() => controller.abort(), DEFAULT_TIMEOUT)
  const isFormData = typeof FormData !== 'undefined' && options.body instanceof FormData

  const headers = {
    ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
    'Accept-Language': 'en-US,en;q=0.9',
    ...(options.headers || {})
  }

  const token = localStorage.getItem('token')
  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  try {
    const response = await fetch(buildUrl(path), {
      ...options,
      headers,
      credentials: 'include',
      signal: controller.signal
    })

    const result = await parseResponse(response)

    if (!response.ok) {
      throw new Error(result?.message || `Request failed (${response.status})`)
    }

    if (result && typeof result.code !== 'undefined' && result.code !== 200) {
      throw new Error(result.message || 'Request failed')
    }

    return result
  } catch (error) {
    if (error.name === 'AbortError') {
      throw new Error('Request timed out, please try again')
    }

    throw error
  } finally {
    window.clearTimeout(timeoutId)
  }
}
