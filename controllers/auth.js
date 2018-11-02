'use strict';

const login    = require('connect-ensure-login');
const passport = require('passport');
const bcrypt = require('bcrypt');
const saltRounds = 10;
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
exports.loginForm = (req, res) => {
  res.render('login');
};

exports.registerForm = (req, res) => {
  res.render('login');
};

exports.registerForm = (req, res) => {
  res.render('login');
};

exports.registerUser = (req, req, next) => {
  const { firstName, lastName, email, password, loginViaToken } = req.body;

  /**
   * @TODO Validate
   */

  /**
   * Validate email doesn't exists
   */

  User.
    .where({ email: email })
    .fetch()
    .then((user) => {
      const userExists = !! user;

      if (userExists && loginViaToken) {
      // sendEmailWithLoginUrl(user);
      } else if (userExists) {
        errors[] = 'Er bestaat al een account voor deze email';
      } else {
        const hashedPassword = bcrypt.hashSync(password, saltRounds);

        new User({ firstName, lastName, email, hashedPassword })
        .then((userResponse) => {
          if (loginViaToken) {
            // sendEmailWithLoginUrl(user);
          } else {
            res.redirect('/login');
          }
        })
        .catch((err) => { next(err) })
      }


    });
}


/**
 * Authenticate normal login page using strategy of authenticate
 */
exports.login = [
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



/**
 * Render account.html but ensure the user is logged in before rendering
 * @param   {Object}   req - The request
 * @param   {Object}   res - The response
 * @returns {undefined}
 */
exports.account = [
  login.ensureLoggedIn(),
  (req, res) => {
    res.render('account', { user: req.user });
  },
];
