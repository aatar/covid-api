const app = require('./app'),
  config = require('./config'),
  logger = require('./app/logger'),
  migrationsManager = require('./migrations');

const { port } = config.server;

Promise.resolve()
  .then(() => migrationsManager.check())
  .then(() => {
    app.listen(port);
    logger.info(`Listening on port: ${port}.`);
  })
  .catch(logger.error);
