const BaseController = require('./BaseController')
const configService = require('../services/ConfigService')
const { RESOURCES } = require('@/config/resources')

class ConfigController extends BaseController {
  static resource = RESOURCES.CONFIG

  constructor() {
    super()
  }

  getList = async (req, res) => {
    try {
      const result = await configService.getList(req)
      return this.success(req, res, result.data, result.message)
    } catch (error) {
      return this.fail(req, res, error)
    }
  }

  getByGroup = async (req, res) => {
    try {
      const result = await configService.getByGroup(req)
      return this.success(req, res, result.data, result.message)
    } catch (error) {
      return this.fail(req, res, error)
    }
  }

  getConfig = async (req, res) => {
    try {
      const result = await configService.getConfig(req)
      return this.success(req, res, result.data, result.message)
    } catch (error) {
      return this.fail(req, res, error)
    }
  }

  create = async (req, res) => {
    try {
      const result = await configService.create(req)
      return this.success(req, res, result.data, result.message)
    } catch (error) {
      return this.fail(req, res, error)
    }
  }

  update = async (req, res) => {
    try {
      const result = await configService.update(req)
      return this.success(req, res, result.data, result.message)
    } catch (error) {
      return this.fail(req, res, error)
    }
  }

  delete = async (req, res) => {
    try {
      const result = await configService.delete(req)
      return this.success(req, res, result.data, result.message)
    } catch (error) {
      return this.fail(req, res, error)
    }
  }

  updateConfig = async (req, res) => {
    try {
      const result = await configService.updateConfig(req)
      return this.success(req, res, result.data, result.message)
    } catch (error) {
      return this.fail(req, res, error)
    }
  }

  getAllConfig = async (req, res) => {
    try {
      const result = await configService.getAllConfig(req)
      return this.success(req, res, result.data, result.message)
    } catch (error) {
      return this.fail(req, res, error)
    }
  }
}

module.exports = new ConfigController() 