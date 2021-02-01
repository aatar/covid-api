const { expressMiddleware, expressRequestIdMiddleware } = require('express-wolox-logger'),
  bodyParser = require('body-parser'),
  config = require('./config'),
  cors = require('cors'),
  errors = require('./app/middlewares/errors'),
  express = require('express'),
  paginate = require('express-paginate'),
  project = require('./package.json'),
  routes = require('./app/routes'),
  { cacheTrap } = require('./app/cache');

const httpConfig = config.server.http;

/*
 * Constantes.
 */
const PROJECT_NAME = project.name.substring(1 + project.name.indexOf('/'));
const MIME_TYPE = `application/vnd.${PROJECT_NAME}-v${project.version}+json`;

const bodyParserJsonConfig = () => ({
  limit: httpConfig.bodySizeLimit,
  parameterLimit: httpConfig.parameterLimit
});

const bodyParserUrlencodedConfig = () => ({
  extended: true,
  limit: httpConfig.bodySizeLimit,
  parameterLimit: httpConfig.parameterLimit
});

const app = express();

app.use(bodyParser.json(bodyParserJsonConfig()));
app.use(bodyParser.urlencoded(bodyParserUrlencodedConfig()));
app.use(expressRequestIdMiddleware);
app.use(cors());
app.use(paginate.middleware(httpConfig.paginateLimit, httpConfig.paginateMaxLimit));
app.use((req, res, next) => {
  res.type(MIME_TYPE);
  next();
});
app.use(cacheTrap);

if (config.environment !== 'testing') {
  app.use(expressMiddleware);
}

routes.init(app);

app.use(errors.handle);

module.exports = app;
