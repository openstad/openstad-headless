const hasRole = require('./sequelize-authorization/lib/hasRole');
const { isModeratorOnly } = require('./restrict-moderator-only-body');

function canBypassEditLock(user, changedFields) {
  if (hasRole(user, 'editor')) return true;
  if (!isModeratorOnly(user)) return false;

  return (
    Array.isArray(changedFields) &&
    changedFields.length > 0 &&
    changedFields.every((field) => field === 'modBreaks')
  );
}

module.exports = canBypassEditLock;
