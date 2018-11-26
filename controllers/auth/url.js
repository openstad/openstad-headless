/**
 * Controller responsible for handling the logic for Url login
 * (login in with a link, for now send by e-mail)
 */
 const passport          = require('passport');
 const bcrypt            = require('bcrypt');
 const saltRounds        = 10;
 const hat               = require('hat');
 const login             = require('connect-ensure-login');
 const User              = require('../../models').User;
 const tokenUrl          = require('../../services/tokenUrl');
 const emailService      = require('../../services/email');

exports.login  = (req, res) => {
  res.render('auth/login-with-email-url', {
    clientId: req.query.clientId,
  });
};

exports.register = (req, res, next) => {
  res.render('auth/register-with-token', {
   token: req.query.token,
   user: req.user,
   client: req.client
  });
}

exports.postRegister = (req, res, next) => {
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


exports.postLogin =  (req, res, next) => {
 passport.authenticate('url', function(err, user, info) {
   if (err) { return next(err); }
   // Redirect if it fails

   if (!user) {
     return res.redirect(`/login-with-email-url?clientId=${req.client.clientId}`);
   }

   req.logIn(user, function(err) {
     if (err) { return next(err); }

     // Redirect if it succeeds to authorize screen
     const authorizeUrl = `/dialog/authorize?redirect_uri=${req.client.redirectUrl}&response_type=code&client_id=${req.client.clientId}&scope=offline`;
     return res.redirect(authorizeUrl);
   });
 })(req, res, next);
};
