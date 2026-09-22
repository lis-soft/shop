module.exports = {
  db: {
    host: '127.0.0.1',
    port: 3306,
    name: 'yysd',
    user: 'yysd',
    password: '线上数据库密码',
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
  }
}
