const config = require('config');
const URL = require('url').URL;

function getParentDomains(hostname) {
  const parts = hostname.split('.');
  const parents = [];
  for (let i = 1; i < parts.length - 1; i++) {
    parents.push(parts.slice(i).join('.'));
  }
  return parents;
}

module.exports = function (req, res, next) {
  let origin = req.headers && req.headers.origin;

  let domain = '';
  try {
    domain = new URL(origin).hostname;
  } catch (err) {}

  let allowedDomains =
    (req.client && req.client.allowedDomains) ||
    process.env.ALLOWED_ADMIN_DOMAINS;
  let whitelist = Array.isArray(allowedDomains)
    ? allowedDomains
    : (allowedDomains || '').split(',');

  const expanded = [];
  for (const d of whitelist) {
    const host = (d || '').trim();
    if (!host) continue;
    expanded.push(host);
    for (const parent of getParentDomains(host.split(':')[0])) {
      expanded.push(parent);
    }
  }

  const stripWww = (d) => (d && d.startsWith('www.') ? d.slice(4) : d);
  const normalizedDomain = stripWww(domain);
  const isDomainAllowed = expanded.some(
    (d) => stripWww(d) === normalizedDomain
  );

  if (isDomainAllowed) {
    res.header('Access-Control-Allow-Origin', origin);
  } else if (
    config.dev &&
    config.dev['Header-Access-Control-Allow-Origin'] &&
    process.env.NODE_ENV == 'development'
  ) {
    res.header(
      'Access-Control-Allow-Origin',
      config.dev['Header-Access-Control-Allow-Origin']
    );
  } else {
    if (config.url) {
      res.header('Access-Control-Allow-Origin', config.url);
    }
  }
  res.header(
    'Access-Control-Allow-Methods',
    'GET,PUT,POST,DELETE,OPTIONS,PATCH'
  );
  res.header(
    'Access-Control-Allow-Headers',
    'Content-Type, Authorization, Content-Length, X-Requested-With, x-http-method-override'
  );
  res.header('Access-Control-Allow-Credentials', 'true');

  if (process.env.NODE_ENV != 'development') {
    res.header('Content-type', 'application/json; charset=utf-8');
    res.header(
      'Strict-Transport-Security',
      'max-age=31536000 ; includeSubDomains'
    );
    res.header('X-Frame-Options', 'sameorigin');
    res.header('X-XSS-Protection', '1');
    res.header('X-Content-Type-Options', 'nosniff');
    res.header('Referrer-Policy', 'origin');
    res.header('Expect-CT', 'max-age=86400, enforce');
    res.header('Feature-Policy', "vibrate 'none'; geolocation 'none'");
  }

  if (req.method === 'OPTIONS') {
    return res.end();
  }
  return next();
};
