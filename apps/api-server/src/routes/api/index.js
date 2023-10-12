const express = require('express');
const bruteForce = require('../../middleware/brute-force');
const dbQuery = require('../../middleware/dbQuery');
const sorting = require('../../middleware/sorting');
const filtering = require('../../middleware/filtering');

const router = express.Router({mergeParams: true});

// brute force
//router.use( bruteForce.globalMiddleware );
//router.post( '*', bruteForce.postMiddleware );

// dbQuery middleware
router.use(dbQuery);
router.use(sorting);
router.use(filtering);

// projects
router.use( '/project', require('./project') );

// comments
router.use( '/project/:projectId(\\d+)(/idea/:ideaId(\\d+))?/comment', require('./comment') );

// ideas
router.use( '/project/:projectId(\\d+)/idea', require('./idea') );
//router.use( '/project/:projectId(\\d+)/idea', require('./idea.old') );

// articles
router.use( '/project/:projectId(\\d+)/article', require('./article') );

// polls
router.use( '/project/:projectId(\\d+)(/idea/:ideaId(\\d+))?/poll', require('./poll') );

// tags
router.use( '/project/:projectId(\\d+)/tag', require('./tag') );

// users
router.use( '/project/:projectId(\\d+)/user', require('./user') );
router.use( '/project/:projectId(\\d+)/user/:userId(\\d+)/activity', require('./user-activity') );

// submissions
router.use( '/project/:projectId(\\d+)/submission', require('./submission') );

// notification
router.use( '/project/:projectId(\\d+)/notification', require('./notification') );

// vote
router.use( '/project/:projectId(\\d+)/vote', require('./vote') );

// newslettersignup
router.use( '/project/:projectId(\\d+)/newslettersignup', require('./newslettersignup') );

// choices-guide
router.use( '/project/:projectId(\\d+)/choicesguide', require('./choicesguide') );

// actions
router.use( '/project/:projectId(\\d+)/action', require('./action') );

//widgets
router.use('/project/:projectId(\\d+)/widgets', require('./widget') );
router.use('/project/:projectId(\\d+)/widgets/:id(\\d+)', require('./widget') );

// locks
router.use( '/lock', require('./lock') );

// To do test and fix log API
//router.use( '/project/:projectId(\\d+)/log', require('./log') );

// openstad-map
router.use( '/project/:projectId(\\d+)/openstad-map', require('./openstad-map') );

// area on project and no project route, system wide the same
router.use( '/project/:projectId(\\d+)/area', require('./area') );
router.use( '/area', require('./area') );

router.use( '/repo', require('./template') ); // backwards conpatibility
router.use( '/template', require('./template') );

module.exports = router;
