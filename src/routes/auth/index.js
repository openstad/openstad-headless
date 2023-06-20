const express = require('express');
const bruteForce = require('../../middleware/brute-force');

let router = express.Router({mergeParams: true});
let authconfig = require('../../middleware/auth-config');

// brute force
router.use( bruteForce.globalMiddleware );
router.post( '*', bruteForce.postMiddleware );

// routes
router.use( '/', require('./me') );

// dynamically use the required adapter

let adapters = { // todo: fill through config
  openstad: require('../../adapter/openstad'),
  //    oidc: require('../../adapter/oidc'),
};

router
  .use(authconfig)
  .use(async function (req, res, next) {
    let adapter = req.authConfig.adapter || 'openstad';
    return adapters[adapter].router(req, res, next)
  });

module.exports = router;
