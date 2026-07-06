const config = require('config');
const express = require('express');
const createError = require('http-errors');
const jwt = require('jsonwebtoken');
const Sequelize = require('sequelize');
const db = require('../../db');
const service = require('./service');
const hasRole = require('../../lib/sequelize-authorization/lib/hasRole');
const isRedirectAllowed = require('../../services/isRedirectAllowed');
const prefillAllowedDomains = require('../../services/prefillAllowedDomains');
const sessionDuration = require('../../util/session-duration');
let router = express.Router({ mergeParams: true });

// Todo: dit is 'openstad', dus veel configuratie mag hier hardcoded en uit de config gehaald
// ----------------------------------------------------------------------------------------------------
// connect a user from the openstad auth server to the api

router
  .route('(/project/:projectId)?/connect-user')
  .post(async function (req, res, next) {
    try {
      // console.log(req.body);
      // console.log(req.authConfig);

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
        { userId: openStadUser.id, authProvider: req.authConfig.provider },
        config.auth['jwtSecret'],
        {
          expiresIn: sessionDuration.getJwtExpiresInForRole(openStadUser.role),
        },
        (err, token) => {
          if (err) return next(err);
          const response = { jwt: token };
          if (sessionDuration.shouldExpireOnClose(openStadUser.role)) {
            response.expireOnClose = true;
          }
          return res.json(response);
        }
      );
    } catch (err) {
      console.log(err);
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

    const projectId = req.params.projectId;
    if (
      req.query.redirectUri &&
      projectId &&
      (await isRedirectAllowed(projectId, req.query.redirectUri))
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
    // redirect to idp server
    const projectId = req.params.projectId;
    if (
      req.query.redirectUri &&
      projectId &&
      (await isRedirectAllowed(projectId, req.query.redirectUri))
    ) {
      let redirectUri = encodeURIComponent(
        config.url +
          '/auth/project/' +
          req.project.id +
          '/digest-login?useAuth=' +
          req.authConfig.provider +
          '&returnTo=' +
          req.query.redirectUri
      );
      let url = `${req.authConfig.serverUrl}/dialog/authorize`;
      if (req.query.loginPriviliged)
        url = `${req.authConfig.serverUrl}/auth/admin/login`;
      url = `${url}?redirect_uri=${redirectUri}&response_type=code&client_id=${req.authConfig.clientId}&scope=offline`;
      return res.redirect(url);
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
    // check redirect first
    let returnTo = req.query.returnTo;
    returnTo = decodeURIComponent(returnTo);
    returnTo = returnTo || '/?openstadlogintoken=[[jwt]]';
    returnTo = String(returnTo);

    const hashIndex = returnTo.indexOf('#');
    if (hashIndex !== -1) {
      returnTo = returnTo.substring(0, hashIndex);
    }
    if (!returnTo.match(/\[\[jwt\]\]/))
      returnTo =
        returnTo +
        (returnTo.includes('?') ? '&' : '?') +
        'openstadlogintoken=[[jwt]]';
    let redirectUrl = returnTo;
    redirectUrl =
      redirectUrl ||
      (req.query.returnTo
        ? String(req.query.returnTo) +
          (String(req.query.returnTo).includes('?') ? '&' : '?') +
          'openstadlogintoken=[[jwt]]'
        : false);
    redirectUrl = redirectUrl || '/';

    const isAllowedRedirectDomain = (url, project) => {
      let allowedDomains = prefillAllowedDomains(
        project?.config?.allowedDomains || [],
        project?.url
      );

      if (config.admin.domain) {
        const domain = config.admin.domain.replace(/:\d+$/, '');
        allowedDomains.push(domain);
      }
      let redirectUrlHost = '';
      try {
        redirectUrlHost = new URL(url).host;
      } catch (err) {}
      // throw error if allowedDomains is empty or the redirectURI's host is not present in the allowed domains
      return allowedDomains && allowedDomains.indexOf(redirectUrlHost) !== -1;
    };

    // check if redirect domain is allowed
    if (isAllowedRedirectDomain(redirectUrl, req.project)) {
      req.redirectUrl = redirectUrl;
      return next();
    } else {
      console.log(
        `[${new Date().toISOString()}][digest-login] redirect domain not allowed: ${redirectUrl?.substring(0, 100)} projectId=${req.project?.id}`
      );
      res.status(500).json({
        status: 'Redirect domain not allowed',
      });
    }
  })
  .get(async function (req, res, next) {
    let code = req.query.code;
    if (!code) {
      console.log(
        `[${new Date().toISOString()}][digest-login] no auth code in request: projectId=${req.project?.id}`
      );
      throw createError(403, 'Je bent niet ingelogd');
    }

    let url = `${req.authConfig.serverUrlInternal}/oauth/token`;
    let data = {
      client_id: req.authConfig.clientId,
      client_secret: req.authConfig.clientSecret,
      code: code,
      grant_type: 'authorization_code',
    };

    try {
      let response = await fetch(url, {
        headers: { 'Content-type': 'application/json' },
        method: 'POST',
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        console.log(
          `[${new Date().toISOString()}][digest-login] token exchange failed: projectId=${req.project?.id} status=${response.status}`
        );
        throw new Error('Fetch failed');
      }

      let json = await response.json();

      let accessToken = json.access_token;
      if (!accessToken) {
        console.log(
          `[${new Date().toISOString()}][digest-login] no access_token in response: projectId=${req.project?.id}`
        );
        return next(createError(403, 'Inloggen niet gelukt: geen accessToken'));
      }

      req.userAccessToken = accessToken;
      return next();
    } catch (err) {
      console.log(
        `[${new Date().toISOString()}][digest-login] token exchange error: projectId=${req.project?.id} error=${err?.message}`
      );
      return next(createError(401, 'Login niet gelukt'));
    }
  })
  .get(async function (req, res, next) {
    try {
      req.userData = await service.fetchUserData({
        authConfig: req.authConfig,
        accessToken: req.userAccessToken,
      });
    } catch (err) {
      console.log(
        `[${new Date().toISOString()}][digest-login] user data fetch failed: projectId=${req.project?.id} error=${err?.message}`
      );
      return next(createError(err));
    }
    return next();
  })
  .get(function (req, res, next) {
    req.userData.projectId = req.project.id; // todo: ik weet nog niet waar dit moet
    let data = req.userData;

    if (!!data && !!data.emailNotificationConsent && !!data.clientId) {
      const clientId = String(data?.clientId);
      const currentValue =
        typeof data.emailNotificationConsent === 'object'
          ? data.emailNotificationConsent
          : {};
      const clientConsentIsSet = currentValue.hasOwnProperty(clientId);

      if (clientConsentIsSet) {
        data.emailNotificationConsent = currentValue[clientId];
      } else {
        // clientConsent is not set (correctly); remove it to prevent overwriting existing consent
        delete data.emailNotificationConsent;
      }
    }

    if (!!data && !!data.privacyConsentAt && !!data.clientId) {
      const clientId = String(data?.clientId);
      const currentValue =
        typeof data.privacyConsentAt === 'object' ? data.privacyConsentAt : {};
      const clientConsentIsSet = currentValue.hasOwnProperty(clientId);

      if (clientConsentIsSet) {
        data.privacyConsentAt = currentValue[clientId];
      } else {
        delete data.privacyConsentAt;
      }
    }

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

    db.User.findAll(where)
      .then((result) => {
        if (result && result.length > 1)
          return next(createError(403, 'Meerdere users gevonden'));
        if (result && result.length == 1) {
          let user = result[0];

          user
            .update(data)
            .then(() => {
              req.userData.id = user.id;
              console.log(
                `[${new Date().toISOString()}][digest-login] user found and updated: userId=${user.id} projectId=${req.project?.id}`
              );
              return next();
            })
            .catch((e) => {
              console.log(
                `[${new Date().toISOString()}][digest-login] user update failed: userId=${user.id} projectId=${req.project?.id} error=${e?.message}`
              );
              req.userData.id = user.id;
              return next();
            });
        } else {
          if (!req.project.config.users.canCreateNewUsers)
            return next(
              createError(
                403,
                'Users mogen niet aangemaakt worden op deze project'
              )
            );

          data.complete = true;

          db.User.create(data)
            .then((result) => {
              req.userData.id = result.id;
              console.log(
                `[${new Date().toISOString()}][digest-login] user created: userId=${result.id} projectId=${req.project?.id} role=${result.role}`
              );
              return next();
            })
            .catch((err) => {
              console.log(
                `[${new Date().toISOString()}][digest-login] user create failed: projectId=${req.project?.id} error=${err?.message}`
              );
              next(err);
            });
        }
      })
      .catch(next);
  })
  .get(function (req, res, next) {
    if (
      !req?.userData?.projectId ||
      (req?.userData?.projectId && req?.userData?.projectId !== 1)
    )
      return next();

    const privilegedRoles = ['admin', 'moderator', 'editor'];

    const userRole = req?.userData?.role || '';
    const isPrivileged = privilegedRoles.includes(userRole);

    if (!isPrivileged) {
      let logoutUrl = '/signout';

      try {
        if (req.redirectUrl) {
          const url = new URL(req.redirectUrl);
          logoutUrl = `${url.origin}/signout`;
        }
      } catch (e) {}

      return res.status(403).json({
        error: 'Je hebt geen toegang tot deze omgeving',
        logoutLink: logoutUrl,
      });
    }

    return next();
  })
  .get(function (req, res, next) {
    if (!req.redirectUrl.match('[[jwt]]')) return next();
    jwt.sign(
      { userId: req.userData.id, authProvider: req.authConfig.provider },
      req.authConfig.jwtSecret,
      {
        expiresIn: sessionDuration.getJwtExpiresInForRole(req.userData.role),
      },
      (err, token) => {
        if (err) {
          console.log(
            `[${new Date().toISOString()}][digest-login] JWT sign error: userId=${req.userData?.id} projectId=${req.project?.id} error=${err?.message}`
          );
          return next(err);
        }
        req.redirectUrl = req.redirectUrl.replace('[[jwt]]', token);
        if (sessionDuration.shouldExpireOnClose(req.userData.role)) {
          req.redirectUrl +=
            (req.redirectUrl.includes('?') ? '&' : '?') + 'expireOnClose=1';
        }
        console.log(
          `[${new Date().toISOString()}][digest-login] complete: userId=${req.userData?.id} projectId=${req.project?.id} role=${req.userData?.role} redirect=${req.redirectUrl?.substring(0, 80)}`
        );
        return next();
      }
    );
  })
  .get(function (req, res, next) {
    res.redirect(req.redirectUrl);
  });

// ----------------------------------------------------------------------------------------------------
// logout

router
  .route('(/project/:projectId)?/logout')
  .get(async function (req, res, next) {
    // api user
    if (req.user && req.user.id > 1) {
      // note: it is unlikely that you get here; most logout requests will not send Auth headers
      let idpUser = req.user.idpUser;
      delete idpUser.accesstoken;
      await req.user.update({
        idpUser,
      });
    }
    return next();
  })
  .get(async function (req, res, next) {
    if (!req.query.ipdlogout) {
      const rawRedirectUri = Array.isArray(req.query.redirectUri)
        ? req.query.redirectUri[0]
        : req.query.redirectUri || '';
      let url = `${req.authConfig.serverUrl}/logout?client_id=${req.authConfig.clientId}`;
      if (rawRedirectUri) {
        let safeRedirect;
        try {
          const parsedRedirect = new URL(rawRedirectUri);
          if (parsedRedirect.origin === new URL(config.url).origin) {
            // internal redirect (e.g. forceNewLogin loop): use the full URL as-is
            safeRedirect = rawRedirectUri;
          } else {
            // external caller (CMS, admin): validate against project allowlist
            const projectId = req.params.projectId;
            const allowed =
              projectId && (await isRedirectAllowed(projectId, rawRedirectUri));
            if (allowed) {
              safeRedirect = parsedRedirect.origin + '?openstadlogout=true';
            }
          }
        } catch (e) {
          safeRedirect = '';
        }
        if (safeRedirect) {
          url += `&redirectUrl=${encodeURIComponent(safeRedirect)}`;
        }
      }
      return res.redirect(url);
    }
    return next();
  })
  .get(function (req, res) {
    return res.json({ logout: 'success' });
  });

// ----------------------------------------------------------------------------------------------------
// unique codes

router
  .route('(/project/:projectId)?/uniquecode')
  .all(async function (req, res, next) {
    if (!hasRole(req.user, 'editor'))
      return next(new Error('You cannot list these codes'));
    return next();
  })

  // list
  .get(async function (req, res, next) {
    let codes = {};
    try {
      codes = await service.fetchUniqueCode({
        authConfig: req.authConfig,
        isExport: req.query.export === 'true',
        limit: req.query.limit,
        offset: req.query.offset,
        search: req.query.search,
        sort: req.query.sort,
      });
    } catch (err) {
      console.log(err);
      return next(err);
    }
    res.json(codes);
  })

  // create
  .post(async function (req, res, next) {
    let codes = {};
    try {
      codes = await service.createUniqueCode({
        authConfig: req.authConfig,
        amount: parseInt(req.body.amount) || 1,
      });
    } catch (err) {
      console.log(err);
      return next(err);
    }
    res.json(codes);
  });

router
  .route('(/project/:projectId)?/uniquecode/:uniqueCodeId/reset')

  // reset
  .post(async function (req, res, next) {
    if (!hasRole(req.user, 'editor'))
      return next(new Error('You cannot list these codes'));

    let uniqueCodeId = parseInt(req.params.uniqueCodeId);
    if (!uniqueCodeId) return next(new Error('No code id found'));

    let codes = {};
    try {
      codes = await service.resetUniqueCode({
        authConfig: req.authConfig,
        uniqueCodeId: uniqueCodeId,
      });
    } catch (err) {
      console.log(err);
      return next(err);
    }
    res.json(codes);
  });

// ----------------------------------------------------------------------------------------------------
// access codes

router
  .route('(/project/:projectId)?/accesscode')
  .all(async function (req, res, next) {
    if (!hasRole(req.user, 'editor'))
      return next(new Error('You cannot list these codes'));
    return next();
  })

  // list
  .get(async function (req, res, next) {
    let codes = {};
    try {
      codes = await service.fetchAccessCode({
        authConfig: req.authConfig,
      });
    } catch (err) {
      console.log(err);
      return next(err);
    }
    res.json(codes);
  })

  // create
  .post(async function (req, res, next) {
    let codes = {};
    if (!req.body.code) return next(new Error('No code provided'));

    try {
      codes = await service.createAccessCode({
        authConfig: req.authConfig,
        code: req.body.code,
      });
    } catch (err) {
      console.log(err);
      return next(err);
    }
    res.json(codes);
  });

router
  .route('(/project/:projectId)?/accesscode/:accessCodeId/delete')

  // delete
  .delete(async function (req, res, next) {
    if (!hasRole(req.user, 'editor'))
      return next(new Error('You cannot list these codes'));

    let accessCodeId = parseInt(req.params.accessCodeId);
    if (!accessCodeId) return next(new Error('No code id found'));

    let codes = {};
    try {
      codes = await service.deleteAccessCode({
        authConfig: req.authConfig,
        accessCodeId: accessCodeId,
      });
    } catch (err) {
      console.log(err);
      return next(err);
    }
    res.json(codes);
  });

// ----------------------------------------------------------------------------------------------------
// TAF

module.exports = router;
