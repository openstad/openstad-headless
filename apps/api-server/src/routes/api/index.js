const express = require('express');
const bruteForce = require('../../middleware/brute-force');
const dbQuery = require('../../middleware/dbQuery');
const sorting = require('../../middleware/sorting');

const router = express.Router({mergeParams: true});

// brute force
//router.use( bruteForce.globalMiddleware );
//router.post( '*', bruteForce.postMiddleware );

// dbQuery middleware
router.use(dbQuery);
router.use(sorting);

// projects
router.use( '/project', require('./project') );

// comments
router.use( '/project/:projectId(\\d+)(/resource/:resourceId(\\d+))?/comment', require('./comment') );

// resources
router.use( '/project/:projectId(\\d+)/resource', require('./resource') );
//router.use( '/project/:projectId(\\d+)/resource', require('./resource.old') );

// polls
router.use( '/project/:projectId(\\d+)(/resource/:resourceId(\\d+))?/poll', require('./poll') );

// tags
router.use( '/project/:projectId(\\d+)/tag', require('./tag') );

// statuses
router.use( '/project/:projectId(\\d+)/status', require('./status') );

// users
router.use( '/project/:projectId(\\d+)/user', require('./user') );
router.use( '/project/:projectId(\\d+)/user/:userId(\\d+)/activity', require('./user-activity') );
router.use( '/user', require('./user') );

// submissions
router.use( '/project/:projectId(\\d+)/submission', require('./submission') );

// vote
router.use( '/project/:projectId(\\d+)/vote', require('./vote') );

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

router.use( '/image', require('./image-verification-link') );

router.use( '/document', require('./document-verification-link') );

// area on project and no project route, system wide the same
router.use( '/project/:projectId(\\d+)/area', require('./area') );
router.use( '/area', require('./area') );

router.use( '/project/:projectId(\\d+)/datalayer', require('./datalayer') );
router.use( '/datalayer', require('./datalayer') );

router.use( '/repo', require('./template') ); // backwards compatibility
router.use( '/template', require('./template') );

module.exports = router;
