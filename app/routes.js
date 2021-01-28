const { count, getCases, stats, provinces, lastUpdate } = require('./controllers/covid');

const descriptor = {
  name: 'covid-api',
  version: '0.1.0'
};

exports.init = app => {
  app.get('/', (req, res) => res.send(descriptor));
  app.get('/count', count);
  app.get('/get-cases', getCases);
  app.get('/stats', stats);
  app.get('/provinces', provinces);
  app.get('/last_update', lastUpdate);
};
