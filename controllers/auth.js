'use strict';
const passport          = require('passport');
const bcrypt            = require('bcrypt');
const saltRounds        = 10;
const hat               = require('hat');
const User              = require('../models').User;
const login             = require('connect-ensure-login');
const tokenUrl          = require('../services/tokenUrl');
const emailService      = require('../services/email');

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
