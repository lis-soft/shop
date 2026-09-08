const AdminLog = require('@/admin/models/AdminLog')
const { getClientIp, getIpLocation } = require('@/utils/getClientIp')

async function saveLog(req, action, status = 200, response = null) {
  try {
    const ip = getClientIp(req)
    const location = getIpLocation(ip)
    const ipAddress = Object.values(location).filter(Boolean).join(' ')

    await AdminLog.create({
      adminId: req.user?.id,
      ip,
      ipAddress: ipAddress || null,
      method: req.method,
      path: req.path,
      params: JSON.stringify(req.method === 'GET' ? req.query : req.body),
      action,
      userAgent: req.headers['user-agent'],
      status,
      response: response ? JSON.stringify(response) : null
    })
  } catch (error) {
    console.error('Save log error:', error)
  }
}

module.exports = {
  saveLog
} 