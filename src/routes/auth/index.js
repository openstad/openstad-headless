const express = require('express');
const bruteForce = require('../../middleware/brute-force');
const authconfig = require('../../util/auth-config');

let adapters = {};

let router = express.Router({mergeParams: true});

// brute force
router.use( bruteForce.globalMiddleware );
router.post( '*', bruteForce.postMiddleware );

// routes
router.use( '/', require('./me') );

// dynamically use the required adapter
router
  .use(async function (req, res, next) { // auth config
    let useAuth = req.query.useAuth || req.user.provider || ( req.user.idpUser && req.user.idpUser.provider );
    req.authConfig = await authconfig({ site: req.site, useAuth: useAuth })
    return next();
  })
  .use(async function (req, res, next) { // get adapter
    let adapter = req.authConfig.adapter || 'openstad';
    try {
      if (!adapters[adapter]) {
        // TODO: zo schrijf je geen dirname....
        adapters[adapter] = await require(process.env.NODE_PATH + '/' + req.authConfig.modulePath);
      }
    } catch(err) {
      adapters[adapter] = { router: (req, res) => { res.status(400).end('Adapter not found') } }
    }
    return next();
  })
  .use(async function (req, res, next) { // use adapter
    let adapter = req.authConfig.adapter || 'openstad';
    return adapters[adapter].router(req, res, next)
  })

module.exports = router;
