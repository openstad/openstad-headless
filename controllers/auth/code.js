const authType = 'UniqueCode';

const passport          = require('passport');
const bcrypt            = require('bcrypt');
const saltRounds        = 10;
const hat               = require('hat');
const login             = require('connect-ensure-login');
const User              = require('../../models').User;
const UserRole          = require('../../models').UserRole;
const tokenUrl          = require('../../services/tokenUrl');
const emailService      = require('../../services/email');
const authCodeConfig    = require('../../config/auth').get(authType);

exports.login = (req, res, next) => {
  const config = req.client.config ? req.client.config : {};
  const backUrl = config && config.backUrl ? config.backUrl : req.client.siteUrl;
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
    redirect_uri: req.query.redirect_uri
  });
}

exports.postLogin = (req, res, next) => {
  passport.authenticate('uniqueCode', { session: false }, function(err, user, info) {

    // Redirect if it fails to the original auth screen
    if (!user) {
      req.flash('error', {msg: authCodeConfig.errorMessage});
      return res.redirect(`${authCodeConfig.loginUrl}?clientId=${req.client.clientId}`);
    }

    req.logIn(user, function(err) {
      if (err) { return next(err); }

      const redirectToAuthorize = () => {
        req.brute.reset(() => {
          const redirectUrl = req.query.redirect_uri ? req.query.redirect_uri : req.client.redirectUrl;
          // Redirect if it succeeds to authorize screen
          const authorizeUrl = `/dialog/authorize?redirect_uri=${redirectUrl}&response_type=code&client_id=${req.client.clientId}&scope=offline`;
          return res.redirect(authorizeUrl);
        });
      }

      if (req.client.config.defaultRoleId) {
        new UserRole({
          clientId: req.client.id,
          roleId: req.client.config.defaultRoleId,
          userId: user.id
        })
          .save()
          .then(() => {
            redirectToAuthorize();
          })
          .catch((err) => { next(err); });
      } else {
        redirectToAuthorize();
      }

    });
  })(req, res, next);
}
