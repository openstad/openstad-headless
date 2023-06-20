const Sequelize = require('sequelize');
const express = require('express');
const createError = require('http-errors');
const fetch = require('node-fetch');
const jwt = require('jsonwebtoken');
const merge = require('merge');
const config = require('config');
const URL = require('url').URL;
const db = require('../../db');
const OAuthApi = require('../../services/oauth-api');

let router = express.Router({mergeParams: true});

// me: translate bearer jwt to user data
// -------------------------------------
router
  .route('(/site/:siteId)?/me')
  .get(function (req, res, next) {
    const data = {
      "id": req.user.id,
      "complete": req.user.complete,
      "idpUser": req.user.role == 'admin' ? req.user.idpUser : null,
      "role": req.user.role,
      "email": req.user.email,
      "firstName": req.user.firstName,
      "lastName": req.user.lastName,
      "fullName": req.user.fullName,
      "nickName": req.user.nickName,
      "displayName": req.user.displayName,
      "initials": req.user.initials,
      "gender": req.user.gender,
      "extraData": req.user.extraData ? req.user.extraData : {},
      "phoneNumber": req.user.phoneNumber,
      "streetName": req.user.streetName,
      "city": req.user.city,
      "houseNumber": req.user.houseNumber,
      "suffix": req.user.suffix,
      "postcode": req.user.postcode,
      "zipCode": req.user.zipCode,
      "signedUpForNewsletter": req.user.signedUpForNewsletter,
      "createdAt": req.user.createdAt,
      "updatedAt": req.user.updatedAt,
      "deletedAt": req.user.deletedAt,
      'votes': req.user.votes
    };
    res.json(data);
  })

// other auth routes are delegated to adapters
// -------------------------------------------

let router1 = express.Router({mergeParams: true});
router1
  .route('(/site/:siteId)?/test')
  .get(function (req, res, next) {
    res.json({test: 0});
  });
router1
  .route('(/site/:siteId)?/test1')
  .get(function (req, res, next) {
    res.json({test: 1});
  });

let router2 = express.Router({mergeParams: true});
router2
  .route('(/site/:siteId)?/test')
  .get(function (req, res, next) {
    res.json({test: 0});
  });
router2
  .route('(/site/:siteId)?/test2')
  .get(function (req, res, next) {
    res.json({test: 2});
  });

router
  .use(async function (req, res, next) {
    console.log('WTF');
    let which = req.query.which;
    if (which == 1) {
      return router1(req, res, next)
    }
    if (which == 2) {
      return router2(req, res, next)
    }
    return res.json({not: 'found'})
    //let adapter = require(req.authConfig.adapter);
    //return await adapter.route(req, res, next);
  });



router
  .route('(/site/:siteId)?/login')
  .get(function (req, res, next) {
    // logout first?
    if (!req.query.forceNewLogin) return next();
    let baseUrl = config.url
    let backToHereUrl = baseUrl + '/oauth/site/' + req.site.id + '/login?' + (req.query.useOauth ? 'useOauth=' + req.query.useOauth : '') + '&redirectUrl=' + encodeURIComponent(req.query.redirectUrl)
    backToHereUrl = encodeURIComponent(backToHereUrl)
    let url = baseUrl + '/oauth/site/' + req.site.id + '/logout?redirectUrl=' + backToHereUrl;
    return res.redirect(url)
  })
  .get(function (req, res, next) {
    // redirect to login server
    let url = req.authConfig.authServerUrl + req.authConfig.authServerLoginPath;
    url = url.replace(/\[\[clientId\]\]/, req.authConfig.authClientId); // todo dezde oet denk ik naar authconfig middleware
    url = url.replace(/\[\[redirectUrl\]\]/, encodeURIComponent(config.url + '/oauth/site/' + req.site.id + '/digest-login?useOauth=' + req.authConfig.useAuth + '\&returnTo=' + req.query.redirectUrl));
    res.redirect(url);
  })

