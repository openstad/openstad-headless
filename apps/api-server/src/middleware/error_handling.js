var createError = require('http-errors');
var statuses    = require('statuses');

module.exports = function( app ) {

	// We only get here when the request has not yet been handled by a route.
	app.use(function( req, res, next ) {
		console.log('4040404');
		next(createError(404, 'Pagina niet gevonden'));
	});

	app.use(function handleError( err, req, res, next ) {

    console.log(err);

		var env            = app.get('env');
		var status         = err.status || ( err.name && err.name == 'SequelizeValidationError' && 400 ) || 500;
		var userIsAdmin    = req.user && req.user.role && req.user.role == 'admin';
		var showDebug      = status == 500 && (env === 'development' || userIsAdmin);
		var friendlyStatus = statuses[status]
		var stack          = err.stack || err.toString();
		var message        = err.message || err.error;
    message = message && message.replace(/Validation error:?\s*/, '');
		var errorStack     = showDebug ? stack : '';

		res.status(status);
		res.json({
			status         : status,
			friendlyStatus : friendlyStatus,
			message        : message,
			errorStack     : errorStack.replace(/\x20{2}/g, ' &nbsp;'),
			error          : message || err
		});
	});
};
