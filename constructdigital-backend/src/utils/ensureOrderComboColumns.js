const { DataTypes } = require('sequelize')
const sequelize = require('@/config/database')

async function ensureOrderComboColumns() {
  const queryInterface = sequelize.getQueryInterface()
  const table = await queryInterface.describeTable('fz_order')
  const columns = [
    {
      name: 'is_manual',
      spec: {
        type: DataTypes.TINYINT,
        allowNull: false,
        defaultValue: 0,
        comment: '卡单 0-否 1-是'
      }
    },
    {
      name: 'sequence_no',
      spec: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        comment: '本轮订单序号'
      }
    },
    {
      name: 'settlement_held',
      spec: {
        type: DataTypes.TINYINT,
        allowNull: false,
        defaultValue: 0,
        comment: '连单待统一结算 0-否 1-是'
      }
    }
  ]

  for (const column of columns) {
    if (table[column.name]) {
      continue
    }

    await queryInterface.addColumn('fz_order', column.name, column.spec)
  }
}

module.exports = ensureOrderComboColumns
