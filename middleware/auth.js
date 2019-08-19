const loginFields = require('../config/user').loginFields;
const User                  = require('../models').User;

exports.validateLogin = (req, res, next) => {
  req.check(loginFields);

  req.getValidationResult();

  //  const errors = req.validationResult();
  var errors = req.validationErrors();

  if (errors) {
    req.flash('error', errors);
    res.redirect(req.header('Referer') || '/account');
  } else {
    next();
  }
}

exports.check = (req, res, next) => {

  if (!req.isAuthenticated || !req.isAuthenticated()) {
    let url = '/login?clientId=' + req.client.clientId;

    if (req.query.redirect_uri) {
      url =  url + '&redirect_uri=' + req.query.redirect_uri;
    }

    if (req.session) {
      req.session.returnTo = req.originalUrl || req.url;
    }

    return res.redirect(url);
  } else {
    new User({ id: req.user.id })
      .fetch()
      .then((user) => {
        req.userModel = user;
        req.user = user.serialize();



        next();
      })
      .catch((err) => {
        next(err);
      });
  }
}

exports.passwordValidate = (req, res, next) => {
  if (req.body.password.length >= 8) {
    next();
  } else {
    req.flash('error', {msg: 'Wachtwoord moet min 8 karakters lang zijn'});
    res.redirect(req.header('Referer') || '/account');
  }
}
