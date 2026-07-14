/**
 * Resource routes — wiring only.
 *
 * Endpoint definitions for resources. Request/response handling lives in
 * controllers/resourceController.js; business logic lives in the resource*
 * services. See doc/adr-0001-api-server-layering.md.
 */
const express = require('express');
const auth = require('../../middleware/sequelize-authorization-middleware');
const pagination = require('../../middleware/pagination');
const searchInResults = require('../../middleware/search-in-results');
const rateLimiter = require('@openstad-headless/lib/rateLimiter');
const ctrl = require('../../controllers/resourceController');

const router = express.Router({ mergeParams: true });

// scopes: for all requests
router.all('*', ctrl.setResourceScope);

router
  .route('/markers')
  .get(auth.can('Resource', 'list'))
  .get(ctrl.listMarkers)
  .get(auth.useReqUser)
  .get(
    searchInResults({
      searchfields: ['id', 'title', 'summary', 'description', 'createdAt'],
    })
  )
  .get(ctrl.respondResults);

router
  .route('/')

  // list resources
  // ----------
  .get(auth.can('Resource', 'list'))
  .get(pagination.init)
  .get(ctrl.listResources)
  .get(auth.useReqUser)
  .get(
    searchInResults({
      searchfields: [
        'id',
        'title',
        'summary',
        'description',
        'createdAt',
        'yes',
        'no',
      ],
    })
  )
  .get(pagination.paginateResults)
  .get(ctrl.respondResults)

  // create resource
  // -----------
  .post(auth.can('Resource', 'create'))
  .post(ctrl.requireProject)
  .post(ctrl.requireCanAddResources)
  .post(rateLimiter(), ctrl.createResource)
  .post(ctrl.stripStatusesIfCannotMutate)
  .post(ctrl.applyDefaultStatuses)
  .post(ctrl.applyDefaultTags)
  .post(ctrl.refetchCreatedResource)
  // TODO: Add notifications
  .post(auth.useReqUser)
  .post(ctrl.sendCreateNotifications);

// one resource
// --------
router
  .route('/:resourceId(\\d+)')
  .all(ctrl.loadResource)

  // view resource
  // ---------
  .get(auth.can('Resource', 'view'))
  .get(auth.useReqUser)
  .get(ctrl.respondResults)

  // update resource
  // -----------
  .put(auth.useReqUser)
  .put(ctrl.checkResourceEditable)
  .put(ctrl.captureTags)
  .put(ctrl.detectChangedToPublished)
  .put(rateLimiter(), ctrl.updateResource)
  .put(ctrl.updateResourceTags)
  .put(ctrl.stripStatusesIfCannotMutate)
  .put(ctrl.updateResourceStatuses)
  .put(ctrl.sendUpdateNotifications)
  .put(auth.useReqUser)
  .put(ctrl.respondResults)

  // delete resource
  // ---------
  .delete(auth.useReqUser)
  .delete(ctrl.deleteResource);

// Multiple resource routes
// -------------------------

// Delete multiple resources
router
  .route('/delete')
  .delete(auth.useReqUser)
  .delete(rateLimiter(), ctrl.deleteMultipleResources);

// Duplicate multiple resources
router
  .route('/duplicate')
  .post(auth.useReqUser)
  .post(rateLimiter(), ctrl.duplicateResources);

module.exports = router;
