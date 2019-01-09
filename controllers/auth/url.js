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
const authUrlConfig     = require('../../config/auth').get('Url');

exports.login  = (req, res) => {
  res.render('auth/url/login', {
    clientId: req.query.clientId,
  });
};

exports.register = (req, res, next) => {
  res.render('auth/url/register', {
   token: req.query.token,
   user: req.user,
   client: req.client,
   clientId: req.client.clientId
  });
}

exports.postLogin = (req, res, next) => {
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
      console.log('===> err', err);
      req.flash('error', {msg: 'Het is niet gelukt om de e-mail te versturen!'});
      res.redirect(req.header('Referer') || authUrlConfig.loginUrl);
    });

    /**
     * Format the URL and the Send it to the user
     */
    const handleSending = (req, res, next) => {
      tokenUrl.invalidateTokensForUser(req.user.id)
        .then(() => { return tokenUrl.format(req.client, req.user); })
        .then((tokenUrl) => { sendEmail(tokenUrl, req.user, req.client); })
        .then((result) => {
          req.flash('success', {msg: 'De e-mail is verstuurd!'});
          res.redirect(req.header('Referer') || '/login-with-email-url');
        })
        .catch((err) => {
          console.log('===> err', err);

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


exports.authenticate =  (req, res, next) => {
 passport.authenticate('url', function(err, user, info) {
   console.log('errr', err);
   if (err) { return next(err); }

   // Redirect if it fails to the original e-mail screen
   if (!user) {
     req.flash('error', {msg: 'De url is geen geldige login url, wellicht is deze verlopen'});
     return res.redirect(`/auth/url/login?clientId=${req.client.clientId}`);
   }

   req.logIn(user, function(err) {
     console.log('1111');

     if (err) { return next(err); }

     console.log('user.id', user.id);

     return tokenUrl.invalidateTokensForUser(user.id)
      .then((response) => {
        console.log('neieniene', response);

        // Redirect if it succeeds to authorize screen
        const authorizeUrl = `/dialog/authorize?redirect_uri=${req.client.redirectUrl}&response_type=code&client_id=${req.client.clientId}&scope=offline`;
        return res.redirect(authorizeUrl);
      })
      .catch((err) => {
        console.log('ewwwrr', err);

        next(err);
      });
   });

 })(req, res, next);
};
