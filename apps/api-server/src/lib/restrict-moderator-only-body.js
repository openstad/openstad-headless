const hasRole = require('./sequelize-authorization/lib/hasRole');

function isModeratorOnly(user) {
  return !!(!hasRole(user, 'editor') && hasRole(user, 'moderator'));
}

function restrictBodyForModeratorOnly(body, user, ownerId) {
  if (!isModeratorOnly(user)) return body;
  if (ownerId && user.id == ownerId) return body;

  return { modBreaks: body && body.modBreaks };
}

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
