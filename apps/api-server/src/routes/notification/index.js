const express = require('express');
const router = express.Router({mergeParams: true});

// notification templates
router.use( '/project/:projectId(\\d+)/template', require('./template') );

// notification
router.use( '/project/:projectId(\\d+)/notification', require('./notification') );

module.exports = router;
