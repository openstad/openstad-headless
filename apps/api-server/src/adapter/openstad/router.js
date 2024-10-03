const config = require('config');
const express = require('express');
const createError = require('http-errors');
const fetch = require('node-fetch');
const jwt = require('jsonwebtoken');
const Sequelize = require('sequelize');
const db = require('../../db');
const service = require('./service');
const hasRole = require('../../lib/sequelize-authorization/lib/hasRole');
const isRedirectAllowed = require('../../services/isRedirectAllowed');
const prefillAllowedDomains = require('../../services/prefillAllowedDomains');
let router = express.Router({mergeParams: true});

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
        })

        let openStadUser = await db.User
            .findOne({
              where: {
                [Sequelize.Op.and]: [
                  { projectId: req.params.projectId },
                  {
                    idpUser: {
                      identifier: mappedUserData.idpUser.identifier,
                      provider: mappedUserData.idpUser.provider,
                    }
                  }
                ]
              }
            })

        // console.log('FOUND: ', openStadUser && openStadUser.id);

        openStadUser = await db.User
          .upsert({
            ...mappedUserData,
            id: openStadUser && openStadUser.id,
            projectId: req.params.projectId,
            email: mappedUserData.email,
            idpUser: mappedUserData.idpUser,
            lastLogin: new Date(),
          });

        if ( Array.isArray(openStadUser) ) openStadUser = openStadUser[0];

        // TODO: iss moet gecontroleerd
        jwt.sign({userId: openStadUser.id, authProvider: req.authConfig.provider}, config.auth['jwtSecret'], {expiresIn: 182 * 24 * 60 * 60}, (err, token) => {
          if (err) return next(err)
          return res.json({
            jwt: token
          })
        });

      } catch(err) {
        console.log(err);
        return next(err)
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
    if(req.query.redirectUri && projectId && await isRedirectAllowed(projectId, req.query.redirectUri)){
      let baseUrl = config.url
      let backToHereUrl = baseUrl + '/auth/project/' + req.project.id + '/login?useAuth=' + req.authConfig.provider + '&redirectUri=' + encodeURIComponent(req.query.redirectUri)
      backToHereUrl = encodeURIComponent(backToHereUrl)
      let url = baseUrl + '/auth/project/' + req.project.id + '/logout?redirectUri=' + backToHereUrl;
      return res.redirect(url)
    }else if(req.query.redirectUri){
      return next(createError(403, 'redirectUri not found in allowlist.'));
    }
    return next();
  })
  .get(async function (req, res, next) {
    // redirect to idp server
    const projectId = req.params.projectId;
    if(req.query.redirectUri && projectId && await isRedirectAllowed(projectId, req.query.redirectUri)){
      let redirectUri = encodeURIComponent(config.url + '/auth/project/' + req.project.id + '/digest-login?useAuth=' + req.authConfig.provider + '\&returnTo=' + req.query.redirectUri);
      let url = `${req.authConfig.serverUrl}/dialog/authorize`;
      if (req.query.loginPriviliged) url = `${req.authConfig.serverUrl}/auth/admin/login`;
      url = `${url}?redirect_uri=${redirectUri}&response_type=code&client_id=${req.authConfig.clientId}&scope=offline`;
      return res.redirect(url);
    }else if(req.query.redirectUri){
      return next(createError(403, 'redirectUri not found in allowlist.'));
    }
    return next();
  })

// ----------------------------------------------------------------------------------------------------
// digest

