exports.success = (res, data = null, message = '操作成功') => {
  return res.json({ 
    code: 200, 
    message, 
    data 
  })
}

exports.fail = (res, { code = 500, message = '服务器错误', status = code } = {}) => {
  return res.status(status).json({ 
    code, 
    message 
  })
}

// 常用状态码预设
exports.STATUS = {
  BAD_REQUEST: { code: 400, message: '请求参数错误', status: 400 },
  UNAUTHORIZED: { code: 401, message: '未授权', status: 401 },
  FORBIDDEN: { code: 403, message: '禁止访问', status: 403 },
  NOT_FOUND: { code: 404, message: '资源不存在', status: 404 },
  SERVER_ERROR: { code: 500, message: '服务器错误', status: 500 }
} 