'use strict';
const passport = require('passport');
const bcrypt = require('bcrypt');
const saltRounds = 10;
const hat = require('hat');
const User = require('../models').User;
const login            = require('connect-ensure-login');

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

exports.registerOrLoginWithEmailUrl = (req, res) => {
  res.render('auth/login-with-email-url');
};



exports.postRegister = (req, res, next) => {
  const errors = [];
  const { email } = req.body;

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

exports.postLoginOrRegisterWithEmailUrl = (req, res, next) => {
  /**
   * Check if user exists
   */
  new User({ email: req.body.email })
    .fetch()
    .then((user) => {
      if (user) {
        req.user = user;
        handleSending(req, res, next);
      } else {
        new User({ email, hashedPassword })
          .fetch()
          .then((user) => {
            req.user = user;
            handleSending(req, res, next);
          })
          .catch((err) => { next(err) });
      }
    })
    .catch((err) => {
      next(err);
    });

    /**
     * Format the URL and the Send it to the user
     */
    const handleSending = (req, res, next) => {
      tokenUrl
        .format(req.user)
        .then(sendEmail)
        .then((result) => {
          req.flash('success', {msg: 'De e-mail is verstuurd!'});
          res.redirect(req.header('Referer') || '/login-with-email-url');
        })
        .catch((err) => {
          req.flash('error', {msg: 'Het is niet gelukt om de e-mail te versturen!'});
          res.redirect(req.header('Referer') || '/login-with-email-url');
        });
    }

    /**
     * Send email
     */
    const sendEmail = (tokenUrl) => {
      return emailService.send({
        toName: (user.firstName + ' ' + user.lastName).trim(),
        toEmail: user.email,
        subject: 'Inloggen bij ' + client.name,
        template: 'email/login-url',
        variables: {
          url: tokenUrl,
          firstName: user.firstName
        }
      });
    }
}

/**
 * Authenticate normal login page using strategy of authenticate
 */
exports.postLogin = [
  passport.authenticate('local', { successReturnToOrRedirect: '/', failureRedirect: '/login' }),
];

exports.registerWithToken = (req, res, next) => {
  const errors = [];
  const { email } = req.body;

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

exports.postLoginWithToken = (req, res, next) => {

}

exports.completeRegistration = [ (req, res, next) => {
  const errors = [];
  const email = req.user.email;
  const { firstName, lastName } = req.body;

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
}]


exports.postLoginWithToken = [
  passport.authenticate('url', { successReturnToOrRedirect: '/', failureRedirect: '/login-with-token' }),
];


exports.loginWithToken = [
  passport.authenticate('authtoken',  {
    successReturnToOrRedirect: '/',
    failureRedirect: '/login-with-token',
    session: true,
    optional: false
  })
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


exports.postPassword =  (req, res) => {
  new User({id: req.user.id})
    .fetch()
    .then((user) => {
      if (req.body.password === 'password') {
        value = bcrypt.hashSync(value, saltRounds);
        user.set(key, );
      }

      user
        .save()
        .then(() => {
          req.flash('success', { msg: 'Updated client!' });
          res.redirect('/admin/client/' + response.id);
        })
        .catch((err) => {
          next(err);
        })
    });
};



/*
exports.account =  (req, res) => {
  res.render('user/profile', { user: req.user });
};
*/
