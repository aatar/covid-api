module.exports = {
  database: {
    dialect: process.env.DB_DIALECT || 'postgres',
    database: process.env.DB_NAME_TEST || 'postgres',
    logging: false
  }
};
