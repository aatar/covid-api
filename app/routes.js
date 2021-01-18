const { readCsv } = require('./controllers/covid');

exports.init = app => {
  app.get('/', (req, res) => res.send('Welcome to Heroku'));
  app.get('/read-csv', readCsv);
};
