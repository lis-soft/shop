const express = require('express')
const router = express.Router()

// 引入路由模块
router.use('/admin', require('./admin'))
router.use('/api', require('./api'))

module.exports = router 