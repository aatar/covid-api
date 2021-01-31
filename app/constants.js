const config = require('../config'),
  project = require('../package.json');

exports.DESCRIPTOR = {
  caching: config.global.caching,
  contributors: project.contributors,
  description: project.description,
  name: project.name.substring(1 + project.name.indexOf('/')),
  updating: config.global.updating,
  version: project.version
};

exports.API_BASE_URL = `/api/v${project.version}`;
