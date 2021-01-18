const { readCsv, getCases } = require('./controllers/covid');

exports.init = app => {
  app.get('/', (req, res) => res.send('Welcome to Heroku'));
  app.get('/read-csv', readCsv);
  app.get('/get-cases', getCases);
};
