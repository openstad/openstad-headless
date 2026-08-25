// Returns a copy of the scope array without the onlyVisible scope.
// onlyVisible filters resources to what a user may see, which is right for
// reads but wrong right after a create: a pending resource (publishDate null)
// gets filtered out and findByPk returns null. Dropping it lets the creator
// get their own resource back.
function stripVisibilityScope(scope) {
  if (!Array.isArray(scope)) return scope;
  return scope.filter(
    (entry) =>
      !(
        entry &&
        typeof entry === 'object' &&
        Array.isArray(entry.method) &&
        entry.method[0] === 'onlyVisible'
      )
  );
}

module.exports = { stripVisibilityScope };
