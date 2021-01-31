/*
 * El API propiamente dicha.
 */

const config = require('../config'),
  covid = require('./controllers/covid'),
  project = require('../package.json'),
  { cached } = require('./cache');

exports.init = app => {
  /*
   * Punto de entrada principal. Devuelve información básica del API.
   */
  app.get('/', (req, res) => {
    res.send({
      caching: config.global.caching,
      contributors: project.contributors,
      description: project.description,
      name: project.name.substring(1 + project.name.indexOf('/')),
      updating: config.global.updating,
      version: project.version
    });
  });

  /*
   * Endpoints para consultar la base de datos de casos de SARS-CoV-2. No
   * todos operan debajo de la caché debido a que pueden incurrir en grandes
   * cantidades de objetos.
   */
  app.get('/count', cached(covid.count));
  app.get('/get-cases', covid.getCases);
  app.get('/last_update', cached(covid.lastUpdate));
  app.get('/province/:slug', covid.provinceCases);
  app.get('/province/:slug/count', cached(covid.provinceCount));
  app.get('/province/:slug/stats', cached(covid.provinceStats));
  app.get('/province/:slug/summary', cached(covid.provinceSummary));
  app.get('/provinces', cached(covid.provinces));
  app.get('/stats', cached(covid.stats));
  app.get('/summary', cached(covid.summary));
};
