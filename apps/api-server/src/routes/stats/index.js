const express = require('express');
const bruteForce = require('../../middleware/brute-force');

let router = express.Router({mergeParams: true});

// brute force
router.use( bruteForce.globalMiddleware );
router.post( '*', bruteForce.postMiddleware );

// vote
router.use( '/project/:projectId(\\d+)/vote', require('./vote') );

// resource
router.use( '/project/:projectId(\\d+)/resource', require('./resource') );

// comment
router.use( '/project/:projectId(\\d+)/comment', require('./comment') );

// choicesguide
router.use( '/project/:projectId(\\d+)/choicesguides', require('./choicesguide') );

// get overview of stats
router.use( '/project/:projectId(\\d+)/overview', require('./overview') );


module.exports = router;


