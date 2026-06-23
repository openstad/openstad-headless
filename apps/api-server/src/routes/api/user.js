/**
 * User routes — wiring only.
 *
 * Endpoint definitions for users. Request/response handling lives in
 * controllers/userController.js; business logic lives in the user* services.
 * See doc/adr-0001-api-server-layering.md.
 */
const express = require('express');
const auth = require('../../middleware/sequelize-authorization-middleware');
const pagination = require('../../middleware/pagination');
const searchInResults = require('../../middleware/search-in-results');
const rateLimiter = require('@openstad-headless/lib/rateLimiter');
const ctrl = require('../../controllers/userController');

const router = express.Router({ mergeParams: true });

router.all('*', ctrl.setUserScope);

router.route('/unsubscribe/:userId/:userHash').get(ctrl.unsubscribe);

// /user is only available for admins
router.all('*', ctrl.requireProjectOrAdminGet);

router
  .route('/')
  // list users
  // ----------
  .get(ctrl.applyListableScope)
  .get(pagination.init)
  .get(ctrl.listUsers)
  .get(auth.useReqUser)
  .get(searchInResults({ searchfields: ['name', 'role'] }))
  .get(pagination.paginateResults)
  .get(ctrl.respondResults)

  // create user
  // -----------
  .post(auth.can('User', 'create'))
  .post(ctrl.requireProject)
  .post(ctrl.requireCanCreateUsers)
  .post(ctrl.loadAuthAdapter)
  .post(ctrl.loadReferenceUserFromIdp)
  .post(ctrl.filterBody)
  .post(ctrl.fetchOAuthUserByEmail)
  .post(ctrl.createOAuthUserIfMissing)
  .post(ctrl.ensureUserNotExists)
  .post(auth.useReqUser)
  /**
   * Increased rate limit to 1000 to prevent false positives during future user import/export.
   * Required for CodeQL check
   */
  .post(rateLimiter(), ctrl.createUser)
  .post(ctrl.respondResults);

// get user's two-factor status
// --------------
router.get('/:userId/two-factor-status', ctrl.getTwoFactorStatus);

router.put('/:userId/reset-two-factor', ctrl.resetTwoFactor);

// anonymize user
// --------------
router
  .route('/:userId(\\d+)/:willOrDo(will|do)-anonymize(:all(all)?)')
  .put(ctrl.loadTargetUser)
  .put(ctrl.loadLinkedUsers)
  .put(ctrl.parseOnlyUserIds)
  .put(ctrl.parseOnlyProjectIds)
  .put(ctrl.parseAnonymizeUserName)
  .put(ctrl.anonymizeTargetUser)
  .put(ctrl.anonymizeLinkedUsers)
  .put(ctrl.loadRemainingUsers)
  .put(ctrl.deleteOAuthUserIfNoneRemain)
  .put(ctrl.attachUserToAnonymizeResults)
  .put(ctrl.respondResults);

// one user
// --------
router
  .route('/:userId(\\d+)')
  .all(ctrl.loadUser)

  // view user
  // ---------
  .get(auth.can('User', 'view'))
  .get(auth.useReqUser)
  .get(ctrl.respondResults)

  // update user
  // -----------
  .put(auth.useReqUser)
  .put(ctrl.filterBody)
  .put(ctrl.checkUserUpdatable)
  .put(ctrl.loadAuthAdapter)
  .put(rateLimiter(), ctrl.updateUser)
  .put(ctrl.respondUpdatedUser)

  // delete user
  // -----------
  .delete(auth.useReqUser)
  .delete(ctrl.deleteUser);

module.exports = router;
