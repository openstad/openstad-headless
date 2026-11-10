const normalizeEmail = require('../utils/normalizeEmail');

/**
 * Normalise the submitted e-mail address before any lookup or validation runs,
 * so login, registration, the e-mail link and the forgot form all see the same
 * canonical value. Only the e-mail is touched; passwords keep their spaces.
 */
module.exports = (req, res, next) => {
  if (req.body && typeof req.body.email === 'string')
    req.body.email = normalizeEmail(req.body.email);
  if (req.query && typeof req.query.email === 'string')
    req.query.email = normalizeEmail(req.query.email);
  next();
};
