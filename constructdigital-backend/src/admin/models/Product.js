const { Model, DataTypes } = require('sequelize')
const sequelize = require('@/config/database')

class Product extends Model {}

Product.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    comment: 'ID'
  },
  product_title: {
    type: DataTypes.STRING(255),
    allowNull: false,
    comment: '标题'
  },
  product_info: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: '简介'
  },
  product_pic: {
    type: DataTypes.STRING(255),
    allowNull: true,
    comment: '图片'
  },
  product_link: {
    type: DataTypes.STRING(500),
    allowNull: true,
    comment: '链接'
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    comment: '价格'
  },
  commission: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    comment: '商品利润率（%）'
  },
  status: {
    type: DataTypes.TINYINT(1),
    allowNull: false,
    defaultValue: 1,
    comment: '状态:0=下架, 1=上架'
  },
  created_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
    comment: '创建时间'
  },
  updated_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
    comment: '更新时间'
  }
}, {
  sequelize,
  modelName: 'Product',
  tableName: 'fz_product',
  timestamps: false
})

module.exports = Product 
