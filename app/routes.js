const {
  count,
  getCases,
  lastUpdate,
  provinceCases,
  provinceCount,
  provinceStats,
  provinceSummary,
  provinces,
  stats,
  summary
} = require('./controllers/covid');

const descriptor = {
  name: 'covid-api',
  version: '0.1.0'
};

exports.init = app => {
  app.get('/', (req, res) => res.send(descriptor));
  app.get('/count', count);
  app.get('/get-cases', getCases);
  app.get('/last_update', lastUpdate);
  app.get('/province/:slug', provinceCases);
  app.get('/province/:slug/count', provinceCount);
  app.get('/province/:slug/stats', provinceStats);
  app.get('/province/:slug/summary', provinceSummary);
  app.get('/provinces', provinces);
  app.get('/stats', stats);
  app.get('/summary', summary);
};
