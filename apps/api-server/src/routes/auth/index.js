const express = require('express');
const bruteForce = require('../../middleware/brute-force');
const authSettings = require('../../util/auth-settings');

let adapters = {};

let router = express.Router({mergeParams: true});

// brute force
router.use( bruteForce.globalMiddleware );
router.post( '*', bruteForce.postMiddleware );

// routes
router.use( '/', require('./me') );

router.use('/project/:projectId/choose-provider', require('./choose-provider') );

// dynamically use the required adapter
router
  .use(async function (req, res, next) {
    let useAuthProvider = req.cookies['useAuthProvider'];
    
    console.log ('adapter middleware for auth', req.project?.config?.authProviders, useAuthProvider);
    
    if (req.project && req.project.config && req.project.config.authProviders && Array.isArray(req.project.config.authProviders) && req.project.config.authProviders.length > 1) {
      if (!useAuthProvider) {
          // allow the user to choose an auth provider
          console.log ('/auth route useAuthProvider not set, redirecting to /auth/providers');
          const currentUrl = req.originalUrl;
          return res.redirect('/auth/project/' + req.project.id + '/choose-provider?returnTo=' + encodeURIComponent(currentUrl));
        }
    }
    return next();
  })
  .use(async function (req, res, next) { // auth config
    let useAuth = req.query.useAuth || req.user.provider || ( req.user.idpUser && req.user.idpUser.provider );
    console.log ('/auth/me route useAuth', useAuth);
    req.authConfig = await authSettings.config({ project: req.project, useAuth: useAuth, req })
    console.log ('/auth/me route authConfig', req.authConfig, req.project);
    return next();
  })
  .use(async function (req, res, next) { // get adapter
    try {
      let adapter = req.authConfig.adapter || 'openstad';
      console.log ('/auth/me route adapter', adapter);
      if (!adapters[adapter]) {
        // TODO: zo schrijf je geen dirname....
        adapters[adapter] = await authSettings.adapter({ authConfig: req.authConfig })
      }
      
      console.log ('/auth/me route adapters', adapters.length);
      return next();
    } catch(err) {
      return next(err);
    }
  })
  .use(async function (req, res, next) { // use adapter
    let adapter = req.authConfig.adapter || 'openstad';
    console.log ('/auth/me route use adapter', adapters[adapter] ?? 'adapter not found');
    return adapters[adapter].router(req, res, next)
  })

module.exports = router;
