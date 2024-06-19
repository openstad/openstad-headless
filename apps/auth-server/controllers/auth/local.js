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
 const db                = require('../../db');
 const authLocalConfig   = require('../../config/auth').get('Local');
 const URL               = require('url').URL;
 const authType          = 'Local';

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
  const config = req.client.config ? req.client.config : {};
  const configAuthType = config.authTypes && config.authTypes[authType] ? config.authTypes[authType] : {};

  res.render('auth/local/login', {
    loginUrl: authLocalConfig.loginUrl + `?clientId=${req.client.clientId}&redirect_uri=${encodeURIComponent(req.query.redirect_uri)}`,
    clientId: req.client.clientId,
    client: req.client,
    redirectUrl: encodeURIComponent(req.query.redirect_uri),
    title: configAuthType.title ? configAuthType.title : authLocalConfig.title,
    description: configAuthType.description ?  configAuthType.description : authLocalConfig.description,
    emailLabel: configAuthType.emailLabel ?  configAuthType.emailLabel : authLocalConfig.emailLabel,
    passwordLabel: configAuthType.passwordLabel ?  configAuthType.passwordLabel : authLocalConfig.passwordLabel,
    helpText: configAuthType.helpText ? configAuthType.helpText : authLocalConfig.helpText,
    buttonText: configAuthType.buttonText ? configAuthType.buttonText : authLocalConfig.buttonText,
    forgotPasswordText: configAuthType.forgotPasswordText ? configAuthType.forgotPasswordText : authLocalConfig.forgotPasswordText,
  });
};

/**
 * Render the register.html
 * @param   {Object} req - The request
 * @param   {Object} res - The response
 * @returns {undefined}
 */
exports.register = (req, res) => {
  res.render('auth/local/register', {
    clientId: req.client.clientId
  });
};

exports.postRegister = (req, res, next) => {
  const errors = [];
  const { name, email } = req.body;
  let {password} = req.body;

  if (errors.length === 0) {
    password = bcrypt.hashSync(password, saltRounds);

    db.User()
      .create({ name, email, password })
      .then(() => { res.redirect(authLocalConfig.loginUrl+ '?clientId=' + req.client.clientId); })
      .catch((err) => { next(err) });
  } else {
    req.flash('error', { errors });
    res.redirect('/register');
  }
}

/**
 * Authenticate normal login page using strategy of authenticate
 */
exports.postLogin = (req, res, next) => {
  passport.authenticate('local', function(err, user, info) {

    if (err) { return next(err); }

    // Redirect if it fails to the original e-mail screen
    if (!user) {
      req.flash('error', {msg: 'Incorrect combination email/password'});
      const redirectUrl = req.query.redirect_uri ? encodeURIComponent(req.query.redirect_uri) : req.client.redirectUrl;
      let loginUrl = authLocalConfig.loginUrl;
      if (req.params.priviligedRoute &&  req.params.priviligedRoute == 'admin') {
        loginUrl += '/admin'
      }
      return res.redirect(`${loginUrl}?clientId=${req.client.clientId}&redirect_uri=${redirectUrl}`);
    }

    req.logIn(user, function(err) {
      if (err) { return next(err); }
      const redirectUrl = req.query.redirect_uri ? encodeURIComponent(req.query.redirect_uri) : req.client.redirectUrl;
      const authorizeUrl = `/dialog/authorize?redirect_uri=${redirectUrl}&response_type=code&client_id=${req.client.clientId}&scope=offline`;

  //    const redirectTo = req.session.returnTo ? req.session.returnTo : req.client.redirectUrl;

      // Redirect if it succeeds to authorize screen
      req.brute.resetKey(req.bruteKey);
      return res.redirect(authorizeUrl);
    });
  })(req, res, next);
}

/**
 * Logout of the system and redirect to root
 * @param   {Object}   req - The request
 * @param   {Object}   res - The response
 * @returns {undefined}
 */
exports.logout = async (req, res) => {

  let userId = req.user && req.user.id;
  if (userId) {
    await db.AccessToken.destroy({ where: { userId } });
  }

  await req.session.destroy();

  const config = req.client.config;
  const allowedDomains = req.client.allowedDomains ? req.client.allowedDomains : false;
  let redirectURL = req.query.redirectUrl;

  try {
    const redirectUrlHost = redirectURL ? new URL(redirectURL).hostname : false;
    redirectURL = redirectUrlHost && allowedDomains && allowedDomains.indexOf(redirectUrlHost) !== -1 ? redirectURL : false;
  } catch (e) {
    redirectURL = null;
  }

  if (!redirectURL) {
    redirectURL =  config && config.logoutUrl ? config.logoutUrl : req.client.redirectUrl
  }

  res.redirect(redirectURL);

};
