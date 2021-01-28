/*
 * Configuración de migración para Sequelize.
 */

const config = require('../config');

const sequelizeConfig = {};
sequelizeConfig[config.environment] = config.database;

module.exports = sequelizeConfig;
