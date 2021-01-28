const config = require('./../config/'),
  logger = require('../app/logger'),
  { sequelize } = require('../app/models'),
  Umzug = require('umzug');

exports.check = () => {
  const umzug = new Umzug({
    logging: logger.info,
    storage: 'sequelize',
    storageOptions: { sequelize },
    migrations: {
      params: [
        sequelize.getQueryInterface(),
        sequelize.constructor,
        () => {
          throw new Error('Migration tried to use old style "done" callback.upgrade.');
        }
      ],
      path: `${__dirname}/migrations`,
      pattern: /\.js$/
    }
  });
  return umzug.pending().then(migrations => {
    if (migrations.length) {
      if (config.environment !== 'production') {
        return Promise.reject(new Error('Pending migrations, run: npm run migrations.'));
      }
      return umzug.up().catch(err => {
        logger.error(err);
        return Promise.reject(new Error('There are pending migrations that could not be executed.'));
      });
    }
    return Promise.resolve();
  });
};
