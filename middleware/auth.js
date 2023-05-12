const { body, validationResult }  = require('express-validator')
const loginFields = require('../config/user').loginFields;
const db = require('../db');

exports.validateLogin = async(req, res, next) => {

  await body('email').isEmail().run(req);
  await body('password').isLength({ min: 6 }).run(req);
  const result = validationResult(req);

  if (result.errors && result.errors.length) {
    req.flash('error', result.errors);
    res.redirect(req.header('Referer') || '/account');
  } else {
    next();
  }
}

exports.check = (req, res, next) => {
  if (!req.isAuthenticated || !req.isAuthenticated()) {

    let url = '/login?clientId=' + req.client.clientId;

    if (req.query.redirect_uri) {
      url =  url + '&redirect_uri=' + encodeURIComponent(req.query.redirect_uri);
    }

    if (req.session) {
      req.session.returnTo = req.originalUrl || req.url;
    }

    return res.redirect(url);
  } else {
    db.User
      .findOne({ where: { id: req.user.id } })
      .then((user) => {
        req.user = user;
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
