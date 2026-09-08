const authService = require('@/admin/services/AuthService')

function checkPermission(ruleName) {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          code: 401,
          message: '请先登录'
        })
      }

      const hasPermission = await authService.checkPermission(req.user.id, ruleName)
      
      if (!hasPermission) {
        return res.status(403).json({
          code: 403,
          message: '权限不足'
        })
      }

      next()
    } catch (error) {
      return res.status(500).json({
        code: 500,
        message: '权限验证失败'
      })
    }
  }
}

function checkAnyPermission(ruleNames) {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          code: 401,
          message: '请先登录'
        })
      }

      const hasAnyPermission = await Promise.all(
        ruleNames.map(ruleName => authService.checkPermission(req.user.id, ruleName))
      )

      if (!hasAnyPermission.some(permission => permission)) {
        return res.status(403).json({
          code: 403,
          message: '权限不足'
        })
      }

      next()
    } catch (error) {
      return res.status(500).json({
        code: 500,
        message: '权限验证失败'
      })
    }
  }
}

function checkSuperAdmin() {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          code: 401,
          message: '请先登录'
        })
      }

      // 检查是否为超级管理员权限组 (role_id = 1)
      if (req.user.role_id !== 1) {
        return res.status(403).json({
          code: 403,
          message: '仅超级管理员可访问'
        })
      }

      next()
    } catch (error) {
      return res.status(500).json({
        code: 500,
        message: '权限验证失败'
      })
    }
  }
}

module.exports = {
  checkPermission,
  checkAnyPermission,
  checkSuperAdmin
} 