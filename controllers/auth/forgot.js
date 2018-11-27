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
 const password          = require('../../services/password');
 const authLocalConfig   = require('../../config/auth').get('Local');


 exports.forgot = (req, res) => {
   res.render('auth/forgot/forgot');
 };

 exports.reset = (req, res) => {
   res.render('auth/forgot/reset', {
     token: req.query.token
   });
 };

/**
 * In case of reset (validation is done with middleware)
 */
 exports.postReset = (req, res, next) => {
   new User({id: req.user.id})
     .fetch()
     .then((user) => {
       user.set('password', bcrypt.hashSync(req.body.password, saltRounds));

       user
         .save()
         .then(() => {
           req.flash('success', { msg: 'Wachtwoord aangepast, je kan nu inloggen!' });
           res.redirect(authLocalConfig.loginUrl);
         })
         .catch((err) => {
           next(err);
         })
     });
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
     .then((url) => { return sendEmail(url, req.user, req.client); })
     .then(() => {
       req.flash('success', {msg: 'We hebben een e-mail naar je verstuurd'});
       res.redirect(req.header('Referer') || authLocalConfig.loginUrl);
     })
     .catch((err) => {
       req.flash('error', {msg: 'E-mail adres is niet bekend bij ons.'});
       res.redirect(req.header('Referer') || authLocalConfig.loginUrl);
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
