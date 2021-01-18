const errors = require('../errors'),
  logger = require('../logger');

const DEFAULT_STATUS_CODE = 500;

const statusCodes = {
  [errors.DATABASE_ERROR]: 503,
  [errors.DEFAULT_ERROR]: 500,
  [errors.SIGNUP_ERROR]: 409,
  [errors.SIGNIN_ERROR]: 401,
  [errors.SIGNOUT_ERROR]: 401,
  [errors.NOT_LOGGED_ERROR]: 401,
  [errors.NOT_HAS_ACCESS_ERROR]: 401,
  [errors.SCHEMA_ERROR]: 422,
  [errors.ALREADY_BOUGHT_ALBUM_ERROR]: 409,
  [errors.DIDNT_BUY_ALBUM_ERROR]: 409
};

exports.handle = (error, req, res, next) => {
  if (error.internalCode) {
    res.status(statusCodes[error.internalCode] || DEFAULT_STATUS_CODE);
  } else {
    // Unrecognized error, notifying it to rollbar.
    next(error);
    res.status(DEFAULT_STATUS_CODE);
  }
  logger.error(error);
  return res.send({ message: error.message, internal_code: error.internalCode });
};
