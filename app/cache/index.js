/*
 * Módulo de caché determinística en memoria. Su objetivo es almacenar en
 * memoria la mayor cantidad de responses HTTP con el motivo de evitar el
 * acceso y la consulta de la base de datos, así como también la computación
 * de alguna consulta compleja extensiva sobre todo el dataset.
 *
 * Para evitar un uso desmedido de recursos, la caché controla su propio
 * tamaño. La cantidad de entradas se reordena según la cantidad de caché-hits
 * que cada endpoint posea, con lo cual las consultas más populares permanecen
 * en la caché durante más tiempo, aunque este mecanismo es aplicable cuando
 * la caché alcanza su tamaño máximo permitido.
 *
 * Finalmente, y debido a que los endpoints poseen parámetros, la caché se
 * encarga de normalizar el orden de los mismos. Gracias a esto, la ejecución
 * de 2 consultas equivalentes con diferente ordenamiento produce un
 * caché-hit como es esperado (i.e., la normalización es deerminística).
 */

/* eslint-disable no-underscore-dangle */

const config = require('../../config'),
  log = require('../logger');

/*
 * Constantes.
 */
const CACHE_HEADER = 'X-COVID-API-Deterministic-Endpoint';
const CACHE_SIZE = 1024 * 1024 * config.app.cacheSize;
const CONTENT_LENGTH = 'content-length';
const MAXIMUM_CACHEABLE_SIZE = 1024 * 1024 * config.app.maximumCacheableSize;
const SHRINKING_FACTOR = config.app.shrinkingFactor;
const QUERY_SCHEMA = new Set()
  .add('classification')
  .add('dead')
  .add('from')
  .add('icu')
  .add('respirator')
  .add('to');

/*
 * La caché y la caché temporal regulada.
 */
const cache = new Map();
const throttledCache = new Map();
let sizeInBytes = 0;

/*
 * El normalizador, quien se encarga de transformar la consulta de forma
 * determinística con el objetivo de incrementar la proporción de cache-hits.
 */
const deterministic = request => {
  const properties = [];
  for (const property in request.query) {
    if (QUERY_SCHEMA.has(property) && Object.prototype.hasOwnProperty.call(request.query, property)) {
      properties.push(`${property}=${request.query[property]}`);
    }
  }
  const query = JSON.stringify(properties.sort());
  if (request.path.lastIndexOf('/') + 1 === request.path.length) {
    const pathWithoutSlash = request.path.substring(0, request.path.lastIndexOf('/'));
    return `${pathWithoutSlash}?${query}`;
  }
  return `${request.path}?${query}`;
};

/*
 * Indica si la caché está habilitada o no.
 */
const isEnabled = () => config.global.caching === true;

/*
 * Construye el ranking the endpoints de la caché.
 */
const ranking = () => {
  const ranking_ = [];
  for (const [endpoint, record] of cache) {
    ranking_.push([endpoint, record]);
  }
  ranking_.sort((x, y) => {
    const result = x[1].hits - y[1].hits;
    return result === 0 ? x[1].size - y[1].size : result;
  });
  return ranking_;
};

/*
 * El proceso de reducción de caché emplea un ranking de endpoints ordenados
 * por cantidad de hits y tamaño en bytes de forma ascendente. De esta forma,
 * el algoritmo elimina las entradas menos usadas y a la vez menos pesadas
 * (es decir, si 2 entradas son igual de populares, se elimina la que ocupa
 * menos espacio en la caché).
 */
const shrink = () => {
  log.info(`Removing at least ${100 * SHRINKING_FACTOR} % of the cache...`);
  const ranking_ = ranking();
  const targetSize = CACHE_SIZE * (1 - SHRINKING_FACTOR);
  for (let i = 0; i < ranking_.length && targetSize < sizeInBytes; ++i) {
    sizeInBytes -= ranking_[i][1].size;
    cache.delete(ranking_[i][0]);
  }
  const sizeInMiB = sizeInBytes / (1024 * 1024);
  log.info(`Cache successfully shrinked. The new size is ${sizeInBytes} bytes (${sizeInMiB} MiB).`);
};

