const multer = require('multer')
const path = require('path')
const fs = require('fs')

const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
const VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime']

// 创建文件夹
const createFolder = (folder) => {
  try {
    if (!fs.existsSync(folder)) {
      fs.mkdirSync(folder, { recursive: true })
    }
  } catch (error) {
    console.error('Create folder error:', error)
  }
}

// 配置存储
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const now = new Date()
    const year = now.getFullYear()
    const month = String(now.getMonth() + 1).padStart(2, '0')
    const day = String(now.getDate()).padStart(2, '0')
    const uploadDir = path.join('uploads', String(year), month, day)
    
    createFolder(uploadDir)
    cb(null, uploadDir)
  },
  filename: (req, file, cb) => {
    const timestamp = Date.now()
    const random = Math.floor(Math.random() * 90000) + 10000
    const ext = path.extname(file.originalname)
    cb(null, `${timestamp}_${random}${ext.toLowerCase()}`)
  }
})

const createFileFilter = (allowedTypes, errorMessage) => (req, file, cb) => {
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true)
  } else {
    cb(new Error(errorMessage), false)
  }
}

const createUpload = ({ allowedTypes, errorMessage, maxSize }) => multer({
  storage,
  fileFilter: createFileFilter(allowedTypes, errorMessage),
  limits: {
    fileSize: maxSize
  }
})

const imageUpload = createUpload({
  allowedTypes: IMAGE_TYPES,
  errorMessage: '不支持的图片类型',
  maxSize: 5 * 1024 * 1024
})

const mediaUpload = createUpload({
  allowedTypes: [...IMAGE_TYPES, ...VIDEO_TYPES],
  errorMessage: '不支持的文件类型，请上传图片或视频',
  maxSize: 50 * 1024 * 1024
})

module.exports = {
  imageUpload,
  mediaUpload
}
