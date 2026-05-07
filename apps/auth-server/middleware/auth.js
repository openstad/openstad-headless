const { body, validationResult } = require('express-validator');
const loginFields = require('../config/user').loginFields;
const db = require('../db');
const clientAuth = require('../utils/clientAuth');

exports.validateLogin = async (req, res, next) => {
  await body('email').isEmail().run(req);
  await body('password').isLength({ min: 6 }).run(req);
  const result = validationResult(req);

  if (result.errors && result.errors.length) {
    req.flash('error', result.errors);
    res.redirect(req.header('Referer') || '/account');
  } else {
    next();
  }
};

exports.check = (req, res, next) => {
  const isAuthenticated =
    typeof req.isAuthenticated === 'function' ? req.isAuthenticated() : false;

  if (!req.isAuthenticated || !isAuthenticated) {
    console.log(
      `[auth-check][${new Date().toISOString()}] NOT authenticated for ${req.originalUrl} clientId=${req.client?.clientId}`
    );
    let url = '/login?clientId=' + req.client.clientId;

    if (req.query.redirect_uri) {
      url = url + '&redirect_uri=' + encodeURIComponent(req.query.redirect_uri);
    }

    if (req.session) {
      req.session.returnTo = req.originalUrl || req.url;
    }

    return res.redirect(url);
  } else {
    db.User.findOne({ where: { id: req.user.id } })
      .then(async (user) => {
        req.user = user;

        if (req.client && req.currentClientAuth) {
          const currentRole = await clientAuth.resolveRoleForClient(
            req.user,
            req.client
          );

          const isExpired = clientAuth.isClientAuthExpired(
            req.currentClientAuth,
            currentRole
          );

          if (isExpired) {
            console.log(
              `[auth-check][${new Date().toISOString()}] session EXPIRED for userId=${user?.id} role=${currentRole} authenticatedAt=${req.currentClientAuth?.authenticatedAt} path=${req.originalUrl}`
            );
            clientAuth.clearClientAuth(req.session, req.client);
            await clientAuth.saveSession(req.session);

            let url = '/login?clientId=' + req.client.clientId;

            if (req.query.redirect_uri) {
              url =
                url +
                '&redirect_uri=' +
                encodeURIComponent(req.query.redirect_uri);
            }

            if (req.session) {
              req.session.returnTo = req.originalUrl || req.url;
            }

            return res.redirect(url);
          }
        }

        console.log(
          `[auth-check][${new Date().toISOString()}] OK for userId=${user?.id} path=${req.originalUrl} hasClientAuth=${!!req.currentClientAuth}`
        );
        return next();
      })
      .catch((err) => {
        console.log(
          `[auth-check][${new Date().toISOString()}] error: ${err?.message} path=${req.originalUrl}`
        );
        next(err);
      });
  }
};

exports.passwordValidate = (req, res, next) => {
  if (req.body.password.length >= 8) {
    next();
  } else {
    req.flash('error', { msg: 'Wachtwoord moet min 8 karakters lang zijn' });
    res.redirect(req.header('Referer') || '/account');
  }
};
