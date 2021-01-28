const { expressMiddleware, expressRequestIdMiddleware } = require('express-wolox-logger'),
  bodyParser = require('body-parser'),
  config = require('./config'),
  cors = require('cors'),
  errors = require('./app/middlewares/errors'),
  express = require('express'),
  paginate = require('express-paginate'),
  routes = require('./app/routes');

const httpConfig = config.server.http;

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

// Client must send "Content-Type: application/json" header:
app.use(bodyParser.json(bodyParserJsonConfig()));
app.use(bodyParser.urlencoded(bodyParserUrlencodedConfig()));
app.use(expressRequestIdMiddleware);
app.use(cors());
app.use(paginate.middleware(httpConfig.paginateLimit, httpConfig.paginateMaxLimit));

if (config.environment !== 'testing') {
  app.use(expressMiddleware);
}

routes.init(app);

app.use(errors.handle);

module.exports = app;
