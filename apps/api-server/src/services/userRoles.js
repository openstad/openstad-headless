/**
 * User role predicates.
 *
 * Pure role-classification logic backing the User model's prototype methods
 * (which stay as thin wrappers so call sites are unchanged). Extracted from
 * models/User.js (#1640). No ORM, no `this`.
 */

function isUnknown(role) {
  return role === 'unknown';
}

function isAnonymous(role) {
  return role === 'anonymous';
}

function isMember(role) {
  return role !== 'unknown' && role !== 'anonymous';
}

function isAdmin(role) {
  return role === 'admin' || role === 'su';
}

module.exports = {
  isUnknown,
  isAnonymous,
  isMember,
  isAdmin,
};
