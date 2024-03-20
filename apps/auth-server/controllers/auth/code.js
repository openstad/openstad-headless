const authType = 'UniqueCode';

const passport          = require('passport');
const bcrypt            = require('bcrypt');
const saltRounds        = 10;
const hat               = require('hat');
const login             = require('connect-ensure-login');
const db                = require('../../db');
const tokenUrl          = require('../../services/tokenUrl');
const emailService      = require('../../services/email');
const authCodeConfig    = require('../../config/auth').get(authType);

exports.login = (req, res, next) => {
  const config = req.client.config ? req.client.config : {};
  const backUrl = config && config.backUrl ? config.backUrl : req.client.redirectUrl;
  const configAuthType = config.authTypes && config.authTypes[authType] ? config.authTypes[authType] : {};

  res.render('auth/code/login', {
    client: req.client,
    clientId: req.client.clientId,
    title: configAuthType.title ? configAuthType.title : authCodeConfig.title,
    description: configAuthType.description ?  configAuthType.description : authCodeConfig.description,
    label: configAuthType.label ?  configAuthType.label : authCodeConfig.label,
    helpText: configAuthType.helpText ? configAuthType.helpText : authCodeConfig.helpText,
    buttonText: configAuthType.buttonText ? configAuthType.buttonText : authCodeConfig.buttonText,
    displaySidebar: configAuthType.displaySidebar ? configAuthType.displaySidebar : authCodeConfig.displaySidebar,
    backUrl: authCodeConfig.displayBackbutton ? backUrl : false,
    redirect_uri: encodeURIComponent(req.query.redirect_uri)
  });
}

exports.postLogin = (req, res, next) => {
  passport.authenticate('uniqueCode', { session: false }, function(err, user, info) {

    // Redirect if it fails to the original auth screen
    if (!user) {
      req.flash('error', {msg: authCodeConfig.errorMessage});
      const redirectUrl = req.query.redirect_uri ? req.query.redirect_uri : req.client.redirectUrl;
      return res.redirect(`${authCodeConfig.loginUrl}?redirect_uri=${encodeURIComponent(redirectUrl)}&response_type=code&client_id=${req.client.clientId}&scope=offline`);
    }

    req.logIn(user, function(err) {
      if (err) { return next(err); }

      const redirectToAuthorize = () => {
        req.brute.resetKey(req.bruteKey);
        const redirectUrl = req.query.redirect_uri ? req.query.redirect_uri : req.client.redirectUrl;
        // Redirect if it succeeds to authorize screen
        const authorizeUrl = `/dialog/authorize?redirect_uri=${encodeURIComponent(redirectUrl)}&response_type=code&client_id=${req.client.clientId}&scope=offline`;
        return res.redirect(authorizeUrl);
      }

      db.UserRole
        .findOne({
          where: {
            clientId: req.client.id,
            userId: user.id
          }
        })
        .then((userRole) => {
          if (userRole) {
            redirectToAuthorize();
          } else {
            const defaultRoleId  = req.client.config.defaultRoleId ? req.client.config.defaultRoleId : authCodeConfig.defaultRoleId;
            db.UserRole
              .create({
                clientId: req.client.id,
                roleId: defaultRoleId,
                userId: user.id
              })
              .then(() => {
                redirectToAuthorize();
              })
              .catch((err) => { next(err); });
          }
        });



    });
  })(req, res, next);
}
