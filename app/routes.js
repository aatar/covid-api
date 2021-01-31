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

const { DESCRIPTOR, API_BASE_URL } = require('./constants');

exports.init = app => {
  app.get('/', (req, res) => res.send(DESCRIPTOR));
  app.get(`${API_BASE_URL}/count`, count);
  app.get(`${API_BASE_URL}/get-cases`, getCases);
  app.get(`${API_BASE_URL}/last_update`, lastUpdate);
  app.get(`${API_BASE_URL}/province/:slug`, provinceCases);
  app.get(`${API_BASE_URL}/province/:slug/count`, provinceCount);
  app.get(`${API_BASE_URL}/province/:slug/stats`, provinceStats);
  app.get(`${API_BASE_URL}/province/:slug/summary`, provinceSummary);
  app.get(`${API_BASE_URL}/provinces`, provinces);
  app.get(`${API_BASE_URL}/stats`, stats);
  app.get(`${API_BASE_URL}/summary`, summary);
};