router
  .route('(/project/:projectId)?/digest-login')
  .get(async function (req, res, next) {
    // check redirect first
    let returnTo = req.query.returnTo;
    returnTo = returnTo || '/?openstadlogintoken=[[jwt]]';
    if (!returnTo.match(/\[\[jwt\]\]/) ) returnTo = returnTo + (returnTo.includes('?') ? '&' : '?') + 'openstadlogintoken=[[jwt]]';
    let redirectUrl = returnTo;
    redirectUrl = redirectUrl || (req.query.returnTo ? req.query.returnTo + (req.query.returnTo.includes('?') ? '&' : '?') + 'openstadlogintoken=[[jwt]]' : false);
    redirectUrl = redirectUrl || '/';

    const isAllowedRedirectDomain = (url, project) => {
      let allowedDomains = prefillAllowedDomains(project?.config?.allowedDomains || []);

      if (project.url) {
        try {
          let projectDomain = new URL(project.url).host;
          allowedDomains.push(projectDomain);
        } catch(err) {}
      }
      if (config.admin.domain) {
        const domain = config.admin.domain.replace(/:\d+$/, '');
        allowedDomains.push(domain);
      }
      let redirectUrlHost = '';
      try {
        redirectUrlHost = new URL(url).host;
      } catch(err) {}
      // throw error if allowedDomains is empty or the redirectURI's host is not present in the allowed domains
      return allowedDomains && allowedDomains.indexOf(redirectUrlHost) !== -1;
    }

    // check if redirect domain is allowed
    if (isAllowedRedirectDomain(redirectUrl, req.project)) {
      req.redirectUrl = redirectUrl;
      return next();
    } else {
      res.status(500).json({
        status: 'Redirect domain not allowed'
      });
    }
  })
  .get(async function (req, res, next) {
    
    // get accesstoken for code
    let code = req.query.code;
    if (!code) throw createError(403, 'Je bent niet ingelogd');

    let url = `${req.authConfig.serverUrlInternal}/oauth/token`;
    let data = {
      client_id: req.authConfig.clientId,
      client_secret: req.authConfig.clientSecret,
      code: code,
      grant_type: 'authorization_code'
    }

    try {

      let response = await fetch(url, {
        headers: { 'Content-type': 'application/json' },
        method: 'POST',
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        console.log(response);
        throw new Error('Fetch failed')
      }

      let json = await response.json();

      let accessToken = json.access_token;
      if (!accessToken) return next(createError(403, 'Inloggen niet gelukt: geen accessToken'));

      req.userAccessToken = accessToken;
      return next();

    } catch(err) {
		  console.log(err);
      return next(createError(401, 'Login niet gelukt'));
	  }

  })
  .get(async function (req, res, next) {

    try {

      // get userdata from auth server
      req.userData = await service.fetchUserData({
        authConfig: req.authConfig,
        accessToken: req.userAccessToken,
      })

    } catch(err) {
      return next(createError(err));
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
        {idpUser: { identifier: data.idpUser.identifier, provider: data.idpUser.provider,  }},
        {projectId: data.projectId},
      )
    }

    // find or create the user
    db.User
      .findAll(where)
      .then(result => {
        if (result && result.length > 1) return next(createError(403, 'Meerdere users gevonden'));
        if (result && result.length == 1) {
          // user found; update and use
          let user = result[0];

          user
            .update(data)
            .then(() => {
              req.userData.id = user.id;
              return next();
            })
            .catch((e) => {
              req.userData.id = user.id;
              return next();
            })

        } else {

          // user not found; create
          if (!req.project.config.users.canCreateNewUsers) return next(createError(403, 'Users mogen niet aangemaakt worden op deze project'));
          
          data.complete = true;

          db.User
            .create(data)
            .then(result => {
              req.userData.id = result.id;
              return next();
            })
            .catch(err => {
              //console.log('OAUTH DIGEST - CREATE USER ERROR');
              next(err);
            })
        }
      })
      .catch(next)
  })
  .get(function (req, res, next) {
    if (!req.redirectUrl.match('[[jwt]]')) return next();
    jwt.sign({userId: req.userData.id, authProvider: req.authConfig.provider}, req.authConfig.jwtSecret, {expiresIn: 182 * 24 * 60 * 60}, (err, token) => {
      if (err) return next(err)
      req.redirectUrl = req.redirectUrl.replace('[[jwt]]', token);
      return next();
    });
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
        idpUser
      });
    }
    return next();
  })
  .get(function (req, res, next) {
    if (!req.query.ipdlogout) {
      // redirect to idp server
      let redirectUri = encodeURIComponent(config.url + '/auth/project/' + req.project.id + '/logout?ipdlogout=done&useAuth=' + req.query.useAuth + '&redirectUri=' + encodeURIComponent(req.query.redirectUri));
      let url = `${req.authConfig.serverUrl}/logout?redirectUrl=${redirectUri}&client_id=${req.authConfig.clientId}`;
      return res.redirect(url);
    }
    return next();
  })
  .get(async function (req, res, next) {
    const projectId = req.params.projectId;
    if(req.query.redirectUri && projectId && await isRedirectAllowed(projectId, req.query.redirectUri)){
      return res.redirect(req.query.redirectUri);
    }else if(req.query.redirectUri){
      return next(createError(403, 'redirectUri not found in allowlist.'));
    }

    return res.json({ logout: 'success' })
  });


// ----------------------------------------------------------------------------------------------------
// unique codes

router
  .route('(/project/:projectId)?/uniquecode')
  .all(async function (req, res, next) {
    if (!hasRole(req.user, 'admin')) return next(new Error('You cannot list these codes'))
    return next();
  })

  // list
  .get(async function (req, res, next) {
    let codes = {};
    try {
      codes = await service.fetchUniqueCode({
        authConfig: req.authConfig,
      });
    } catch(err) {
      console.log(err);
      return next(err)
    }
    res.json(codes)
  })

  // create
  .post(async function (req, res, next) {
    let codes = {};
    try {
      codes = await service.createUniqueCode({
        authConfig: req.authConfig,
        amount: parseInt(req.body.amount) || 1,
      });
    } catch(err) {
      console.log(err);
      return next(err)
    }
    res.json(codes)
  })

router
  .route('(/project/:projectId)?/uniquecode/:uniqueCodeId/reset')

  // reset
  .post(async function (req, res, next) {
    if (!hasRole(req.user, 'admin')) return next(new Error('You cannot list these codes'))

    let uniqueCodeId= parseInt(req.params.uniqueCodeId);
    if (!uniqueCodeId) return next(new Error('No code id found'))

    let codes = {};
    try {
      codes = await service.resetUniqueCode({
        authConfig: req.authConfig,
        uniqueCodeId: uniqueCodeId,
      });
    } catch(err) {
      console.log(err);
      return next(err)
    }
    res.json(codes)
  })

// ----------------------------------------------------------------------------------------------------
// TAF

module.exports = router;
