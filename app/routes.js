const { readCsv, getCases, stats } = require('./controllers/covid');

exports.init = app => {
  app.get('/', (req, res) => res.send('Welcome to Heroku'));
  app.get('/read-csv', readCsv);
  app.get('/get-cases', getCases);
  app.get('/stats', stats);
};
