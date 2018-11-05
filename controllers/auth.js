'use strict';
const passport = require('passport');
const bcrypt = require('bcrypt');
const saltRounds = 10;
const hat = require('hat');

/**
 * Render the index.html or index-with-code.js depending on if query param has code or not
 * @param   {Object} req - The request
 * @param   {Object} res - The response
 * @returns {undefined}
 */
exports.index = (req, res) => {
  if (!req.query.code) {
    res.render('index');
  } else {
    res.render('index-with-code');
  }
};

/**
 * Render the login.html
 * @param   {Object} req - The request
 * @param   {Object} res - The response
 * @returns {undefined}
 */
exports.login = (req, res) => {
  res.render('login');
};

exports.register = (req, res) => {
  res.render('register');
};

exports.registerOrLoginWithEmail = (req, res) => {
  res.render('register-or-login-with-email');
};

exports.postRegister = (req, req, next) => {
  const errors = [];
  let { firstName, lastName, email, password } = req.body;

  if (req.user) {
    errors.push('Er bestaat al een account voor deze email');
  }

  if (!errors) {
    password = bcrypt.hashSync(password, saltRounds);

    new User({ firstName, lastName, email, password })
    .then(() => {
      res.redirect('/');
    })
    .catch((err) => { next(err) });
  } else {
    res.redirect('/');
  }
}

exports.postLoginOrRegisterWithEmailLink = (req, req, next) => {
  const onSuccess = (user) => {
    sendEmailWithLoginUrl(user);
    res.redirect('/');
  }
  if (req.user) {
    onSuccess(req.user);
  } else {
    const hashedPassword = bcrypt.hashSync(hat.rack(), saltRounds);

    new User({ email, hashedPassword })
    .then(onSuccess)
    .catch((err) => { next(err) });
  }
}

/**
 * Authenticate normal login page using strategy of authenticate
 */
exports.login = [
  passport.authenticate('local', { successReturnToOrRedirect: '/', failureRedirect: '/login' }),
];

exports.loginwithToken = [
  passport.authenticate('authtoken',  {
      session: true,
      optional: false
    }
  ))
];

/**
 * Logout of the system and redirect to root
 * @param   {Object}   req - The request
 * @param   {Object}   res - The response
 * @returns {undefined}
 */
exports.logout = (req, res) => {
  req.logout();
  res.redirect('/');
};

/**
 * Render account.html but ensure the user is logged in before rendering
 * @param   {Object}   req - The request
 * @param   {Object}   res - The response
 * @returns {undefined}
 */
exports.account =  (req, res) => {
  res.render('account', { user: req.user });
};
