/**
 * Controller responsible for handling the logic for Local login
 * (standard login with password & register)
 */

 'use strict';

 const passport          = require('passport');
 const bcrypt            = require('bcrypt');
 const saltRounds        = 10;
 const hat               = require('hat');
 const login             = require('connect-ensure-login');
 const User              = require('../../models').User;
 const tokenUrl          = require('../../services/tokenUrl');
 const emailService      = require('../../services/email');

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
  res.render('auth/local/login');
};

/**
 * Render the register.html
 * @param   {Object} req - The request
 * @param   {Object} res - The response
 * @returns {undefined}
 */
exports.register = (req, res) => {
  res.render('auth/local/register');
};

exports.postRegister = (req, res, next) => {
  const errors = [];
  const { email } = req.body;

  if (errors.length === 0) {
    password = bcrypt.hashSync(password, saltRounds);

    new User({ firstName, lastName, email, password })
      .save()
      .then(() => { res.redirect('/login'); })
      .catch((err) => { next(err) });
  } else {
    req.flash('error', { errors });
    res.redirect('/register');
  }
}

/**
 * Authenticate normal login page using strategy of authenticate
 */
exports.postLogin = [
  passport.authenticate('local', { successReturnToOrRedirect: '/', failureRedirect: '/login' }),
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
