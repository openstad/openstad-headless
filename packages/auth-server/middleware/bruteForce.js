const rateLimit = require('express-rate-limit');

const failCallback = function (req, res, next, options) {
  req.flash('error', { msg: options.message });
  const clientConfig = req.client.config ? req.client.config : {};
  const redirectUrl = clientConfig && clientConfig.emailRedirectUrl ? clientConfig.emailRedirectUrl : encodeURIComponent(req.query.redirect_uri);
  res.redirect('/login?clientId=' + req.client.clientId + '&redirect_uri=' + redirectUrl); // brute force protection triggered, send them back to the login page
};

//CONFIGURE BRUTE FORCE PROTECT
let userLimiter = rateLimit({
  keyGenerator: (req, res) => req.bruteKey,
	windowMs: 15 * 60 * 1000,
	max: 50,
	standardHeaders: true,
	legacyHeaders: false,
  message: 'U heeft te vaak gepoogd in te loggen, probeer het weer over 15 minuten',
  handler: failCallback,
});
exports.user = [ 
  function (req, res, next) {
    req.brute = userLimiter;
    req.bruteKey = req.session && req.session.id || req.ip;
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
  message: 'U heeft te vaak gepoogd in te loggen, probeer het weer over 15 minuten',
  handler: failCallback,
});
exports.userVeryRestricted = [ 
  function (req, res, next) {
    req.brute = userVeryRestrictedLimiter;
    req.bruteKey = req.session && req.session.id || req.ip;
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
  message: 'U heeft te vaak gepoogd in te loggen, probeer het weer over 15 minuten',
  handler: failCallback,
});
exports.global = [ 
  function (req, res, next) {
    req.brute = globalLimiter;
    req.bruteKey = req.session && req.session.id || req.ip;
    return next();
  },
  globalLimiter,
];
