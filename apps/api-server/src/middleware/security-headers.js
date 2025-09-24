const config = require('config');
const prefillAllowedDomains = require('../services/prefillAllowedDomains');
const URL    = require('url').URL;

function logCORS(context, data) {
	console.log(`[${new Date().toISOString()}] [CORS] ${context}:`, data);
}

module.exports = function( req, res, next ) {

	let url = req.headers && req.headers.origin;

	let domain = ''
	try {
		domain = new URL(url).host;
	} catch(err) {	}

	let allowedDomains = (req.project && req.project.config && req.project.config.allowedDomains) || config.allowedDomains;
	allowedDomains = prefillAllowedDomains(allowedDomains || []);

	if ( url !== undefined ) {
		logCORS(`${url} ${(!allowedDomains || allowedDomains.indexOf(domain) === -1) ? 'is not allowed' : 'is allowed'}`, '');
	}

	if ( !allowedDomains || allowedDomains.indexOf(domain) === -1) {
		url = config.url || req.protocol + '://' + req.host;

		// Exception for URLs without project - we allow all origins
		// see project middleware for list of exceptions
		if (req.headers && req.headers.origin && (req.path.match('^(/api/repo|/api/template|/api/area|/api/widget|/api/image|/api/document|/api/widget-type|/widget|/api/project/0/tag|/$)') || req.path.match('^(/api/lock(/[^/]*)?)$') || (req.path.match('^(/api/user)') && req.method == 'GET') || (req.path.match('^(/api/project)$') && req.method == 'GET'))) {
				url = req.headers.origin;

				logCORS('Exception: allowing origin', {
					origin: req.headers.origin,
					path: req.path
				});
			} else {

			if ( req.headers && req.headers.origin ) {
				logCORS('Not allowed', {
					origin: req.headers.origin,
					path: req.path,
					method: req.method,
					url: req.url,
					newUrl: config.url || req.protocol + '://' + req.host,
					fullUrl: req.protocol + '://' + req.get('host') + req.originalUrl,
					peerName: req?.client?._peername || req?.client?.sockname || null,
					project: req.project ? req.project.id : null,
					allowedDomains
				});
			} else {
				logCORS('No origin header', {
					path: req.path,
					url: req.url,
					newUrl: config.url || req.protocol + '://' + req.host,
					fullUrl: req.protocol + '://' + req.get('host') + req.originalUrl,
					project: req.project ? req.project.id : null,
					allowedDomains
				});
			}

		}
	}
	
	if (config.dev && config.dev['Header-Access-Control-Allow-Origin'] && process.env.NODE_ENV == 'development') {
    res.header('Access-Control-Allow-Origin', config.dev['Header-Access-Control-Allow-Origin'] );
  } else {
    res.header('Access-Control-Allow-Origin', url );
  }
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS,PATCH');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With, x-http-method-override');
  res.header('Access-Control-Allow-Credentials', 'true');

	if (process.env.NODE_ENV != 'development') {
		res.header('Content-type', 'application/json; charset=utf-8');
		res.header('Strict-Transport-Security', 'max-age=31536000 ; includeSubDomains');
		res.header('X-Frame-Options', 'sameorigin');
		res.header('X-XSS-Protection', '1');
		res.header('X-Content-Type-Options', 'nosniff');
		res.header('Referrer-Policy', 'origin');
		res.header('Expect-CT', 'max-age=86400, enforce');
		res.header('Feature-Policy', 'vibrate \'none\'; geolocation \'none\'');
	}

	if (req.method === 'OPTIONS') {
		return res.end();
	}
	return next();
}
