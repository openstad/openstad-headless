const rateLimit = require('express-rate-limit');

const failCallback = function (req, res, next, options) {
  req.flash('error', { msg: options.message });
  const clientConfig = req.client.config ? req.client.config : {};
  const redirectUrl =
    clientConfig && clientConfig.emailRedirectUrl
      ? clientConfig.emailRedirectUrl
      : req.redirectUri
        ? encodeURIComponent(req.redirectUri)
        : '';
  res.redirect(
    '/login?clientId=' + req.client.clientId + '&redirect_uri=' + redirectUrl
  ); // brute force protection triggered, send them back to the login page
};

/**
 * Key for the login/forgot/unique-code limiters.
 *
 * Sessions are created for every request (saveUninitialized), so a client
 * that simply drops the cookie gets a fresh session id, and a limiter keyed
 * on the session id never trips. Key on the client IP instead, combined with
 * the submitted e-mail/phone/code when there is one, so one IP cannot try the
 * same account endlessly and one account cannot be locked by a stranger
 * hitting it from elsewhere.
 */
function bruteKey(req) {
  const ip = (
    req.ip ||
    (req.connection && req.connection.remoteAddress) ||
    'unknown'
  ).toString();
  const body = req.body || {};
  const subject =
    body.email || body.phoneNumber || body.uniqueCode || body.code || '';
  const normalized = String(subject).trim().toLowerCase().slice(0, 254);
  return normalized ? `${ip}|${normalized}` : ip;
}
exports.bruteKey = bruteKey;

//CONFIGURE BRUTE FORCE PROTECT
let userLimiter = rateLimit({
  keyGenerator: (req, res) => req.bruteKey,
  windowMs: 15 * 60 * 1000,
  max: 50,
  standardHeaders: true,
  legacyHeaders: false,
  message:
    'U heeft te vaak gepoogd in te loggen, probeer het weer over 15 minuten',
  handler: failCallback,
});
exports.user = [
  function (req, res, next) {
    req.brute = userLimiter;
    req.bruteKey = bruteKey(req);
    return next();
  },
  userLimiter,
];

//CONFIGURE BRUTE FORCE PROTECT
let userVeryRestrictedLimiter = rateLimit({
  keyGenerator: (req, res) => req.bruteKey,
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message:
    'U heeft te vaak gepoogd in te loggen, probeer het weer over 15 minuten',
  handler: failCallback,
});
exports.userVeryRestricted = [
  function (req, res, next) {
    req.brute = userVeryRestrictedLimiter;
    req.bruteKey = bruteKey(req);
    return next();
  },
  userVeryRestrictedLimiter,
];

//CONFIGURE BRUTE FORCE PROTECT
let globalLimiter = rateLimit({
  keyGenerator: (req, res) => req.bruteKey,
  windowMs: 15 * 60 * 1000,
  max: 1000,
  standardHeaders: true,
  legacyHeaders: false,
  message:
    'U heeft te vaak gepoogd in te loggen, probeer het weer over 15 minuten',
  handler: failCallback,
});
exports.global = [
  function (req, res, next) {
    req.brute = globalLimiter;
    req.bruteKey = bruteKey(req);
    return next();
  },
  globalLimiter,
];
