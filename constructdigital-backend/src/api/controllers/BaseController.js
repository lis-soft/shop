const jwt = require('jsonwebtoken')
const { jwt: jwtConfig } = require('@/config/config')
const { t, normalizeLanguage } = require('@/api/lang')
const User = require('@/admin/models/User')

class BaseController {
  getLanguage(req) {
    return normalizeLanguage(req.headers['accept-language'])
  }

  success(req, res, data = null, message = '操作成功') {
    const lang = this.getLanguage(req)
    return res.json({
      code: 200,
      message: t(message, lang),
      data
    })
  }

  fail(req, res, error) {
    const lang = this.getLanguage(req)
    const code = error.code || 500
    const message = error.message || '服务器错误'
    
    return res.status(code >= 400 && code < 600 ? code : 500).json({
      code,
      message: t(message, lang)
    })
  }

  authenticate = (req, res, next) => {
    try {
      const authHeader = req.headers.authorization
      if (!authHeader) {
        return this.fail(req, res, {
          code: 401,
          message: '未登录或登录已过期'
        })
      }

      const token = authHeader.split(' ')[1]
      if (!token) {
        return this.fail(req, res, {
          code: 401,
          message: '无效的认证令牌'
        })
      }

      jwt.verify(token, jwtConfig.secret, (err, decoded) => {
        if (err) {
          if (err.name === 'TokenExpiredError') {
            return this.fail(req, res, {
              code: 401,
              message: '登录已过期，请重新登录'
            })
          }
          
          return this.fail(req, res, {
            code: 401,
            message: '无效的认证令牌'
          })
        }

        req.user = { id: decoded.id }
        next()
      })
    } catch (error) {
      return this.fail(req, res, {
        code: 500,
        message: '服务器错误'
      })
    }
  }

  authenticateUser = async (req, res, next) => {
    try {
      const authHeader = req.headers.authorization
      if (!authHeader) {
        return this.fail(req, res, {
          code: 401,
          message: '未登录或登录已过期'
        })
      }

      const token = authHeader.split(' ')[1]
      if (!token) {
        return this.fail(req, res, {
          code: 401,
          message: '无效的认证令牌'
        })
      }

      const decoded = jwt.verify(token, jwtConfig.secret)
      
      const user = await User.findByPk(decoded.id)
      if (!user) {
        return this.fail(req, res, {
          code: 401,
          message: '用户不存在'
        })
      }

      if (user.status !== 1) {
        return this.fail(req, res, {
          code: 401,
          message: '账户已被禁用'
        })
      }

      req.user = { id: decoded.id }
      next()
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        return this.fail(req, res, {
          code: 401,
          message: '登录已过期，请重新登录'
        })
      }
      
      if (error.name === 'JsonWebTokenError') {
        return this.fail(req, res, {
          code: 401,
          message: '无效的认证令牌'
        })
      }

      return this.fail(req, res, {
        code: 500,
        message: '服务器错误'
      })
    }
  }
}

module.exports = BaseController 
