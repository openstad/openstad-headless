var createError = require('http-errors');
var statuses = require('statuses');

module.exports = function (app) {
  // We only get here when the request has not yet been handled by a route.
  app.use(function (req, res, next) {
    console.log('404 handler, url: ', req.originalUrl);
    next(createError(404, 'Pagina niet gevonden'));
  });

  app.use(function handleError(err, req, res, next) {
    var env = app.get('env');
    var status =
      err.status ||
      (err.name && err.name == 'SequelizeValidationError' && 400) ||
      500;
    var userIsAdmin = req.user && req.user.role && req.user.role == 'admin';
    var isDev = env === 'development';
    var showDebug = isDev || userIsAdmin;
    var friendlyStatus = statuses[status];
    var stack = err.stack || err.toString();
    var message = err.message || err.error;
    message = message && message.replace(/Validation error:?\s*/, '');

    // Always log full error server-side
    if (status >= 500) {
      console.error(stack);
    }

    // For 500 errors, only show details to admins or in development
    var safeMessage =
      status >= 500 && !showDebug ? 'Er is iets misgegaan' : message;

    res.status(status);
    res.json({
      status: status,
      friendlyStatus: friendlyStatus,
      message: safeMessage,
      errorStack: showDebug ? stack : '',
    });
  });
};
