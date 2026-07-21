/**
 * Controller responsible for handling the logic for Local login
 * (standard login with password & register)
 */

'use strict';

const passport = require('passport');
const bcrypt = require('bcrypt');
const saltRounds = 10;
const hat = require('hat');
const login = require('connect-ensure-login');
const db = require('../../db');
const authLocalConfig = require('../../config/auth').get('Local');
const clientAuth = require('../../utils/clientAuth');
const { safeRedirectUri } = require('../../utils/redirectUri');
const sanitize = require('../../utils/sanitize');
const authType = 'Local';
const { logAuthEvent } = require('../../middleware/auditLog');

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
  const configAuthType =
    config.authTypes && config.authTypes[authType]
      ? config.authTypes[authType]
      : {};

  const clientId = sanitize.plainText(req.client.clientId);

  res.render('auth/local/login', {
    loginUrl:
      authLocalConfig.loginUrl +
      `?clientId=${clientId}&redirect_uri=${req.redirectUri ? encodeURIComponent(req.redirectUri) : ''}`,
    clientId: clientId,
    client: sanitize.client(req.client),
    redirectUrl: req.redirectUri ? encodeURIComponent(req.redirectUri) : '',
    title: sanitize.plainText(configAuthType.title || authLocalConfig.title),
    description: sanitize.plainText(
      configAuthType.description || authLocalConfig.description
    ),
    emailLabel: sanitize.plainText(
      configAuthType.emailLabel || authLocalConfig.emailLabel
    ),
    passwordLabel: sanitize.plainText(
      configAuthType.passwordLabel || authLocalConfig.passwordLabel
    ),
    helpText: sanitize.plainText(
      configAuthType.helpText || authLocalConfig.helpText
    ),
    buttonText: sanitize.plainText(
      configAuthType.buttonText || authLocalConfig.buttonText
    ),
    forgotPasswordText: sanitize.plainText(
      configAuthType.forgotPasswordText || authLocalConfig.forgotPasswordText
    ),
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
    clientId: sanitize.plainText(req.client.clientId),
  });
};

exports.postRegister = (req, res, next) => {
  const errors = [];
  const { name, email } = req.body;
  let { password } = req.body;

  if (errors.length === 0) {
    password = bcrypt.hashSync(password, saltRounds);

    db.User()
      .create({ name, email, password })
      .then((user) => {
        logAuthEvent(req, 'register', {
          userId: user.id,
          userName: name || email,
          data: { method: 'local', email },
        });
        res.redirect(
          authLocalConfig.loginUrl + '?clientId=' + req.client.clientId
        );
      })
      .catch((err) => {
        next(err);
      });
  } else {
    req.flash('error', { errors });
    res.redirect('/register');
  }
};

/**
 * Authenticate normal login page using strategy of authenticate
 */
exports.postLogin = (req, res, next) => {
  passport.authenticate('local', function (err, user, info) {
    if (err) {
      return next(err);
    }

    // Redirect if it fails to the original e-mail screen
    if (!user) {
      logAuthEvent(req, 'login_failed', {
        data: { method: 'local', email: req.body.email },
      });
      req.flash('error', { msg: 'Incorrect combination email/password' });
      const redirectUrl = req.redirectUri
        ? encodeURIComponent(req.redirectUri)
        : req.client.redirectUrl;
      let loginUrl = authLocalConfig.loginUrl;
      if (req.params.priviligedRoute && req.params.priviligedRoute == 'admin') {
        loginUrl += '/admin';
      }
      return res.redirect(
        `${loginUrl}?clientId=${req.client.clientId}&redirect_uri=${redirectUrl}`
      );
    }

    req.logIn(user, function (err) {
      if (err) {
        return next(err);
      }
      clientAuth
        .initializeClientAuth(req.session, req.client, user, {
          authType,
          twoFactorValid: false,
        })
        .then(() => clientAuth.saveSession(req.session))
        .then(() => {
          const redirectUrl = req.redirectUri
            ? encodeURIComponent(req.redirectUri)
            : req.client.redirectUrl;
          if (!redirectUrl)
            return next(
              new Error(
                'No redirect_uri provided and no default redirectUrl configured for this client'
              )
            );
          const authorizeUrl = `/dialog/authorize?redirect_uri=${redirectUrl}&response_type=code&client_id=${req.client.clientId}&scope=offline`;

          req.brute.resetKey(req.bruteKey);
          logAuthEvent(req, 'login', {
            data: { method: 'local' },
          });
          return res.redirect(authorizeUrl);
        })
        .catch(next);
    });
  })(req, res, next);
};

/**
 * Logout of the system and redirect to root
 * @param   {Object}   req - The request
 * @param   {Object}   res - The response
 * @returns {undefined}
 */
exports.logout = async (req, res) => {
  let userId = (req.user && req.user.id) || req.session?.passport?.user || null;
  let clientId = req.client && req.client.id;

  logAuthEvent(req, 'logout', {
    userId,
  });

  if (userId && clientId) {
    await db.AccessToken.destroy({
      where: { userID: userId, clientID: clientId },
    });
  }

  await req.session.destroy();

  const config = req.client.config;

  let redirectURL = safeRedirectUri(
    req.query.redirectUrl,
    req.client,
    'redirectUrl'
  );

  if (!redirectURL) {
    if (req.query.redirectUrl) {
      console.log(
        `[${new Date().toISOString()}][auth-logout] redirect not allowed: clientId=${req.client?.id} requested=${String(req.query.redirectUrl).substring(0, 120)}`
      );
    }
    // opgeslagen fallbacks gaan door dezelfde policy als de query-waarde
    redirectURL =
      safeRedirectUri(config && config.logoutUrl, req.client, 'logoutUrl') ||
      safeRedirectUri(req.client.redirectUrl, req.client, 'redirectUrl');
  }

  if (!redirectURL && process.env.ADMIN_URL) {
    redirectURL = safeRedirectUri(
      process.env.ADMIN_URL,
      req.client,
      'ADMIN_URL'
    );
  }

  if (!redirectURL) {
    console.log(
      `[${new Date().toISOString()}][auth-logout] no valid redirect URL after fallbacks: clientId=${req.client?.id}`
    );
    return res
      .status(500)
      .send('Logout completed, but no valid redirect URL was configured.');
  }

  res.redirect(redirectURL);
};
