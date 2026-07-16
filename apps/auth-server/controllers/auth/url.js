/**
 * Controller responsible for handling the logic for Url login
 * (login in with a link, for now send by e-mail)
 */
const authType = 'Url';

const passport = require('passport');
const db = require('../../db');
const tokenUrl = require('../../services/tokenUrl');
const authService = require('../../services/authService');
const verificationService = require('../../services/verificationService');
const authUrlConfig = require('../../config/auth').get('Url');
const clientAuth = require('../../utils/clientAuth');
const interpolate = require('../../utils/interpolate');
const sanitize = require('../../utils/sanitize');
const { logAuthEvent } = require('../../middleware/auditLog');
const anonymousRoleId = parseInt(process.env.ANONYMOUS_ROLE_ID, 10) || 3;

const setNoCachHeadersMw = (req, res, next) => {
  res.setHeader('Surrogate-Control', 'no-store');
  res.setHeader(
    'Cache-Control',
    'no-store, no-cache, must-revalidate, proxy-revalidate'
  );
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  next();
};

// set no cache headers, so on return with back button no csrf issues
exports.login = [
  setNoCachHeadersMw,
  (req, res) => {
    const config = req.client.config ? req.client.config : {};
    const configAuthType =
      config.authTypes && config.authTypes[authType]
        ? config.authTypes[authType]
        : {};
    const priviligedRoute =
      (req.query &&
        req.query.priviligedRoute &&
        req.query.priviligedRoute === 'admin') ||
      false;

    const loginVars = { clientEmail: config.contactEmail || '' };

    res.render('auth/url/login', {
      clientId: sanitize.plainText(req.client.clientId),
      client: sanitize.client(req.client),
      redirectUrl: req.redirectUri ? encodeURIComponent(req.redirectUri) : '',
      title: sanitize.safeTags(configAuthType.title || false),
      description: sanitize.safeTags(configAuthType.description || false),
      label: sanitize.plainText(configAuthType.label || false),
      helpText: sanitize.safeTags(
        interpolate(configAuthType.helpText, loginVars) || false
      ),
      buttonText: sanitize.plainText(configAuthType.buttonText || false),
      isPriviligedRoute: priviligedRoute,
    });
  },
];

exports.confirmation = (req, res) => {
  const config = req.client.config ? req.client.config : {};
  const configAuthType =
    config.authTypes && config.authTypes[authType]
      ? config.authTypes[authType]
      : {};

  const clientId = sanitize.plainText(req.client.clientId);
  const redirectUrl = req.redirectUri
    ? encodeURIComponent(req.redirectUri)
    : '';

  const vars = {
    loginUrl: '/login',
    clientId,
    redirectUrl,
    retryUrl: `/login?clientId=${clientId}&redirect_uri=${redirectUrl}`,
    clientEmail: config.contactEmail || '',
  };

  res.render('auth/url/confirmation', {
    client: sanitize.client(req.client),
    retryUrl: vars.retryUrl,
    clientEmail: sanitize.plainText(vars.clientEmail),
    title: sanitize.safeTags(
      interpolate(configAuthType.confirmedTitle, vars) || false
    ),
    description: sanitize.safeTags(
      interpolate(configAuthType.confirmedDescription, vars) || false
    ),
    helpText: sanitize.safeTags(
      interpolate(configAuthType.confirmedHelpText, vars) || false
    ),
  });
};

exports.authenticate = (req, res) => {
  const config = req.client.config ? req.client.config : {};
  const configAuthType =
    config.authTypes && config.authTypes[authType]
      ? config.authTypes[authType]
      : {};

  res.render('auth/url/authenticate', {
    clientId: sanitize.plainText(req.client.clientId),
    client: sanitize.client(req.client),
    redirectUrl: req.redirectUri ? encodeURIComponent(req.redirectUri) : '',
    loaderTitle: sanitize.plainText(configAuthType.loaderTitle),
    loaderDescription: sanitize.plainText(configAuthType.loaderDescription),
    loaderImage: sanitize.plainText(configAuthType.loaderImage),
  });
};

exports.register = (req, res, next) => {
  res.render('auth/url/register', {
    token: sanitize.plainText(String(req.query.token || '')),
    client: sanitize.client(req.client),
    clientId: sanitize.plainText(req.client.clientId),
  });
};

const handleSending = async (req, res, next) => {
  let isPrivilegedRoute = req.params.priviligedRoute === 'admin';

  if (!isPrivilegedRoute) {
    isPrivilegedRoute = req?.query?.priviligedRoute === 'admin' || false;
  }

  // Mark route as privileged if the client ID is 1 (Admin panel)
  if (req?.client?.id && req?.client?.id === 1) {
    isPrivilegedRoute = true;
  }

  try {
    if (isPrivilegedRoute) {
      req.user = await authService.validatePrivilegeUser(
        req.body.email,
        req.client.id
      );
    }

    await verificationService.sendVerification(
      req.user,
      req.client,
      req.redirectUrl
    );

    req.flash('success', {
      msg: 'De e-mail is verstuurd naar: ' + req.user.email,
    });

    res.redirect(
      req.redirectUrl
        ? '/auth/url/confirmation?clientId=' +
            req.client.clientId +
            '&redirect_uri=' +
            req.redirectUrl
        : '/login?clientId=' + req.client.clientId
    );
  } catch (err) {
    console.log('e-mail error', err);
    req.flash('error', {
      msg: 'Het is niet gelukt om de e-mail te versturen!',
    });

    let redirectUrl =
      '/auth/url/login?clientId=' +
      req.client.clientId +
      '&redirect_uri=' +
      req.redirectUrl;

    if (isPrivilegedRoute) {
      redirectUrl += '&priviligedRoute=admin';
    }

    res.redirect(redirectUrl);
  }
};

