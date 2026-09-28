'use strict';

const createError = require('http-errors');
const db = require('../db');
const hasRole = require('../lib/sequelize-authorization/lib/hasRole');

/**
 * data-scope-admin-gate — admin-only gate for project.config.dataScope
 * (mounted in the project PUT chain, routes/api/project.js, before the actual
 * project update).
 *
 * config.dataScope controls which fields the reporting API may expose per
 * component (packages/lib/report-data-scope.js personalFields opt-in), so
 * only an admin may change it. Any other role gets 403 if the incoming value
 * differs from what is currently saved; resubmitting the saved value
 * unchanged (as the admin UI does when it PUTs the full config) — or omitting
 * config.dataScope entirely — stays allowed for any role.
 */

// Minimal structural deep-equal for plain JSON-like values (objects, arrays,
// primitives).
function deepEqual(a, b) {
  if (a === b) return true;
  if (
    typeof a !== 'object' ||
    typeof b !== 'object' ||
    a === null ||
    b === null
  )
    return false;

  if (Array.isArray(a) || Array.isArray(b)) {
    if (!Array.isArray(a) || !Array.isArray(b)) return false;
    if (a.length !== b.length) return false;
    return a.every((item, i) => deepEqual(item, b[i]));
  }

  const aKeys = Object.keys(a);
  const bKeys = Object.keys(b);
  if (aKeys.length !== bKeys.length) return false;
  return aKeys.every((key) => deepEqual(a[key], b[key]));
}

/**
 * Pure decision, no I/O: does this request need to be blocked?
 * @returns {boolean} true when the actor is not an admin AND the incoming
 *   dataScope differs from what is currently saved.
 */
function requiresAdmin({ incomingDataScope, savedDataScope, user }) {
  if (incomingDataScope === undefined) return false;
  if (hasRole(user, 'admin')) return false;
  return !deepEqual(incomingDataScope, savedDataScope);
}

async function dataScopeAdminGate(req, res, next) {
  const incomingDataScope = req.body?.config?.dataScope;
  if (incomingDataScope === undefined) return next();
  if (hasRole(req.user, 'admin')) return next();

  // Express 4 does not catch a rejected promise from an async middleware, so an
  // unwrapped await here would surface as an unhandled rejection and leave the
  // request hanging instead of reaching the app-wide error handler.
  let savedDataScope;
  try {
    const project = await db.Project.findOne({ where: { id: req.results.id } });
    savedDataScope = project?.config?.dataScope;
  } catch (err) {
    return next(err);
  }

  if (!requiresAdmin({ incomingDataScope, savedDataScope, user: req.user })) {
    return next();
  }

  // next(createError(...)) — not res.json — so the response matches this
  // route's error convention (the app-wide error handler builds
  // {status, friendlyStatus, message, errorStack} from it); admin-server's
  // updateProject() reads `data.message` to show the actual reason.
  return next(
    createError(
      403,
      'Only admins may change the reporting data scope configuration'
    )
  );
}

module.exports = dataScopeAdminGate;
module.exports.deepEqual = deepEqual;
module.exports.requiresAdmin = requiresAdmin;
