// ----------------------------------------------------------------------------------------------------
// check action on user roles
// ----------------------------------------------------------------------------------------------------

const config = require('config');
const db = require('../../../db'); // TODO: dit moet dus anders

/**
 * Add authenticated user to the results object
 * to ensure when toAuthorizedJSON is called
 */
// `result.auth` resolves to the shared `Model.prototype.auth` object, so
// assigning `.user` onto it would leak the current user into every other
// instance of that model, process-wide. Always assign a fresh copy.
module.exports = function useReqUser(req, res, next) {
  if (Array.isArray(req.results)) {
    req.results.forEach((result) => {
      result.auth = { ...result.auth, user: req.user };
    });
  } else {
    if (req.results) {
      req.results.auth = { ...req.results.auth, user: req.user };
    }
  }

  return next();
};
