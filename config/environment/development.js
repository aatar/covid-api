const logger = require('../../app/logger');

module.exports = {
  database: {
    dialect: process.env.DB_DIALECT || 'postgres',
    database: process.env.DB_NAME_DEV || 'postgres',
    logging: logger.info,
    operatorsAliases: false
  }
};
