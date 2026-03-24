const config = require('config');
const express = require('express');
const createError = require('http-errors');
const jwt = require('jsonwebtoken');
const Sequelize = require('sequelize');
const db = require('../../db');
const service = require('./service');
const isRedirectAllowed = require('../../services/isRedirectAllowed');
const prefillAllowedDomains = require('../../services/prefillAllowedDomains');
const crypto = require('crypto');

let router = express.Router({ mergeParams: true });

// TODO: paths should be auto-configured through server://.well-known/openid-configuration

// ----------------------------------------------------------------------------------------------------
// connect a user from an external auth server to the api

router
  .route('(/project/:projectId)?/connect-user')
  .post(async function (req, res, next) {
    try {
      let iss = req.body.iss;
      if (iss !== req.authConfig.serverUrl) throw Error('Unknown auth server');

      let accessToken = req.body.access_token;
      let mappedUserData = await service.fetchUserData({
        authConfig: req.authConfig,
        accessToken: accessToken,
      });

      let openStadUser = await db.User.findOne({
        where: {
          [Sequelize.Op.and]: [
            { projectId: req.params.projectId },
            {
              idpUser: {
                identifier: mappedUserData.idpUser.identifier,
                provider: mappedUserData.idpUser.provider,
              },
            },
          ],
        },
      });

      // console.log('FOUND: ', openStadUser && openStadUser.id);

      openStadUser = await db.User.upsert({
        ...mappedUserData,
        id: openStadUser && openStadUser.id,
        projectId: req.params.projectId,
        email: mappedUserData.email,
        idpUser: mappedUserData.idpUser,
        lastLogin: new Date(),
      });

      if (Array.isArray(openStadUser)) openStadUser = openStadUser[0];

      // TODO: iss moet gecontroleerd
      jwt.sign(
        {
          userId: openStadUser.id,
          authProvider: req.authConfig.provider,
          authProviderId: req.authConfig.authProviderId,
        },
        config.auth['jwtSecret'],
        { expiresIn: 182 * 24 * 60 * 60 },
        (err, token) => {
          if (err) return next(err);
          return res.json({
            jwt: token,
          });
        }
      );
    } catch (err) {
      return next(err);
    }
  });

