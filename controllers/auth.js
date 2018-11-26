'use strict';
const passport          = require('passport');
const bcrypt            = require('bcrypt');
const saltRounds        = 10;
const hat               = require('hat');
const User              = require('../models').User;
const login             = require('connect-ensure-login');
const tokenUrl          = require('../services/tokenUrl');
const emailService      = require('../services/email');
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

exports.loginWithEmailUrl = (req, res) => {
  res.render('auth/login-with-email-url', {
    clientId: req.query.clientId,
  });
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
        req.user = user.serialize();
        handleSending(req, res, next);
      } else {
        /**
         * Create a new user
         */
        new User({ email: req.body.email })
          .save()
          .then((user) => {
            req.user = user.serialize();
            handleSending(req, res, next);
          })
          .catch((err) => { next(err) });
      }
    })
    .catch((err) => {
      req.flash('error', {msg: 'Het is niet gelukt om de e-mail te versturen!'});
      res.redirect(req.header('Referer') || '/login-with-email-url');
    });

    /**
     * Format the URL and the Send it to the user
     */
    const handleSending = (req, res, next) => {
      tokenUrl
        .format(req.client, req.user)
        .then((tokenUrl) => {

          sendEmail(tokenUrl, req.user, req.client);
        })
        .then((result) => {
          req.flash('success', {msg: 'De e-mail is verstuurd!'});
          res.redirect(req.header('Referer') || '/login-with-email-url');
        })
        .catch((err) => {
          console.log('====? eerrr', err);
          req.flash('error', {msg: 'Het is niet gelukt om de e-mail te versturen!'});
          res.redirect(req.header('Referer') || '/login-with-email-url');
        });
    }

    /**
     * Send email
     */
    const sendEmail = (tokenUrl, user, client) => {
      return emailService.send({
        toName: (user.firstName + ' ' + user.lastName).trim(),
        toEmail: user.email,
        subject: 'Inloggen bij ' + client.name,
        template: 'emails/login-url.html',
        variables: {
          tokenUrl: tokenUrl,
          firstName: user.firstName,
          clientUrl: client.mainUrl,
          clientName: client.name,
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
  res.render('auth/register-with-token', {
    token: req.query.token,
    user: req.user,
    client: req.client
  });
}

exports.postRegisterWithToken = (req, res, next) => {
  const { firstName, lastName, postcode, token } = req.body;
  const userModel = req.userModel;

  /**
   * Set Values for user; validation is taken care of in middleware
   */
  userModel.set('firstName', firstName);
  userModel.set('lastName', lastName);
  userModel.set('postcode', postcode);

  /**
   * After succesfull registration redirect to token login url, for automagic login
   */
  userModel
  .save()
  .then((userReponse) => {
    const user = userReponse.serialize();
    res.redirect(tokenUrl.getUrl(user, req.client, token));
  })
  .catch((err) => { next(err) });

};


exports.loginWithToken =  (req, res, next) => {
  passport.authenticate('url', function(err, user, info) {
    if (err) { return next(err); }
    // Redirect if it fails
    console.log('====> user 1', user);

    if (!user) {
      console.log('====> user 5', user);

      return res.redirect(`/login-with-email-url?clientId=${req.client.clientId}`);
    }

    req.logIn(user, function(err) {
      if (err) { return next(err); }

      // Redirect if it succeeds
      const authorizeUrl = `/dialog/authorize?redirect_uri=${req.client.redirectUrl}&response_type=code&client_id=${req.client.clientId}&scope=offline`;
    //  const authorizeUrl = '/account';
      return res.redirect(authorizeUrl);
    });
  })(req, res, next);
};




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
