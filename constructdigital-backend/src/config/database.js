const { Sequelize } = require('sequelize')
const { db: dbConfig } = require('./config')

const sequelize = new Sequelize(
  dbConfig.name,
  dbConfig.user,
  dbConfig.password,
  {
    host: dbConfig.host,
    port: dbConfig.port,
    dialect: dbConfig.dialect,
    timezone: dbConfig.timezone,
    logging: dbConfig.logging,
    dialectOptions: {
      dateStrings: true,
      typeCast: true,
      timezone: dbConfig.timezone
    }
  }
)

module.exports = sequelize 