//Todo: move these methods to the user service
const createUser = async (email) => {
  return db.User.create({ email: email });
};

const updateUser = async (user, email) => {
  return user.update({ email });
};

const getUser = async (email) => {
  return db.User.findOne({ where: { email } });
};

exports.postLogin = async (req, res, next) => {
  try {
    const clientConfig = req.client.config ? req.client.config : {};
    req.redirectUrl =
      clientConfig && clientConfig.emailRedirectUrl
        ? clientConfig.emailRedirectUrl
        : req.redirectUri
          ? encodeURIComponent(req.redirectUri)
          : '';

    let user = await getUser(req.body.email);

    if (user) {
      req.user = user;
      return handleSending(req, res, next);
    }

    /**
     * Format the URL and the Send it to the user
     * If active user is already set, the user is already logged in
     * If email is not set it means they as anonymous user
     * Add the submitted email to anonymous user
     * If already a user with that email, ignore the anonymous user and login via existing user
     */
    if (req.user && !req.user.email) {
      user = await updateUser(req.user, req.body.email);

      req.user = user;
      return handleSending(req, res, next);
    }

    if (clientConfig.users && clientConfig.users.canCreateNewUsers === false)
      throw new Error('Cannot create new users');
    user = await createUser(req.body.email);

    req.user = user;
    return handleSending(req, res, next);
  } catch (err) {
    console.log('===> err', err);
    req.flash('error', {
      msg: 'Het is niet gelukt om de e-mail te versturen!',
    });
    res.redirect(req.header('Referer') || authUrlConfig.loginUrl);
  }
};

exports.postRegister = (req, res, next) => {
  const { name, postcode, token } = req.body;
  const user = req.user;

  /**
   * Set Values for user; validation is taken care of in middleware
   * After succesfull registration redirect to token login url, for automagic login
   */
  user
    .update({
      name,
      postcode,
    })
    .then((user) => {
      res.redirect(tokenUrl.getUrl(user, req.client, token));
    })
    .catch((err) => {
      next(err);
    });
};

exports.postAuthenticate = (req, res, next) => {
  passport.authenticate('url', { session: true }, function (err, user, info) {
    if (err) {
      return next(err);
    }
    const redirectUrl = req.redirectUri
      ? encodeURIComponent(req.redirectUri)
      : req.client.redirectUrl;

    if (!redirectUrl) {
      return next(
        new Error(
          'No redirect_uri provided and no default redirectUrl configured for this client'
        )
      );
    }

    // Redirect if it fails to the original e-mail screen
    if (!user) {
      logAuthEvent(req, 'login_failed', {
        data: { method: 'url' },
      });
      req.flash('error', {
        msg: 'De url is geen geldige login url, wellicht is deze verlopen',
      });
      return res.redirect(
        `/auth/url/login?clientId=${req.client.clientId}&redirect_uri=${redirectUrl}`
      );
    }

    req.logIn(user, function (err) {
      if (err) {
        return next(err);
      }

      const redirectToAuthorisation = () => {
        // Redirect if it succeeds to authorize screen
        //check if allowed url will be done by authorize screen
        const authorizeUrl = `/dialog/authorize?redirect_uri=${redirectUrl}&response_type=code&client_id=${req.client.clientId}&scope=offline`;
        return res.redirect(authorizeUrl);
      };

      req.brute.resetKey(req.bruteKey);

      //log the succesfull login
      logAuthEvent(req, 'login', {
        data: { method: 'url' },
      });
      const upgradeAnonymousRole = () => {
        const defaultRoleId = parseInt(
          req.client.config?.defaultRoleId || authUrlConfig.defaultRoleId,
          10
        );
        if (isNaN(defaultRoleId)) return Promise.resolve();
        return db.UserRole.findOne({
          where: { clientId: req.client.id, userId: user.id },
        }).then((userRole) => {
          if (userRole && parseInt(userRole.roleId, 10) === anonymousRoleId) {
            return userRole.update({ roleId: defaultRoleId });
          }
        });
      };

      upgradeAnonymousRole()
        .catch((err) => {
          console.log(
            `[url-auth] role upgrade failed for userId=${user.id} clientId=${req.client.id}: ${err?.message}`
          );
        })
        .then(() =>
          clientAuth.initializeClientAuth(req.session, req.client, user, {
            authType,
            twoFactorValid: false,
          })
        )
        .then(() => clientAuth.saveSession(req.session))
        .then(() => authService.logSuccessFullLogin(req))
        .then(() => {
          redirectToAuthorisation();
        })
        .catch(() => {
          redirectToAuthorisation();
        });
    });
  })(req, res, next);
};
