/*
 * Módulo principal de configuración. Este módulo se encarga de obtener la
 * configuración principal del entorno, exponiendo finalmente la misma en un
 * objeto global.
 */

require('dotenv').config();

/*
 * Agrega más propiedades a un objeto, sin sobreescribir las que ya existían.
 */
const aggregate = (source, target) => {
  if (target && source && target instanceof Object && source instanceof Object) {
    Object.keys(source).forEach(key => {
      if (!Object.prototype.hasOwnProperty.call(target, key) || target[key] === undefined) {
        target[key] = source[key];
      } else {
        aggregate(source[key], target[key]);
      }
    });
  }
  return target;
};

/*
 * Configuración global de la aplicación.
 */
const baseConfig = {
  environment: process.env.NODE_ENV || 'development',
  server: {
    host: process.env.HOST || 'localhost',
    port: process.env.PORT || 8080,
    http: {
      bodySizeLimit: process.env.BODY_SIZE_LIMIT || 1024 * 1024 * 10,
      paginateLimit: process.env.PAGINATE_LIMIT || 3,
      paginateMaxLimit: process.env.PAGINATE_MAX_LIMIT || 50,
      parameterLimit: process.env.PARAMETER_LIMIT || 10000
    }
  },
  database: {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres'
  },
  app: {
    covidDataset: process.env.COVID_DATASET,
    cronScheduling: process.env.CRON_SCHEDULING || '0 0 20 * * *',
    localDataset: process.env.LOCAL_DATASET || 'dataset.csv'
  }
};

/*
 * Configuración específica del entorno.
 */
const envConfig = require(`./environment/${baseConfig.environment}`);

/*
 * Configuración final agregada.
 */
module.exports = aggregate(baseConfig, envConfig);
