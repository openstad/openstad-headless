const passport          = require('passport');
const bcrypt            = require('bcrypt');
const saltRounds        = 10;
const hat               = require('hat');
const login             = require('connect-ensure-login');
const User              = require('../../models').User;
const tokenUrl          = require('../../services/tokenUrl');
const emailService      = require('../../services/email');

exports.login = (req, res, next) => {
  res.render('auth/code/login', {
    client: req.client
  });
}

exports.postLogin = (req, res, next) => {
  passport.authenticate('uniqueCode', function(err, user, info) {
    if (err) { return next(err); }

    // Redirect if it fails to the original e-mail screen
    if (!user) {
      return res.redirect(`/auth/code/login?clientId=${req.client.clientId}`);
    }

    req.logIn(user, function(err) {
      if (err) { return next(err); }

      // Redirect if it succeeds to authorize screen
      const authorizeUrl = `/dialog/authorize?redirect_uri=${req.client.redirectUrl}&response_type=code&client_id=${req.client.clientId}&scope=offline`;
      return res.redirect(authorizeUrl);
    });
  })(req, res, next);
}
