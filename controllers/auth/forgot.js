/**
 * Controller responsible for handling the password forgot
 * (login in with a link, mainly send by e-mail)
 */
 const passport          = require('passport');
 const bcrypt            = require('bcrypt');
 const saltRounds        = 10;
 const hat               = require('hat');
 const login             = require('connect-ensure-login');
 const User              = require('../../models').User;
 const tokenUrl          = require('../../services/tokenUrl');
 const emailService      = require('../../services/email');
 const password           = require('../../services/password');
 exports.forgot = (req, res) => {
   res.render('auth/forgot/forgot');
 };

 exports.reset = (req, res) => {
   res.render('auth/forgot/reset', {
     token: req.query.token
   });
 };

 exports.postReset = (req, res, next) => {



 }

 exports.postForgot = (req, res, next) => {
   /**
    * Check if user exists
    */
   new User({ email: req.body.email })
     .fetch()
     .then((user) => {
       if (!user) {
         req.flash('error', {msg: 'Het is niet gelukt om de e-mail te versturen!'});
         res.redirect(req.header('Referer') || '/auth/local/forgot');
       }

       req.user = user.serialize();
       return password.formatResetLink(req.client, req.user)
     })
     .then((url) => {

     })
     .catch((err) => {
       req.flash('error', {msg: 'E-mail adres is niet beknd bij ons.'});
       res.redirect(req.header('Referer') || '/login-with-email-url');
     });


   /**
    * Send email
    */
   const sendEmail = (resetUrl, user, client) => {
     return emailService.send({
       toName: (user.firstName + ' ' + user.lastName).trim(),
       toEmail: user.email,
       subject: 'Wachtwoord herstellen voor ' + client.name,
       template: 'emails/password-reset.html',
       variables: {
         resetUrl: resetUrl,
         firstName: user.firstName,
         clientUrl: client.mainUrl,
         clientName: client.name,
       }
     });
   }
 }
