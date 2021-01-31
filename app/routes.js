/*
 * El API propiamente dicha.
 */

const covid = require('./controllers/covid'),
  { cached } = require('./cache'),
  { DESCRIPTOR, API_BASE_URL } = require('./constants');

exports.init = app => {
  /*
   * Punto de entrada principal. Devuelve información básica del API.
   */
  app.get('/', (req, res) => res.send(DESCRIPTOR));

  /*
   * Endpoints para consultar la base de datos de casos de SARS-CoV-2. No
   * todos operan debajo de la caché debido a que pueden incurrir en grandes
   * cantidades de objetos.
   */
  app.get(`${API_BASE_URL}/count`, cached(covid.count));
  app.get(`${API_BASE_URL}/get-cases`, covid.getCases);
  app.get(`${API_BASE_URL}/last_update`, cached(covid.lastUpdate));
  app.get(`${API_BASE_URL}/province/:slug`, covid.provinceCases);
  app.get(`${API_BASE_URL}/province/:slug/count`, cached(covid.provinceCount));
  app.get(`${API_BASE_URL}/province/:slug/stats`, cached(covid.provinceStats));
  app.get(`${API_BASE_URL}/province/:slug/summary`, cached(covid.provinceSummary));
  app.get(`${API_BASE_URL}/provinces`, cached(covid.provinces));
  app.get(`${API_BASE_URL}/stats`, cached(covid.stats));
  app.get(`${API_BASE_URL}/summary`, cached(covid.summary));
};
