const config = require('config');
const express = require('express');
const createError = require('http-errors');
const fetch = require('node-fetch');
const jwt = require('jsonwebtoken');
const Sequelize = require('sequelize');
const db = require('../../db');
const service = require('./service');

let router = express.Router({mergeParams: true});

// Todo: dit is 'openstad', dus serverLogin/outPath en zo modgen hier hardcoded in gezet en uit de config gehaald

// ----------------------------------------------------------------------------------------------------
// login

router
  .route('(/project/:projectId)?/login')
  .get(function (req, res, next) {

    // logout first?
    if (!req.query.forceNewLogin) return next();
    let baseUrl = config.url
    let backToHereUrl = baseUrl + '/auth/project/' + req.project.id + '/login?useAuth=' + req.authConfig.provider + '&redirectUri=' + encodeURIComponent(req.query.redirectUri)
    backToHereUrl = encodeURIComponent(backToHereUrl)
    let url = baseUrl + '/auth/project/' + req.project.id + '/logout?redirectUri=' + backToHereUrl;
    return res.redirect(url)

  })
  .get(function (req, res, next) {

    // redirect to login server
    let redirectUri = encodeURIComponent(config.url + '/auth/project/' + req.project.id + '/digest-login?useAuth=' + req.authConfig.provider + '\&returnTo=' + req.query.redirectUri);
    let url = `${req.authConfig.serverUrl}/dialog/authorize?redirect_uri=${redirectUri}&response_type=code&client_id=${req.authConfig.clientId}&scope=offline&forceLogin=1`;
    res.redirect(url);

  })

// ----------------------------------------------------------------------------------------------------
// digest

router
  .route('(/project/:projectId)?/digest-login')
  .get(function (req, res, next) {
    
    // get accesstoken for code
    let code = req.query.code;
    if (!code) throw createError(403, 'Je bent niet ingelogd');

    let url = `${req.authConfig.serverUrl}/oauth/token`;
    let data = {
      client_id: req.authConfig.clientId,
      client_secret: req.authConfig.clientSecret,
      code: code,
      grant_type: 'authorization_code'
    }

    fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data)
    })
	    .then((response) => {
		    if (!response.ok) throw Error(response)
		    return response.json();
	    })
	    .then( json => {

        let accessToken = json.access_token;
        if (!accessToken) return next(createError(403, 'Inloggen niet gelukt: geen accessToken'));

        req.userAccessToken = accessToken;
        return next();

	    })
	    .catch((err) => {
		    console.log(err);
        throw createError(401, 'Login niet gelukt');
	    });

  })
  .get(async function (req, res, next) {

    try {

      // get userdata from auth server
      req.userData = await service.fetchUserData({
        authConfig: req.authConfig,
        accessToken: req.userAccessToken,
      })

    } catch(err) {
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
              console.log('update e', e)
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
              console.log('create e', err);
              next(err);
            })
        }
      })
      .catch(next)
  })
  .get(function (req, res, next) {

    let returnTo = req.query.returnTo;
    returnTo = returnTo || '/?jwt=[[jwt]]';
    let redirectUrl = returnTo ? returnTo + (returnTo.includes('?') ? '&' : '?') + 'jwt=[[jwt]]' : false;
    redirectUrl = redirectUrl || (req.query.returnTo ? req.query.returnTo + (req.query.returnTo.includes('?') ? '&' : '?') + 'jwt=[[jwt]]' : false);
    redirectUrl = redirectUrl || '/';

    // todo: deze afvanging moet veel eerder!!!
    const isAllowedRedirectDomain = (url, allowedDomains) => {

      console.log('----------', url, allowedDomains);
      
      let redirectUrlHost = '';
      try {
        redirectUrlHost = new URL(url).hostname;
      } catch (err) {
      }

      // throw error if allowedDomains is empty or the redirectURI's host is not present in the allowed domains
      return allowedDomains && allowedDomains.indexOf(redirectUrlHost) !== -1;
    }

    //check if redirect domain is allowed
    if (isAllowedRedirectDomain(redirectUrl, req.project && req.project.config && req.project.config.allowedDomains)) {
      if (redirectUrl.match('[[jwt]]')) {
        jwt.sign({userId: req.userData.id, authProvider: req.authConfig.provider}, req.authConfig.jwtSecret, {expiresIn: 182 * 24 * 60 * 60}, (err, token) => {
          if (err) return next(err)
          req.redirectUrl = redirectUrl.replace('[[jwt]]', token);
          return next();
        });
      } else {
        req.redirectUrl = redirectUrl;
        return next();
      }
    } else {
      res.status(500).json({
        status: 'Redirect domain not allowed'
      });
    }

  })
  .get(function (req, res, next) {
    res.redirect(req.redirectUrl);
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
        idpUser
      });
    }
    return next();

  })
  .get(function (req, res, next) {

    // todo: isallowed
    if (req.query.redirectUri) return res.redirect(req.query.redirectUri);

    return res.end('Uitgelogd')

  });

// ----------------------------------------------------------------------------------------------------
// TAF

module.exports = router;
