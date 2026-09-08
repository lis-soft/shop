import moment from 'moment'

/**
 * 格式化日期时间
 * @param {string|Date} dateStr 日期字符串或日期对象
 * @param {string} format 格式化模式，默认为 'YYYY-MM-DD HH:mm:ss'
 * @returns {string} 格式化后的日期字符串
 */
export function formatDateTime(dateStr, format = 'YYYY-MM-DD HH:mm:ss') {
  if (!dateStr) return '-'
  return moment(dateStr).format(format)
}

/**
 * 格式化日期
 * @param {string|Date} dateStr 日期字符串或日期对象
 * @param {string} format 格式化模式，默认为 'YYYY-MM-DD'
 * @returns {string} 格式化后的日期字符串
 */
export function formatDate(dateStr, format = 'YYYY-MM-DD') {
  if (!dateStr) return '-'
  return moment(dateStr).format(format)
}

/**
 * 格式化时间
 * @param {string|Date} dateStr 日期字符串或日期对象
 * @param {string} format 格式化模式，默认为 'HH:mm:ss'
 * @returns {string} 格式化后的时间字符串
 */
export function formatTime(dateStr, format = 'HH:mm:ss') {
  if (!dateStr) return '-'
  return moment(dateStr).format(format)
}

/**
 * 获取相对时间（例如：3小时前，2天前）
 * @param {string|Date} dateStr 日期字符串或日期对象
 * @returns {string} 相对时间字符串
 */
export function fromNow(dateStr) {
  if (!dateStr) return '-'
  return moment(dateStr).fromNow()
}

/**
 * 格式化时间戳
 * @param {number} timestamp 时间戳（毫秒）
 * @param {string} format 格式化模式，默认为 'YYYY-MM-DD HH:mm:ss'
 * @returns {string} 格式化后的日期时间字符串
 */
export function formatTimestamp(timestamp, format = 'YYYY-MM-DD HH:mm:ss') {
  if (!timestamp) return '-'
  return moment(timestamp).format(format)
}

export default {
  formatDateTime,
  formatDate,
  formatTime,
  fromNow,
  formatTimestamp
} 