/**
 * Controller responsible for handling the logic for Url login
 * (login in with a link, for now send by e-mail)
 */
 const authType = 'Url';

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
  const config = req.client.config ? req.client.config : {};
  const configAuthType = config.authTypes && config.authTypes[authType] ? config.authTypes[authType] : {};

  res.render('auth/url/login', {
    clientId: req.query.clientId,
    client: req.client,
    redirectUrl: req.query.redirect_uri,
    title: configAuthType.title ? configAuthType.title : authCodeConfig.title,
    description: configAuthType.description ?  configAuthType.description : authCodeConfig.description,
    label: configAuthType.label ?  configAuthType.label : authCodeConfig.label,
    helpText: configAuthType.helpText ? configAuthType.helpText : authCodeConfig.helpText,
    buttonText: configAuthType.buttonText ? configAuthType.buttonText : authCodeConfig.buttonText,
  });
};

exports.authenticate  = (req, res) => {
  res.render('auth/url/authenticate', {
    clientId: req.query.clientId,
    client: req.client,
    redirectUrl: req.query.redirect_uri
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


const handleSending = (req, res, next) => {
  tokenUrl.invalidateTokensForUser(req.user.id)
    .then(() => { return tokenUrl.format(req.client, req.user, req.redirectUrl); })
    .then((tokenUrl) => { return sendEmail(tokenUrl, req.user, req.client); })
    .then((result) => {
      req.flash('success', {msg: 'De e-mail is verstuurd naar: ' + req.user.email});
      res.redirect(req.header('Referer') || '/login-with-email-url');
    })
    .catch((err) => {
      console.log('e0mail error', err);
      req.flash('error', {msg: 'Het is niet gelukt om de e-mail te versturen!'});
      res.redirect(req.header('Referer') || '/login-with-email-url');
    });
}

/**
 * Send email
 */
const sendEmail = (tokenUrl, user, client) => {
  const clientConfig = client.config ? client.config : {};
  const authTypeConfig = clientConfig.authTypes && clientConfig.authTypes.Url  ? clientConfig.authTypes.Url  : {};
  const emailTemplateString = authTypeConfig.emailTemplate ? authTypeConfig.emailTemplate : false;
  const emailSubject = authTypeConfig.emailSubject ? authTypeConfig.emailSubject : 'Inloggen bij ' + client.name;
  const emailHeaderImage = authTypeConfig.emailHeaderImage ? authTypeConfig.emailHeaderImage : false;
  const emailLogo = authTypeConfig.emailLogo ? authTypeConfig.emailLogo : false;


  return emailService.send({
    toName: (user.firstName + ' ' + user.lastName).trim(),
    toEmail: user.email,
    fromEmail: clientConfig.fromEmail,
    fromName: clientConfig.fromName,
    subject: emailSubject,
    templateString: emailTemplateString,
    template: 'emails/login-url.html',
    variables: {
      tokenUrl: tokenUrl,
      firstName: user.firstName,
      clientUrl: client.mainUrl,
      clientName: client.name,
      headerImage: emailHeaderImage,
      logo: emailLogo
    }
  });
}


exports.postLogin = (req, res, next) => {
  const clientConfig = req.client.config ? req.client.config : {};
  const redirectUrl =  clientConfig && clientConfig.emailRedirectUrl ? clientConfig.emailRedirectUrl : req.query.redirect_uri;
  req.redirectUrl = redirectUrl;


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
          * If active user is already set, the user is already logged in
          * If email is not set it means they as anonymous user
          * Add the submitted email to anonymous user
          * If already a user with that email, ignore the anonymous user and login via existing user
          */
         if (req.user && !req.user.email && !user) {
           req.user
            .set('email', req.body.email)
            .save()
            .then((user) => {
              req.user = user.serialize();
              handleSending(req, res, next);
            })
            .catch((err) => { next(err); })

         } else {
           new User({ email: req.body.email })
             .save()
             .then((user) => {
               req.user = user.serialize();
               handleSending(req, res, next);
             })
             .catch((err) => { next(err) });
         }
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


exports.postAuthenticate =  (req, res, next) => {
 passport.authenticate('url', { session: true }, function(err, user, info) {
   if (err) { return next(err); }
   const redirectUrl = req.query.redirect_uri ? req.query.redirect_uri : req.client.redirectUrl;


   // Redirect if it fails to the original e-mail screen
   if (!user) {
     req.flash('error', {msg: 'De url is geen geldige login url, wellicht is deze verlopen'});
     return res.redirect(`/auth/url/login?clientId=${req.client.clientId}&redirect_uri=${redirectUrl}`);
   }

   req.logIn(user, function(err) {
     if (err) { return next(err); }

     return tokenUrl.invalidateTokensForUser(user.id)
      .then((response) => {
        req.brute.reset(() => {
            // Redirect if it succeeds to authorize screen
            //check if allowed url will be done by authorize screen
            const authorizeUrl = `/dialog/authorize?redirect_uri=${redirectUrl}&response_type=code&client_id=${req.client.clientId}&scope=offline`;

            return res.redirect(authorizeUrl);
          });
      })
      .catch((err) => {
        next(err);
      });
   });

 })(req, res, next);
};
