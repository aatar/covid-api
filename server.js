/*
 * Módulo principal del servidor.
 */

const app = require('./app'),
  config = require('./config'),
  extract = require('extract-zip'),
  fs = require('fs'),
  http = require('http'),
  https = require('https'),
  log = require('./app/logger'),
  migrationsManager = require('./migrations'),
  path = require('path');

const { certificate, host, port, privateKey, privateKeyPassphrase, useTLS } = config.server;
const {
  covidDataset,
  cronSchema,
  fireOnDeploy,
  localDataset,
  retryDownload,
  unzippedDataset,
  useFastStore
} = config.app;
const { download, exception, fastStore, schedule, store } = require('./app/persistence');
const ENCODING = 'utf8';

/*
 * La tarea recurrente encargada de descargar el nuevo dataset de casos del
 * virus SARS-CoV-2 en Argentina. Si la misma falla, se reprograma para
 * ejecutarse en un lapso especificado, usualmente mucho más corto, lo que
 * evita la larga espera hasta el próximo ciclo (de 1 día, por defecto).
 */
const covidTask = () => {
  log.info('Executing scheduled task: COVID...');
  return download(covidDataset, localDataset)
    .then(async dataset => {
      if (dataset.endsWith('.zip')) {
        log.info(`Extracting file '${dataset}'.`);
        await extract(dataset, { dir: __dirname });
        log.info(`File extraction completed on '${__dirname}'.`);
        return path.join(__dirname, unzippedDataset);
      }
      log.info(`The dataset '${dataset}', doesn't require ZIP-extraction.`);
      return dataset;
    })
    .then(dataset => {
      log.info(`Storing file '${dataset}'...`);
      if (useFastStore) {
        return fastStore(dataset);
      }
      return store(dataset);
    })
    .catch(error => {
      if (error instanceof exception.DownloadError) {
        log.error(`${error} (${error.statusCode} : ${error.statusMessage}).`);
      } else if (error instanceof exception.IncompleteDownloadError) {
        log.error(error);
      } else if (error instanceof exception.ConnectionRefusedError) {
        log.error(error);
      } else {
        log.error('Unknown error in COVID-task...');
        log.error(error);
      }
      log.info(`Retrying download in ${retryDownload} s.`);
      setTimeout(covidTask, 1000 * retryDownload);
    });
};

/*
 * Desplegar el servidor.
 */
Promise.resolve()
  .then(() => migrationsManager.check())
  .then(() => {
    if (useTLS) {
      https
        .createServer(
          {
            cert: fs.readFileSync(certificate, ENCODING),
            key: fs.readFileSync(privateKey, ENCODING),
            passphrase: fs.readFileSync(privateKeyPassphrase, ENCODING).trimEnd()
          },
          app
        )
        .listen(port, host);
      log.info(`Listening on https://${host}:${port}/. TLS enabled.`);
    } else {
      http.createServer({}, app).listen(port, host);
      log.info(`Listening on http://${host}:${port}/. TLS disabled.`);
    }
  })
  .then(() => {
    if (fireOnDeploy) {
      log.info('Firing COVID-task on deploy...');
      covidTask();
    }
  })
  .then(() => schedule(cronSchema, covidTask))
  .catch(log.error);
