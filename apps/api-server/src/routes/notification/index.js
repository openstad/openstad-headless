const express = require('express');
const router = express.Router({ mergeParams: true });
const siteTemplate = require('./site-template');

// notification templates
router.use('/project/:projectId(\\d+)/template', require('./template'));

// global notification templates, inherited by every project without its own row
router.use('/global/template', siteTemplate.router);

// read-only view of those globals from a project page, so an editor can see and restore
// what the project inherits
router.use(
  '/project/:projectId(\\d+)/global-template',
  siteTemplate.readOnlyRouter
);

// notification
router.use('/project/:projectId(\\d+)/notification', require('./notification'));

module.exports = router;
