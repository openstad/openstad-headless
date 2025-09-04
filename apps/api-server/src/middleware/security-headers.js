const config = require('config');
const prefillAllowedDomains = require('../services/prefillAllowedDomains');
const URL    = require('url').URL;

module.exports = function( req, res, next ) {

	console.log('--- Security Headers Middleware ---');
	console.log('Request path:', req.path);
	console.log('Request method:', req.method);
	console.log('Request headers:', req.headers);

	let url = req.headers && req.headers.origin;
	console.log('Origin header:', url);

	let domain = '';
	try {
		domain = new URL(url).host;
		console.log('Parsed domain from origin:', domain);
	} catch(err) {
		console.log('Error parsing domain from origin:', err);
	}

	let allowedDomains = (req.project && req.project.config && req.project.config.allowedDomains) || config.allowedDomains;
	console.log('Initial allowedDomains:', JSON.stringify(allowedDomains) );

	allowedDomains = prefillAllowedDomains(allowedDomains || []);
	console.log('Prefilled allowedDomains:', JSON.stringify(allowedDomains) );

	if (!allowedDomains || allowedDomains.indexOf(domain) === -1) {
		console.log('Domain NOT allowed:', domain);
		url = config.url || req.protocol + '://' + req.host;
		console.log('Fallback url for Access-Control-Allow-Origin:', url);

		// Exception for URLs without project - we allow all origins
		if (
			req.headers && req.headers.origin &&
			(
				req.path.match('^(/api/repo|/api/template|/api/area|/api/widget|/api/image|/api/document|/api/widget-type|/widget|/api/project/0/tag|/$)') ||
				req.path.match('^(/api/lock(/[^/]*)?)$') ||
				(req.path.match('^(/api/user)') && req.method == 'GET') ||
				(req.path.match('^(/api/project)$') && req.method == 'GET')
			)
		) {
			url = req.headers.origin;
			console.log('No project, allowing origin:', url, req.path);
		}
	} else {
		console.log('Domain allowed:', domain);
	}

	if (config.dev && config.dev['Header-Access-Control-Allow-Origin'] && process.env.NODE_ENV == 'development') {
		res.header('Access-Control-Allow-Origin', config.dev['Header-Access-Control-Allow-Origin']);
		console.log('Development mode: using dev Access-Control-Allow-Origin:', config.dev['Header-Access-Control-Allow-Origin']);
	} else {
		res.header('Access-Control-Allow-Origin', url);
		console.log('Setting Access-Control-Allow-Origin header:', url);
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
		console.log('Set production security headers');
	}

	if (req.method === 'OPTIONS') {
		console.log('OPTIONS request, ending response');
		return res.end();
	}
	console.log('--- End Security Headers Middleware ---');
	return next();
}
