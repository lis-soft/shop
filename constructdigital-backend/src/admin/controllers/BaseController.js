const { ACTIONS, CRUD_ACTIONS } = require('@/config/resources')
const { saveLog } = require('@/utils/logger')
const authService = require('@/admin/services/AuthService')

class BaseController {
  success = async (req, res, data = null, message = null) => {
    await this.log(req, 200, { data, message })
    
    res.json({
      code: 200,
      message: message || '操作成功',
      data
    })
  }

  fail = async (req, res, error) => {
    const code = error.code || 500
    const message = error.message || '操作失败'
    
    await this.log(req, code, { message })

    res.status(code).json({
      code,
      message
    })
  }

  async log(req, status, response) {
    try {
      const method = req.method
      const path = req.route?.path
      const key = `${method} ${path}`
      let action

      if (ACTIONS[key]) {
        action = ACTIONS[key]
      } else {
        const resource = this.constructor.resource
        action = CRUD_ACTIONS[method.toLowerCase()] + resource
      }

      await saveLog(req, action, status, response)
    } catch (error) {
      console.error('Create log error:', error)
    }
  }

  getAction = (req) => {
    const method = req.method.toLowerCase()
    
    if (!req.route) {
      return '未授权访问'
    }

    const key = `${method.toUpperCase()} ${req.route.path}`

    if (ACTIONS[key]) return ACTIONS[key]

    return `${CRUD_ACTIONS[method] || '操作'}${this.constructor.resource}`
  }

  auth = async (req, res, next) => {
    try {
      const token = req.headers.authorization?.split(' ')[1]
      const admin = await authService.verifyToken(token)
      req.user = admin
      next()
    } catch (error) {
      return this.fail(req, res, error)
    }
  }
}

module.exports = BaseController 