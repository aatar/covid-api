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
    port: parseInt(process.env.PORT) || 8443,
    certificate: process.env.CERTIFICATE || 'certificate.pem',
    privateKey: process.env.PRIVATE_KEY || 'private-key.pem',
    privateKeyPassphrase: process.env.PRIVATE_KEY_PASSPHRASE || 'private-key-passphrase',
    useTLS: process.env.USE_TLS === 'true',
    http: {
      bodySizeLimit: parseInt(process.env.BODY_SIZE_LIMIT) || 1024 * 1024 * 10,
      paginateLimit: parseInt(process.env.PAGINATE_LIMIT) || 3,
      paginateMaxLimit: parseInt(process.env.PAGINATE_MAX_LIMIT) || 50,
      parameterLimit: parseInt(process.env.PARAMETER_LIMIT) || 10000
    }
  },
  database: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT) || 5432,
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres'
  },
  app: {
    cacheCooldown: parseInt(process.env.CACHE_COOLDOWN) || 10,
    cacheSize: parseInt(process.env.CACHE_SIZE) || 128,
    covidDataset: process.env.COVID_DATASET || 'http://localhost:8081/dataset.csv',
    cronSchema: process.env.CRON_SCHEMA || '0 0 0 * * *',
    fireOnDeploy: process.env.FIRE_ON_DEPLOY === 'true',
    localDataset: process.env.LOCAL_DATASET || 'dataset_.csv',
    maximumCacheableSize: parseInt(process.env.MAXIMUM_CACHEABLE_SIZE) || 32,
    retryDownload: parseInt(process.env.RETRY_DOWNLOAD) || 10 * 60,
    shrinkingFactor: parseFloat(process.env.SHRINKING_FACTOR) || 0.5,
    updateTarget: parseInt(process.env.UPDATE_TARGET) || 1e5,
    uploadThreshold: parseInt(process.env.UPLOAD_THRESHOLD) || 8192
  },
  global: {
    caching: true,
    updating: false
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
