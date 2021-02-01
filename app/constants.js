const project = require('../package.json');

exports.DESCRIPTOR = {
  contributors: project.contributors,
  description: project.description,
  name: project.name.substring(1 + project.name.indexOf('/')),
  version: project.version
};

exports.API_BASE_URL = `/api/v${project.version}`;
