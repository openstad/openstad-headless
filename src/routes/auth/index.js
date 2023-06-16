// TODO: deze doet nog niets

const express = require('express');
const bruteForce = require('../../middleware/brute-force');

let router = express.Router({mergeParams: true});

// brute force
router.use( bruteForce.globalMiddleware );
router.post( '*', bruteForce.postMiddleware );

// routes
router.use( '/', require('./login') );
router.use( '/', require('./logout') );
router.use( '/', require('./user') );

module.exports = router;