// ----------------------------------------------------------------------------------------------------
// login
router
  .route('(/project/:projectId)?/login')
  .get(async function (req, res, next) {
    // logout first?
    if (!req.query.forceNewLogin) return next();

    // Check if redirect domain is allowed
    if (
      req.query.redirectUri &&
      req.project.id &&
      (await isRedirectAllowed(req.project.id, req.query.redirectUri))
    ) {
      let baseUrl = config.url;
      let backToHereUrl =
        baseUrl +
        '/auth/project/' +
        req.project.id +
        '/login?useAuth=' +
        req.authConfig.provider +
        '&redirectUri=' +
        encodeURIComponent(req.query.redirectUri);
      backToHereUrl = encodeURIComponent(backToHereUrl);
      let url =
        baseUrl +
        '/auth/project/' +
        req.project.id +
        '/logout?redirectUri=' +
        backToHereUrl;
      return res.redirect(url);
    } else if (req.query.redirectUri) {
      return next(createError(403, 'redirectUri not found in allowlist.'));
    }
    return next();
  })
  .get(async function (req, res, next) {
    // Check if redirect domain is allowed
    if (
      req.query.redirectUri &&
      req.project.id &&
      (await isRedirectAllowed(req.project.id, req.query.redirectUri))
    ) {
      const authConfigId = req.authConfig && req.authConfig.authProviderId;
      if (!authConfigId)
        return next(createError(403, 'No authConfig for this project.'));

      const projectServerLoginPaths =
        req.project &&
        req.project.config &&
        req.project.config.authProvidersServerLoginPath;
      if (!projectServerLoginPaths || !projectServerLoginPaths[authConfigId])
        return next(
          createError(
            403,
            'No serverLoginPath for this project and authConfig.'
          )
        );

      req.authConfig.serverLoginPath = projectServerLoginPaths[authConfigId];

      // Keep callback URL fixed to satisfy strict redirect URI allowlists
      // (e.g. Signicat broker legacy connections).
      const callbackUrl = config.url + '/auth/digest-login';
      const redirectUri = encodeURIComponent(callbackUrl);

      const pkceEnabled = !!req.authConfig.pkceEnabled || false;
      const apiUrl = config.url;
      let url = req.authConfig.serverUrl + req.authConfig.serverLoginPath; // + '&acr_values=loa:low';
      url = url.replace(/\[\[clientId\]\]/, req.authConfig.clientId);
      url = url.replace(/\[\[redirectUri\]\]/, redirectUri);
      // Backward compatibility for previously stored malformed scope templates
      // (e.g. `openid%%20...` becoming `openid%25%2520...` in browser URLs).
      url = url.replace(/(scope=[^&]*?)%25%2520/g, '$1%20');
      url = url.replace(/scope=openid%%20/g, 'scope=openid%20');

      // If we have a Proof Key for Code Exchange flow enabled for the Authorization Code Flow, we must provide a code_verifier and code_challenge to the authorization server
      // Example docs: https://auth0.com/docs/get-started/authentication-and-authorization-flow/authorization-code-flow-with-pkce
      if (pkceEnabled) {
        // Generate a code_verifier
        const codeVerifier = crypto.randomBytes(32).toString('hex');

        // Generate a code_challenge based on the code_verifier
        const codeChallenge = crypto
          .createHash('sha256')
          .update(codeVerifier)
          .digest('base64url');

        url = url.replace(
          /\[\[codeChallenge\]\]/,
          encodeURIComponent(codeChallenge)
        );

        // Save the code_verifier in the database
        const codeVerifierInDb = await db.OidcCodeVerifier.create({
          verifier: codeVerifier,
        });

        if (!codeVerifierInDb || !codeVerifierInDb.id)
          throw new Error('Could not save code_verifier in database');

        // Save the uuid for this code_verifier in a cookie
        res.cookie('pkce_uuid', codeVerifierInDb.id, {
          path: '/',
          httpOnly: true,
          secure: true,
        });
      }

      // Set cookies for digest login
      res.cookie('useAuth', 'oidc', {
        path: '/',
        httpOnly: true,
        secure: true,
      });
      res.cookie('redirectUri', req.query.redirectUri, {
        path: '/',
        httpOnly: true,
        secure: true,
      });
      res.cookie('projectId', req.project.id, {
        path: '/',
        httpOnly: true,
        secure: true,
      });

      res.redirect(url);
    } else if (req.query.redirectUri) {
      return next(createError(403, 'redirectUri not found in allowlist.'));
    }
    return next();
  });

// ----------------------------------------------------------------------------------------------------
// digest

