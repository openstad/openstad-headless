/**
 * Project routes — wiring only.
 *
 * Endpoint definitions for projects. All request/response handling lives in
 * controllers/projectController.js; business logic lives in the project*
 * services. See doc/adr-0001-api-server-layering.md.
 */
const express = require('express');
const auth = require('../../middleware/sequelize-authorization-middleware');
const pagination = require('../../middleware/pagination');
const searchInResults = require('../../middleware/search-in-results');
const removeProtocolFromUrl = require('../../middleware/remove-protocol-from-url');
const rateLimiter = require('@openstad-headless/lib/rateLimiter');
const ctrl = require('../../controllers/projectController');

let router = express.Router({ mergeParams: true });

// Endpoint to delete duplicated project and its associated data
router
  .route('/delete-duplicated-data')
  .post(auth.can('Project', 'delete'))
  .post(rateLimiter(), ctrl.deleteDuplicatedData);

// scopes
// ------
router.all('*', ctrl.setScope);

router
  .route('/')

  // list projects
  // ----------
  .get(ctrl.listProjectsAuthGate)
  .get(pagination.init)
  .get(ctrl.rejectIncludeAuthConfigForList)
  .get(ctrl.listProjects)
  .get(searchInResults({ searchfields: ['name', 'title'] }))
  .get(auth.useReqUser)
  .get(pagination.paginateResults)
  .get(ctrl.serializeProjectsList)

  // create project
  // -----------
  .post(auth.can('Project', 'create'))
  .post(removeProtocolFromUrl)
  .post(ctrl.checkUniqueUrl)
  .post(rateLimiter(), ctrl.prepareDuplicationPayload)
  .post(ctrl.createProjectRecord)
  .post(ctrl.syncAuthProvidersAfterCreate)
  .post(ctrl.createDuplicatedData)
  .post(ctrl.addCurrentUserAsAdmin)
  .post(ctrl.publishNewProjectEvent)
  .post(auth.useReqUser)
  .post(ctrl.respondCreatedProject);

// list projects with issues
router
  .route('/issues')
  // -------------------------------
  .get(auth.can('Project', 'list'))
  .get(pagination.init)
  .get(ctrl.initIssuesResults)
  .get(ctrl.addShouldHaveEndedIssues)
  .get(ctrl.addEndedNotAnonymizedIssues)
  .get(ctrl.addBlockedDomainsIssues)
  .get(searchInResults({ searchfields: ['name', 'title'] }))
  .get(auth.useReqUser)
  .get(pagination.paginateResults)
  .get(ctrl.serializeIssuesList);

// one project routes: get project
// -------------------------
router
  .route('/:projectId') //(\\d+)
  .all(auth.can('Project', 'view'))
  .all(ctrl.loadProject)

  // view project
  // ---------
  .get(auth.can('Project', 'view'))
  .get(auth.useReqUser)
  .get(ctrl.viewProject)

  // update project
  // -----------
  .put(auth.useReqUser)
  .put(removeProtocolFromUrl)
  .put(ctrl.checkUniqueUrl)
  .put(rateLimiter(), ctrl.updateAuthClients)
  .put(ctrl.updateProjectRecord)
  .put(ctrl.publishProjectUpdateMessages)
  .put(ctrl.respondUpdatedProject)

  // delete project
  // ---------
  .delete(auth.can('Project', 'delete'))
  .delete(ctrl.deleteProject);

// export a project
// -------------------
router
  .route('/:projectId(\\d+)/export')
  .all(auth.can('Project', 'view'))
  .all(ctrl.loadProjectForExport)
  .get(auth.can('Project', 'view'))
  .get(auth.useReqUser)
  .get(ctrl.viewProject);

// anonymize all users
// -------------------
router
  .route('/:projectId(\\d+)/:willOrDo(will|do)-anonymize-all-users')
  .put(auth.can('Project', 'anonymizeAllUsers'))
  .put(rateLimiter(), ctrl.loadProjectForAnonymize)
  .put(ctrl.anonymizeAllUsers)
  .put(ctrl.attachUserToAnonymizeResults)
  .put(ctrl.respondAnonymizeResults);

router.route('/:projectId(\\d+)/css/:componentId?').get(ctrl.getProjectCss);

router.route('/:projectId(\\d+)/widget-css/:widgetType').get(ctrl.getWidgetCss);

// Certificate retry endpoint
// -------------------------
router
  .route('/:projectId(\\d+)/certificate-retry')
  .post(auth.can('Project', 'update'))
  .post(ctrl.retryCertificate);

// PDF availability check
// ----------------------
router
  .route('/:projectId(\\d+)/pdf/status')
  .get(auth.can('Project', 'update'))
  .get(ctrl.getPdfStatus);

router.route('/:projectId(\\d+)/branding').get(ctrl.getBranding);

module.exports = router;
