'use strict';

const clientAuth = require('../utils/clientAuth');

module.exports = (req, res, next) => {
  req.currentClientAuth = clientAuth.getClientAuth(req.session, req.client);
  req.currentClientRole = req.currentClientAuth?.role || null;

  return next();
};
