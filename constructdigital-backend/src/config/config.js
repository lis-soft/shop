const fs = require('fs')
const path = require('path')
const { createRequire } = require('module')

const loadOverride = () => {
  const runtimeRequire = createRequire(__filename)
  const candidates = [
    path.join(__dirname, 'config.override.js'),
    path.join(process.cwd(), 'src/config/config.override.js'),
    path.join(process.cwd(), 'config.override.js')
  ]

  for (const file of candidates) {
    if (!fs.existsSync(file)) {
      continue
    }

    try {
      return runtimeRequire(file) || {}
    } catch (error) {
      console.error(`加载配置覆盖文件失败: ${file}`, error.message)
    }
  }

  return {}
}

const isWwwrootDeploy = () => {
  const marker = `${path.sep}www${path.sep}wwwroot${path.sep}`
  return [process.cwd(), __dirname].some((item) => String(item).includes(marker))
}

const override = loadOverride()

const config = {
  // 系统配置
  app: {
    port: 10303,
    timezone: 'Asia/Shanghai',
    debug: true
  },

  // JWT配置
  jwt: {
    secret: '123456789abcd',
    expires_in: '24h'
  },

  // 本地默认库。线上账号写在 src/config/config.override.js，覆盖代码时不要动那个文件。
  db: {
    host: '127.0.0.1',
    port: 3306,
    name: 'yysd',
    user: 'root',
    password: '123456',
    dialect: 'mysql',
    timezone: '+09:00',
    logging: false,
    define: {
      underscored: true,
      timestamps: true,
      paranoid: false,
      created_at: 'created_at',
      updated_at: 'updated_at'
    }
  },

  // 跨域配置
  cors: {
    origins: ['*','http://localhost:9901', 'http://localhost:5173'],
    credentials: true,
    exposedHeaders: ['Captcha-Key']
  },

  // 上传配置
  upload: {
    qrcode: 'uploads/qrcode',
    path: 'uploads',
    url: '/uploads',
    types: ['image/jpeg', 'image/png', 'image/gif'],
    max_size: 5 * 1024 * 1024  // 5MB
  },

  // 日志配置
  log: {
    level:'info',
    file: 'logs/app.log'
  },

  // 添加session配置
  session: {
    secret: '123456789abcd',
    resave: true,
    saveUninitialized: true,
    cookie: {
      httpOnly: true,
      secure: false, // 开发环境设置为false
      maxAge: 24 * 60 * 60 * 1000, // 24小时
      sameSite: 'lax'
    }
  },

  // 验证码配置
  captcha: {
    size: 4, // 验证码长度
    ignoreChars: '0o1il', // 排除容易混淆的字符
    noise: 2, // 干扰线条数量
    color: true, // 验证码颜色
    background: '#f0f2f5', // 背景色
    expires: 5 * 60 * 1000, // 验证码过期时间：5分钟
    headers: {
      'Content-Type': 'image/svg+xml',
      'Access-Control-Expose-Headers': 'Captcha-Key'
    }
  }
}

config.db = {
  ...config.db,
  ...(override.db || {})
}

if (override.jwt) {
  config.jwt = {
    ...config.jwt,
    ...override.jwt
  }
}

if (isWwwrootDeploy() && config.db.user === 'root' && config.db.password === '123456') {
  throw new Error('线上检测到本地数据库账号 root。请把线上库写到 src/config/config.override.js，覆盖代码时不要覆盖这个文件。')
}

module.exports = config
