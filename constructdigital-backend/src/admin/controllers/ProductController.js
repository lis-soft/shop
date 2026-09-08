const BaseController = require('./BaseController')
const productService = require('../services/ProductService')

class ProductController extends BaseController {
  static resource = '商品'

  getList = async (req, res) => {
    try {
      const result = await productService.getList(req.query)
      return this.success(req, res, result.data)
    } catch (error) {
      return this.fail(req, res, error)
    }
  }

  getDetail = async (req, res) => {
    try {
      const result = await productService.getDetail(req.params.id)
      return this.success(req, res, result.data)
    } catch (error) {
      return this.fail(req, res, error)
    }
  }

  create = async (req, res) => {
    try {
      const result = await productService.create(req.body)
      return this.success(req, res, result.data, result.message)
    } catch (error) {
      return this.fail(req, res, error)
    }
  }

  update = async (req, res) => {
    try {
      const result = await productService.update(req.params.id, req.body)
      return this.success(req, res, result.data, result.message)
    } catch (error) {
      return this.fail(req, res, error)
    }
  }

  delete = async (req, res) => {
    try {
      const result = await productService.delete(req.params.id)
      return this.success(req, res, null, result.message)
    } catch (error) {
      return this.fail(req, res, error)
    }
  }

  toggleStatus = async (req, res) => {
    try {
      const result = await productService.toggleStatus(req.params.id)
      return this.success(req, res, result.data, result.message)
    } catch (error) {
      return this.fail(req, res, error)
    }
  }
}

module.exports = new ProductController() 