router
  .route('(/project/:projectId)?/digest-login')
  .get(async function (req, res, next) {
    // get accesstoken for code
    if (req.query.error) {
      const redirectUri = (req.cookies && req.cookies['redirectUri']) || '/';
      res.clearCookie('redirectUri', { path: '/' });
      res.clearCookie('useAuth', { path: '/' });
      res.clearCookie('projectId', { path: '/' });
      return res.redirect(redirectUri);
    }

    let code = req.query.code;
    if (!code) return next(createError(403, 'Je bent niet ingelogd'));

    let url = req.authConfig.serverUrl + req.authConfig.serverExchangeCodePath;

    let data = {
      client_id: req.authConfig.clientId,
      client_secret: req.authConfig.clientSecret,
      code: code,
      grant_type: 'authorization_code',
    };

    const pkceEnabled = !!req.authConfig.pkceEnabled || false;

    // If we have a Proof Key for Code Exchange flow enabled for the Authorization Code Flow, we must provide a code_verifier and code_challenge to the authorization server
    // Example docs: https://auth0.com/docs/get-started/authentication-and-authorization-flow/authorization-code-flow-with-pkce
    if (pkceEnabled) {
      // Get verifier
      const pkceUuid = req.cookies['pkce_uuid'];

      if (!pkceUuid) throw new Error('No PKCE verified UUID provided');

      // Get verifier from database
      const verifier = await db.OidcCodeVerifier.findOne({
        where: { id: pkceUuid },
      });

      if (!verifier || !verifier.verifier) {
        throw new Error('PKCE Verifier not found for given UUID');
      }

      data.code_verifier = verifier.verifier;
    }

    let contentType =
      req.authConfig.serverExchangeContentType || 'application/json';
    if (contentType == 'application/x-www-form-urlencoded') {
      let encoded = `client_id=${encodeURIComponent(
        req.authConfig.clientId
      )}&client_secret=${encodeURIComponent(
        req.authConfig.clientSecret
      )}&code=${encodeURIComponent(
        code
      )}&grant_type=authorization_code&redirect_uri=${encodeURIComponent(
        config.url + '/auth/digest-login'
      )}`;
      if (pkceEnabled && data.code_verifier) {
        encoded += `&code_verifier=${encodeURIComponent(data.code_verifier)}`;
      }
      data = encoded;
    }

    fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': contentType,
      },
      body: data,
    })
      .then((response) => {
        if (!response.ok) throw Error(response);
        return response.json();
      })
      .then((json) => {
        let accessToken = json.access_token;
        if (!accessToken)
          return next(
            createError(403, 'Inloggen niet gelukt: geen accessToken')
          );

        req.userAccessToken = accessToken;
        return next();
      })
      .catch((err) => {
        throw createError(401, 'Login niet gelukt');
      });
  })
  .get(async function (req, res, next) {
    try {
      // get userdata from auth server
      req.userData = await service.fetchUserData({
        authConfig: req.authConfig,
        accessToken: req.userAccessToken,
      });
    } catch (err) {
      throw createError(err);
    }
    return next();
  })
  .get(function (req, res, next) {
    req.userData.projectId = req.project.id; // todo: ik weet nog niet waar dit moet
    let data = req.userData;

    // if user has same projectId and userId
    // rows are duplicate for a user
    let where = {
      where: Sequelize.and(
        {
          idpUser: {
            identifier: data.idpUser.identifier,
            provider: data.idpUser.provider,
          },
        },
        { projectId: data.projectId }
      ),
    };

    // find or create the user
    db.User.findAll(where)
      .then((result) => {
        if (result && result.length > 1)
          return next(createError(403, 'Meerdere users gevonden'));
        if (result && result.length == 1) {
          // user found; update and use
          let user = result[0];

          // Always update IDP session fields
          const updateData = {
            idpUser: data.idpUser,
            lastLogin: data.lastLogin,
          };

          // Only update profile fields if the new value is non-empty,
          // so existing data is never wiped by a missing IDP value
          const profileFields = [
            'email',
            'name',
            'phoneNumber',
            'address',
            'postcode',
            'city',
            'nickName',
            'emailNotificationConsent',
          ];
          for (const field of profileFields) {
            if (
              data[field] !== null &&
              data[field] !== undefined &&
              data[field] !== ''
            ) {
              updateData[field] = data[field];
            }
          }

          user
            .update(updateData, { validate: false })
            .then(() => {
              req.userData.id = user.id;
              return next();
            })
            .catch((e) => {
              req.userData.id = user.id;
              return next();
            });
        } else {
          // user not found; create
          if (!req.project.config.users.canCreateNewUsers)
            return next(
              createError(
                403,
                'Users mogen niet aangemaakt worden op deze project'
              )
            );

          data.complete = true;

          db.User.create(data, { validate: false })
            .then((result) => {
              req.userData.id = result.id;
              return next();
            })
            .catch((err) => {
              //console.log('OAUTH DIGEST - CREATE USER ERROR');
              next(err);
            });
        }
      })
      .catch(next);
  })
  .get(function (req, res, next) {
    // todo: deze afvanging moet veel eerder!!!
    const isSafeRedirectUrl = (url, allowedDomains) => {
      allowedDomains = prefillAllowedDomains(allowedDomains || []);

      try {
        const parsedUrl = new URL(url);

        return (
          allowedDomains.includes(parsedUrl.host) &&
          parsedUrl.protocol === 'https:'
        );
      } catch (err) {
        return false;
      }
    };

    const allowedDomains = req.project?.config?.allowedDomains || [];

    const redirectUriFromCookies =
      (req.cookies && req.cookies['redirectUri']) || '';
    const afterLoginRedirect = req.authConfig?.afterLoginRedirectUri || '';

    let returnTo = String(afterLoginRedirect);

    if (req.query.returnTo) {
      if (isSafeRedirectUrl(req.query.returnTo, allowedDomains)) {
        returnTo = String(req.query.returnTo);
      }
    }

    if (redirectUriFromCookies) {
      if (isSafeRedirectUrl(redirectUriFromCookies, allowedDomains)) {
        returnTo = String(redirectUriFromCookies);
      }
    }

    res.clearCookie('redirectUri', { path: '/' });
    res.clearCookie('useAuth', { path: '/' });
    res.clearCookie('projectId', { path: '/' });

    let redirectUrl = returnTo;
    if (redirectUrl && !redirectUrl.includes('openstadlogintoken=[[jwt]]')) {
      redirectUrl +=
        (redirectUrl.includes('?') ? '&' : '?') + 'openstadlogintoken=[[jwt]]';
    }
    redirectUrl = redirectUrl || '/';

    if (!isSafeRedirectUrl(redirectUrl, allowedDomains)) {
      return res.status(500).json({ status: 'Redirect domain not allowed' });
    }

    //check if redirect domain is allowed
    if (redirectUrl.match('[[jwt]]')) {
      return jwt.sign(
        {
          userId: req.userData.id,
          authProvider: req.authConfig.provider,
          authProviderId: req.authConfig.authProviderId,
        },
        req.authConfig.jwtSecret,
        { expiresIn: 182 * 24 * 60 * 60 },
        (err, token) => {
          if (err) {
            return next(err);
          }
          redirectUrl = redirectUrl.replace('[[jwt]]', token);

          // Revalidate redirectUrl after adding the token
          if (!isSafeRedirectUrl(redirectUrl, allowedDomains)) {
            return res
              .status(500)
              .json({ status: 'Redirect domain not allowed' });
          }

          return res.redirect(redirectUrl);
        }
      );
    }

    // Revalidate redirectUrl after modification
    if (isSafeRedirectUrl(redirectUrl, allowedDomains)) {
      return res.redirect(redirectUrl);
    } else {
      // Revalidate redirectUrl before redirecting
      if (!isSafeRedirectUrl(redirectUrl, allowedDomains)) {
        return res.status(500).json({ status: 'Redirect domain not allowed' });
      }

      return res.redirect(redirectUrl);
    }
  });

