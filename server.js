/*
 * Módulo principal del servidor.
 */

const app = require('./app'),
  config = require('./config'),
  log = require('./app/logger'),
  migrationsManager = require('./migrations');

const { host, port } = config.server;
const { covidDataset, cronSchema, fireOnDeploy, localDataset, retryDownload } = config.app;
const { download, exception, schedule, store } = require('./app/persistence');

/*
 * La tarea recurrente encargada de descargar el nuevo dataset de casos del
 * virus SARS-CoV-2 en Argentina. Si la misma falla, se reprograma para
 * ejecutarse en un lapso especificado, usualmente mucho más corto, lo que
 * evita la larga espera hasta el próximo ciclo (de 1 día, por defecto).
 */
const covidTask = () => {
  log.info('Executing scheduled task: COVID...');
  return download(covidDataset, localDataset)
    .then(store)
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
    app.listen(port, host);
    log.info(`Listening on http://${host}:${port}/.`);
  })
  .then(() => {
    if (fireOnDeploy) {
      log.info('Firing COVID-task on deploy...');
      covidTask();
    }
  })
  .then(() => schedule(cronSchema, covidTask))
  .catch(log.error);
