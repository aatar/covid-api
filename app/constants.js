const project = require('../package.json');

exports.DESCRIPTOR = {
  contributors: project.contributors,
  description: project.description,
  name: project.name.substring(1 + project.name.indexOf('/')),
  version: project.version,
  swagger: 'https://covid19api.it.itba.edu.ar/api/v0.1.0/swagger/'
};

exports.API_BASE_URL = `/api/v${project.version}`;
