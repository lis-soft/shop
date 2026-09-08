const IP2Region = require('ip2region').default
const path = require('path')

const ip2region = new IP2Region({ 
  dbPath: path.join(__dirname, 'ip2region.xdb')
})

function getClientIp(req) {
  const forwardedFor = req.headers['x-forwarded-for']
  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim()
  }
  
  const realIp = req.headers['x-real-ip']
  if (realIp) {
    return realIp
  }

  let ip = req.ip || req.connection.remoteAddress
  
  if (ip.includes('::ffff:')) {
    ip = ip.split('::ffff:')[1]
  }
  
  if (ip === '::1' || ip === '127.0.0.1') {
    ip = 'localhost'
  }

  return ip
}

function getIpLocation(ip) {
  try {
    if (!ip || ip === 'localhost' || ip === '127.0.0.1' || ip === '::1') {
      return { country: '本地', province: '本地', city: '本地', isp: '本地' }
    }
    
    const result = ip2region.search(ip)
    
    const location = {}
    if (result.country && result.country !== '0') location.country = result.country
    if (result.province && result.province !== '0') location.province = result.province
    if (result.city && result.city !== '0') location.city = result.city
    if (result.isp && result.isp !== '0') location.isp = result.isp

    return location
  } catch (error) {
    console.error('IP地址查询失败:', error)
    return { country: '未知', province: '未知', city: '未知', isp: '未知' }
  }
}

module.exports = {
  getClientIp,
  getIpLocation
} 