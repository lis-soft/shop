const BaseController = require('./BaseController')
const path = require('path')
const config = require('@/config/config')

class UploadController extends BaseController {
  static resource = '上传'

  uploadImage = async (req, res) => {
    try {
      if (!req.file) {
        return this.fail(req, res, { message: '没有上传文件' })
      }

      const filePath = req.file.path.replace(/\\/g, '/')
      const fileUrl = `${config.upload.url}/${filePath.split('uploads/')[1]}`

      return this.success(req, res, { url: fileUrl }, '上传成功')
    } catch (error) {
      return this.fail(req, res, error)
    }
  }

  uploadMedia = async (req, res) => {
    try {
      if (!req.file) {
        return this.fail(req, res, { message: '没有上传文件' })
      }

      const filePath = req.file.path.replace(/\\/g, '/')
      const fileUrl = `${config.upload.url}/${filePath.split('uploads/')[1]}`

      return this.success(req, res, { url: fileUrl }, '上传成功')
    } catch (error) {
      return this.fail(req, res, error)
    }
  }
}

module.exports = new UploadController() 
