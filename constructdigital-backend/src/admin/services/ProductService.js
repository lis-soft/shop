const BaseService = require('./BaseService')
const Product = require('@/admin/models/Product')
const { Op } = require('sequelize')
const sequelize = require('@/config/database')

class ProductService extends BaseService {
  async getList(params) {
    try {
      const minPrice = Number(params.minPrice)
      const maxPrice = Number(params.maxPrice)
      const priceCondition = {}
      let hasPriceCondition = false

      if (params.minPrice !== undefined && params.minPrice !== null && params.minPrice !== '' && Number.isFinite(minPrice)) {
        priceCondition[Op.gte] = minPrice
        hasPriceCondition = true
      }

      if (params.maxPrice !== undefined && params.maxPrice !== null && params.maxPrice !== '' && Number.isFinite(maxPrice)) {
        priceCondition[Op.lte] = maxPrice
        hasPriceCondition = true
      }

      const where = {}
      if (hasPriceCondition) {
        where.price = priceCondition
      }

      return await this.paginate(Product, {
        params,
        where,
        searchFields: ['product_title'],
        order: [['id', 'DESC']]
      })
    } catch (error) {
      return this.fail(error)
    }
  }

  async getDetail(id) {
    try {
      const product = await Product.findByPk(id)
      if (!product) throw new Error('商品不存在')
      
      return this.success(product)
    } catch (error) {
      return this.fail(error)
    }
  }

  async create(data) {
    const transaction = await sequelize.transaction()
    
    try {
      const product = await Product.create(data, { transaction })
      
      await transaction.commit()
      
      return this.success(product, '创建商品成功')
    } catch (error) {
      await transaction.rollback()
      return this.fail(error)
    }
  }

  async update(id, data) {
    const product = await Product.findByPk(id)
    if (!product) throw new Error('商品不存在')

    const transaction = await sequelize.transaction()
    
    try {
      await product.update(data, { transaction })
      
      await transaction.commit()
      
      return this.success(product, '更新商品成功')
    } catch (error) {
      await transaction.rollback()
      return this.fail(error)
    }
  }

  async delete(id) {
    const product = await Product.findByPk(id)
    if (!product) throw new Error('商品不存在')

    const transaction = await sequelize.transaction()
    
    try {
      await product.destroy({ transaction })
      
      await transaction.commit()
      
      return this.success(null, '删除商品成功')
    } catch (error) {
      await transaction.rollback()
      return this.fail(error)
    }
  }

  async toggleStatus(id) {
    const product = await Product.findByPk(id)
    if (!product) throw new Error('商品不存在')

    const transaction = await sequelize.transaction()
    
    try {
      await product.update({ status: product.status === 1 ? 0 : 1 }, { transaction })
      
      await transaction.commit()
      
      return this.success(product, '状态更新成功')
    } catch (error) {
      await transaction.rollback()
      return this.fail(error)
    }
  }
}

module.exports = new ProductService() 
