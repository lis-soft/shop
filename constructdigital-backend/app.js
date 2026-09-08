require('module-alias/register')
const express = require('express')
const cors = require('cors')
const morgan = require('morgan')
const path = require('path')
const { app, cors: corsConfig, upload } = require('@/config/config')

process.on('uncaughtException', (error) => {
  console.error('未捕获的异常，但应用将继续运行:', error)
})

process.on('unhandledRejection', (reason, promise) => {
  console.error('未处理的Promise rejection，但应用将继续运行:', reason)
})

//try {
//  const taskForceScheduler = require('@/utils/taskForceScheduler')
//  taskForceScheduler.start()
//} catch (error) {
//  console.error('Task force scheduler启动失败:', error.message)
//}

//require('global-agent/bootstrap')
//global.GLOBAL_AGENT.HTTP_PROXY = 'http://127.0.0.1:7890'
//global.GLOBAL_AGENT.HTTPS_PROXY = 'http://127.0.0.1:7890'
//global.GLOBAL_AGENT.NO_PROXY = 'localhost,127.0.0.1'

//console.log(`全局代理已设置为: http://127.0.0.1:7890`)

const appInstance = express()

/**
 * 构建 CORS 配置，兼容生产环境跨域访问
 * @param {string | undefined} requestOrigin 请求来源
 * @param {(error: Error | null, allow?: boolean) => void} callback 回调
 * @returns {void}
 */
const resolveCorsOrigin = (requestOrigin, callback) => {
    const allowOrigins = Array.isArray(corsConfig.origins) ? corsConfig.origins : []
    const allowAllOrigins = allowOrigins.includes('*')

    // 无 Origin（如 curl、服务端调用）默认放行
    if (!requestOrigin) {
        callback(null, true)
        return
    }

    if (allowAllOrigins || allowOrigins.includes(requestOrigin)) {
        callback(null, true)
        return
    }

    callback(new Error(`CORS origin not allowed: ${requestOrigin}`))
}

const corsOptions = {
    origin: resolveCorsOrigin,
    credentials: corsConfig.credentials,
    exposedHeaders: corsConfig.exposedHeaders || []
}

appInstance.use(cors(corsOptions))
appInstance.options('*', cors(corsOptions))

appInstance.use(morgan('dev'))

appInstance.use(express.json())
appInstance.use(express.urlencoded({
    extended: true
}))

appInstance.use(upload.url, (req, res, next) => {
    if (!req.path.match(/\.(jpg|jpeg|png|gif|svg|webp|mp3|mp4|webm|ogg|mov)$/i)) {
        return res.status(403).json({
            code: 403,
            message: '禁止访问'
        })
    }
    next()
})

appInstance.use(upload.url, express.static(upload.path))

appInstance.use('/uploads', express.static(path.join(__dirname, 'uploads')))

appInstance.use('/', require('@/routes'))

appInstance.use((err, req, res, next) => {
    console.error(err)
    res.status(500).json({
        code: 500,
        message: '服务器错误'
    })
})

appInstance.use((req, res) => {
    res.status(404).json({
        code: 404,
        message: '接口不存在'
    })
})

appInstance.listen(app.port, () => {
    console.log(`端口运行在${app.port}`)
})

module.exports = appInstance
