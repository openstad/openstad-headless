/**
 * Resource serialization service.
 *
 * Pure presentation/business logic used by Resource's sequelize-authorization
 * `toAuthorizedJSON` hook (which stays in the model). Extracted from
 * models/Resource.js (#1640). No ORM, no `this`.
 */

// Strip user e-mail addresses from comments (and their replies).
function hideEmailsForNormalUsers(comments) {
  return comments.map((comment) => {
    delete comment.user.email;

    if (comment.replies) {
      comment.replies = comment.replies.map((reply) => {
        delete reply.user.email;

        return reply;
      });
    }

    return comment;
  });
}

// Remove moderator-only extra-data keys from `data` in place for users that may
// not view them. `data.extraData` is mutated and `data` is returned.
//
// - With a resourceform config: keep only known form keys + always-public keys.
// - Without one: keep only always-public keys.
// In both cases moderator-only keys (that are not always-public) are removed.
function filterModeratorOnlyExtraData(
  data,
  {
    userRole,
    canViewModerator,
    hasResourceFormConfig,
    resourceFormFieldKeys = [],
    moderatorOnlyExtraDataKeys = [],
    alwaysPublicExtraDataKeys = [],
  }
) {
  if (
    userRole &&
    userRole !== 'all' &&
    !canViewModerator &&
    data.extraData &&
    typeof data.extraData === 'object'
  ) {
    if (hasResourceFormConfig) {
      Object.keys(data.extraData).forEach((key) => {
        if (
          !resourceFormFieldKeys.includes(key) &&
          !alwaysPublicExtraDataKeys.includes(key)
        ) {
          delete data.extraData[key];
        }
      });
    } else {
      const preserved = {};
      alwaysPublicExtraDataKeys.forEach((key) => {
        if (data.extraData[key] !== undefined)
          preserved[key] = data.extraData[key];
      });
      data.extraData = preserved;
    }

    moderatorOnlyExtraDataKeys.forEach((key) => {
      if (!alwaysPublicExtraDataKeys.includes(key)) {
        delete data.extraData[key];
      }
    });
  }

  return data;
}

module.exports = {
  hideEmailsForNormalUsers,
  filterModeratorOnlyExtraData,
};