/*
 * Almacena efectivamente un objeto en forma de string en la caché. Al hacerlo
 * emplea el endpoint determinístico como clave, y agrega junto con el objeto
 * la cantidad de cache-hits y el tamaño en bytes. Nótese que el tamaño
 * almacenado no es tamaño real del objeto, si no más bien la cantidad de
 * memoria requerida en la aplicación. En caso de superar el tamaño máximo
 * permitido, se ejecuta el proceso de reducción (shrink).
 */
const save = (endpoint, payload) => {
  const json = JSON.stringify(payload);
  sizeInBytes += 2 * json.length;
  cache.set(endpoint, {
    size: 2 * json.length,
    hits: 0,
    payload: json
  });
  const sizeInMiB = sizeInBytes / (1024 * 1024);
  log.info(`Save response in cache. Current size is ${sizeInBytes} bytes (${sizeInMiB} MiB).`);
  if (CACHE_SIZE < sizeInBytes) {
    log.info(`Cache's maximum size exceeded (${CACHE_SIZE} bytes). Shrinking...`);
    shrink();
  }
  return json;
};

module.exports = {
  /*
   * Wrapper de endpoints. Actúa al igual que un proxy/interceptor.
   */
  cached(controller) {
    return (req, res) => {
      if (isEnabled()) {
        const endpoint = deterministic(req);
        if (cache.has(endpoint)) {
          const record = cache.get(endpoint);
          ++record.hits;
          log.info(`Cache hit! Total hits for this endpoint: ${record.hits}.`);
          return res.send(record.payload);
        }
        log.info('Cache miss!');
        const cacher = Object.create(null);
        cacher.send = payload => res.send(save(endpoint, payload));
        return controller(req, cacher);
      }
      return controller(req, res);
    };
  },

  /*
   * Middleware para atrapar objetos con regulación de caché.
   */
  cacheTrap(req, res, next) {
    res.on('finish', () => {
      const endpoint = res.get(CACHE_HEADER);
      const size = res.get(CONTENT_LENGTH);
      if (endpoint && size) {
        log.info(`Trapped object with throttled-cache of size: ${2 * size} bytes.`);
        if (MAXIMUM_CACHEABLE_SIZE < 2 * size) {
          log.info('The object is heavier than the maximum allowed. Not caching.');
        } else {
          log.info('Caching...');
          const payload = throttledCache.get(endpoint);
          if (payload) {
            save(endpoint, payload);
          }
        }
      }
      throttledCache.delete(endpoint);
    });
    next();
  },

  /*
   * Deshabilitar la cache.
   */
  disable() {
    log.info('Cache disabled.');
    config.global.caching = false;
  },

  /*
   * Habilitar la cache.
   */
  enable() {
    log.info('Cache enabled.');
    config.global.caching = true;
  },

  /*
   * Devuelve el ranking de endpoints registrados en la caché actualmente. Los
   * más populares y más grandes primero.
   */
  endpoints() {
    const ranking_ = ranking().reverse();
    const rank = [];
    for (let i = 0; i < ranking_.length; ++i) {
      rank[i] = {
        endpoint: ranking_[i][0],
        hits: ranking_[i][1].hits,
        size: ranking_[i][1].size
      };
    }
    return rank;
  },

  /*
   * Vacía la cache.
   */
  invalidate() {
    log.info('Invalidating cache...');
    throttledCache.clear();
    cache.clear();
    sizeInBytes = 0;
    log.info('The cache is empty now. Waiting for queries...');
  },

  /*
   * Devuelve el tamaño de la caché en bytes.
   */
  size() {
    return sizeInBytes;
  },

  /*
   * Aplica un wrapper al controlador pero con regulación, a diferencia del
   * método 'cached', con el objeto de limitar el tamaño máximo de los objetos
   * almacenados en la caché.
   */
  throttledCached(controller) {
    return (req, res) => {
      if (isEnabled()) {
        const endpoint = deterministic(req);
        if (cache.has(endpoint)) {
          const record = cache.get(endpoint);
          ++record.hits;
          log.info(`Cache hit! Total hits for this endpoint: ${record.hits}.`);
          return res.send(record.payload);
        }
        log.info('Cache miss!');
        const cacher = Object.create(null);
        cacher.send = payload => {
          throttledCache.set(endpoint, payload);
          return res.send(payload);
        };
        res.set(CACHE_HEADER, endpoint);
        return controller(req, cacher);
      }
      return controller(req, res);
    };
  }
};
