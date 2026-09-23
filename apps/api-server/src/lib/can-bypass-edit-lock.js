const hasRole = require('./sequelize-authorization/lib/hasRole');
const { isModeratorOnly } = require('./restrict-moderator-only-body');

// The "no edits after the first vote or comment" lock. Editors are exempt; a
// moderator only when the save touches nothing but modBreaks. On destroy
// `changedFields` is false, so a moderator never bypasses it for a delete.
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
