const hasRole = require('./sequelize-authorization/lib/hasRole');

function isModeratorOnly(user) {
  return !!(!hasRole(user, 'editor') && hasRole(user, 'moderator'));
}

// A moderator (below editor in the role hierarchy) may only manage a
// resource's modBreaks -- never its other content, tags, or statuses, even
// though Resource.auth.updateableBy grants them general canEdit. Their own
// resource is the exception: there they edit as the owner, like any member.
// Everyone else is handled by the per-field auth further down the route.
function restrictBodyForModeratorOnly(body, user, ownerId) {
  if (!isModeratorOnly(user)) return body;
  if (ownerId && user.id == ownerId) return body;

  return { modBreaks: body && body.modBreaks };
}

// Must run before any later PUT middleware reads req.body directly
// (tags/publishDate/statuses are read from req.body, not from the
// authorizeData-scoped `data` object).
function restrictModeratorOnlyBody(req, res, next) {
  req.body = restrictBodyForModeratorOnly(
    req.body,
    req.user,
    req.results && req.results.userId
  );
  next();
}

module.exports = {
  isModeratorOnly,
  restrictBodyForModeratorOnly,
  restrictModeratorOnlyBody,
};
