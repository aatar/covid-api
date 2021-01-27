const { readCsv, count, getCases, stats, summary, provinces, lastUpdate } = require('./controllers/covid');

exports.init = app => {
  app.get('/', (req, res) => res.send('Welcome to Heroku'));
  app.get('/read-csv', readCsv);
  app.get('/count', count);
  app.get('/get-cases', getCases);
  app.get('/stats', stats);
  app.get('/summary', summary);
  app.get('/provinces', provinces);
  app.get('/last_update', lastUpdate);
};
