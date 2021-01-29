/*
 * Módulo principal del servidor.
 */

const app = require('./app'),
  config = require('./config'),
  log = require('./app/logger'),
  migrationsManager = require('./migrations');

const { host, port } = config.server;
const { covidDataset, cronSchema, fireOnDeploy, localDataset } = config.app;
const { download, exception, schedule, store } = require('./app/persistence');

/*
 * La tarea recurrente encargada de descargar el nuevo dataset de casos del
 * virus SARS-CoV-2 en Argentina.
 */
const covidTask = () => {
  log.info('Executing scheduled task: COVID...');
  return download(covidDataset, localDataset)
    .then(store)
    .catch(error => {
      if (error instanceof exception.DownloadError) {
        log.error(`${error} (${error.statusCode} : ${error.statusMessage}).`);
      } else {
        log.error(error);
      }
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
