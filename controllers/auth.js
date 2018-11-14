'use strict';
const passport = require('passport');
const bcrypt = require('bcrypt');
const saltRounds = 10;
const hat = require('hat');
const User = require('../models').User;
const login  = require('connect-ensure-login');

/**
 * Render the index.html or index-with-code.js depending on if query param has code or not
 * @param   {Object} req - The request
 * @param   {Object} res - The response
 * @returns {undefined}
 */
exports.index = (req, res) => {
  if (req.user) {
    res.redirect('/account');
  } else {
    res.redirect('/login');
  }
};

/**
 * Render the login.html
 * @param   {Object} req - The request
 * @param   {Object} res - The response
 * @returns {undefined}
 */
exports.login = (req, res) => {
  res.render('auth/login');
};

exports.register = (req, res) => {
  res.render('auth/register');
};

exports.forgot = (req, res) => {
  res.render('auth/forgot');
};

exports.reset = (req, res) => {
  res.render('auth/reset', {
    token: req.query.token
  });
};

exports.registerOrLoginWithToken = (req, res) => {
  res.render('auth/register-or-login-with-token');
};

exports.postRegister = (req, res, next) => {
  const errors = [];
  let { firstName, lastName, email, password } = req.body;

  //if (req.user) {
//    errors.push('Er bestaat al een account voor deze email');
//  }

  if (errors.length === 0) {
    password = bcrypt.hashSync(password, saltRounds);

    new User({ firstName, lastName, email, password })
    .save()
    .then(() => {
      res.redirect('/login');
    })
    .catch((err) => { next(err) });
  } else {
    req.flash('error', { errors });
    res.redirect('/register');
  }
}

exports.postReset = (req, res, next) => {

}

exports.postForgot = (req, res, next) => {

}

exports.postLoginOrRegisterWithEmailLink = (req, res, next) => {
  const onSuccess = (user) => {
    sendEmailWithLoginUrl(user);
    res.redirect('/');
  }
  if (req.user) {
    onSuccess(req.user);
  } else {
    const hashedPassword = bcrypt.hashSync(hat.rack(), saltRounds);

    new User({ email, hashedPassword })
      .fetch()
      .then(onSuccess)
      .catch((err) => { next(err) });
  }
}

/**
 * Authenticate normal login page using strategy of authenticate
 */
exports.postLogin = [
  passport.authenticate('local', { successReturnToOrRedirect: '/', failureRedirect: '/login' }),
];

exports.loginWithToken = [passport.authenticate('authtoken',  {
  successReturnToOrRedirect: '/',
  failureRedirect: '/login-with-token',
  session: true,
  optional: false
})];

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

 exports.account = [
   login.ensureLoggedIn(),
   (req, res) => {
     res.render('user/profile', {
       user: req.user
     });
   }
 ]

/*
exports.account =  (req, res) => {
  res.render('user/profile', { user: req.user });
};
*/

exports.postAccount =  (req, res) => {
  res.render('user/profile', { user: req.user });
};