// inloggen 2
// ----------
router
  .route('(/site/:siteId)?/digest-login')
  .get(async function (req, res, next) {
    let provider = require(req.authConfig.provider);
    return await provider.digest(req, res, next)
  });


  .get(function (req, res, next) {

		  const which = req.query.useOauth || 'default';
      let siteConfig = req.site && merge({}, req.site.config, { id: req.site.id });

      let siteOauthConfig = (req.site && req.site.config && req.site.config.oauth && req.site.config.oauth[which]) || {};
      let authServerUrl = siteOauthConfig['auth-internal-server-url'] || config.authorization['auth-server-url'];
      if (authServerUrl == 'https://api.snipper.nlsvgtr.nl') { // snipper app van niels

        fetch(`${authServerUrl}/user`, {
	        headers: { "Authorization": `Bearer ${req.userAccessToken}` },
        })
	        .then((response) => {
		        if (!response.ok) throw Error(response)
		        return response.json();
	        })
	        .then( json => {
            req.userData = json.user;
            req.userData.user_id = json.user.id,
            delete req.userData.id;
            req.userData.firstName = '';
            req.userData.lastName = req.userData.real_name;
            return next();
	        })
	        .catch((err) => {
		        console.log('Niet goed');
		        next(err);
	        });


      } else {
        
        OAuthApi
          .fetchUser({ siteConfig, which, token: req.userAccessToken })
          .then(json => {
            req.userData = json;
            return next();
          })
          .catch(err => {
            //console.log('OAUTH DIGEST - GET USER ERROR');
            //console.log(err);
            next(err);
          })

      }

    })
  .get(function (req, res, next) {
    
        let data = {
            idpUser: {
              identifier: req.userData.user_id,
              accesstoken: req.userAccessToken,
            },
            email: req.userData.email || null,
            firstName: req.userData.firstName,
            siteId: req.site.id,
            extraData: req.userData.extraData,
            zipCode: req.userData.postcode ? req.userData.postcode : null,
            postcode: req.userData.postcode ? req.userData.postcode : null,
            lastName: req.userData.lastName,
            role: req.userData.role || ((req.userData.email || req.userData.phoneNumber || req.userData.hashedPhoneNumber) ? 'member' : 'anonymous'),
            lastLogin: new Date(),
            isNotifiedAboutAnonymization: null,
        }

        // if user has same siteId and userId
        // rows are duplicate for a user
        let where = {
            where: Sequelize.and(
                {idpUser: { identifier: req.userData.user_id }},
                {siteId: req.site.id},
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
                    // TODO: dit zou al op de oauth server afgevangen moeten worden, ik denk met een 'only existing' oid.
                    if (!req.site.config.users.canCreateNewUsers) return next(createError('403', 'Users mogen niet aangemaakt worden op deze site'));
                  
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
        let which = req.query.useOauth || 'default';
        let siteOauthConfig = (req.site && req.site.config && req.site.config.oauth && req.site.config.oauth[which]) || {};

        let authServerUrl = siteOauthConfig['auth-server-url'] || config.authorization['auth-server-url'];

        let returnTo = req.query.returnTo;
        let redirectUrl = returnTo ? returnTo + (returnTo.includes('?') ? '&' : '?') + 'jwt=[[jwt]]' : false;
        redirectUrl = redirectUrl || (req.query.returnTo ? req.query.returnTo + (req.query.returnTo.includes('?') ? '&' : '?') + 'jwt=[[jwt]]' : false);
        redirectUrl = redirectUrl || (req.site && req.site.config && req.site.config.cms['after-login-redirect-uri']) || siteOauthConfig['after-login-redirect-uri'] || config.authorization['after-login-redirect-uri'];
        redirectUrl = redirectUrl || '/';

        //check if redirect domain is allowed
        if (isAllowedRedirectDomain(redirectUrl, req.site && req.site.config && req.site.config.allowedDomains)) {
            if (redirectUrl.match('[[jwt]]')) {
                jwt.sign({userId: req.userData.id, authProvider: which, client: which}, config.auth['jwtSecret'], {expiresIn: 182 * 24 * 60 * 60}, (err, token) => {
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

// uitloggen
// ---------
router
    .route('(/site/:siteId)?/logout')
    .get(function (req, res, next) {

        if (req.user && req.user.id > 1) {
            let idpUser = req.user.idpUser;
            delete idpUser.accesstoken;
            req.user.update({
                idpUser
            });
        }

        let which = req.query.useOauth || 'default';
        let siteOauthConfig = (req.site && req.site.config && req.site.config.oauth && req.site.config.oauth[which]) || {};

        let authServerUrl = siteOauthConfig['auth-server-url'] || config.authorization['auth-server-url'];
        let authServerGetUserPath = siteOauthConfig['auth-server-logout-path'] || config.authorization['auth-server-logout-path'];
        let authClientId = siteOauthConfig['auth-client-id'] || config.authorization['auth-client-id'];
        let url = authServerUrl + authServerGetUserPath;

        url = url.replace(/\[\[clientId\]\]/, authClientId);

        if (req.query.redirectUrl) {
            url = `${url}&redirectUrl=${encodeURIComponent(req.query.redirectUrl)}`;
        }

        res.redirect(url);
    });



// find or create oidc user
// dit moet dus naar plugins
// -------------------------
router
    .route('(/site/:siteId)?/oidc-user')
    .post(async function (req, res, next) {

      try {
        let url = `${req.body.iss}/oidc/me`;
        let access_token = req.body.access_token;
        let response = await fetch(url, {
          headers: { "Authorization": `Bearer ${access_token}` },
          method: 'GET'
        });
        if (!response.ok) {
          console.log(response);
          throw new Error('Fetch user failed')
        }
        let oidcUser = await response.json();

        if (!oidcUser) throw Error('Not found on oidc');

        let openStadUser = await db.User
            .findOne({
              where: {
                [Sequelize.Op.and]: [
                  { siteId: req.params.siteId },
                  {
                    extraData: {
                      oidc: {
                        sub: oidcUser.sub,
                      }
                    }
                  }
                ]
              }
            })

        console.log('FOUND: ', openStadUser && openStadUser.id);

        let random = 100 + parseInt(900 * Math.random())
        openStadUser = await db.User
          .upsert({
            id: openStadUser && openStadUser.id,
            siteId: req.params.siteId,
            email: oidcUser.email || ( openStadUser && openStadUser.email ) || `nieuweuser${random}@oidc.nl`,
            extraData: {
              oidc: {
                sub: oidcUser.sub,
                iss: req.body.iss,
                access_token: req.body.access_token,
              },
            },
            lastLogin: new Date(),
          })

        if ( Array.isArray(openStadUser) ) openStadUser = openStadUser[0];

        // Todo: iss moet gecontroleerd
        jwt.sign({userId: openStadUser.id, authProvider: 'oidc', iss: req.body.iss}, config.auth['jwtSecret'], {expiresIn: 182 * 24 * 60 * 60}, (err, token) => {
          if (err) return next(err)
          return res.json({
            jwt: token
          })
        });

      } catch(err) {
        console.log(err);
        next(err);
      }

    });

module.exports = router;