// ----------------------------------------------------------------------------------------------------
// logout

router
  .route('(/project/:projectId)?/logout')
  .get(function (req, res, next) {
    return next();
  })
  .get(async function (req, res, next) {
    // api user
    if (req.user && req.user.id > 1) {
      let idpUser = req.user.idpUser;
      delete idpUser.accesstoken;
      await req.user.update({
        idpUser,
      });
    }
    return next();
  })
  .get(async function (req, res, next) {
    // redirect to logout server
    /*if (req.authConfig.serverLogoutPath) {
      let url = req.authConfig.serverUrl + req.authConfig.serverLogoutPath;
      url = url.replace(/\[\[clientId\]\]/, req.authConfig.clientId); // todo dezde oet denk ik naar authconfig middleware
      if (req.query.redirectUri) {
        url = `${url}&redirectUrl=${encodeURIComponent(req.query.redirectUri)}`;
      }
      return res.redirect(url);
    }*/

    res.clearCookie('useAuthProvider', { path: '/' });
    res.clearCookie('useAuth', { path: '/' });
    res.clearCookie('pkce_uuid', { path: '/' });

    // Check if redirect domain is allowed
    if (
      req.query.redirectUri &&
      req.project.id &&
      (await isRedirectAllowed(req.project.id, req.query.redirectUri))
    ) {
      return res.redirect(req.query.redirectUri);
    } else if (req.query.redirectUri) {
      return next(createError(403, 'redirectUri not found in allowlist.'));
    }
    return res.json({ logout: 'success' });
  });

// ----------------------------------------------------------------------------------------------------
// TAF

module.exports = router;
