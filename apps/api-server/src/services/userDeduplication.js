/**
 * User deduplication service.
 *
 * Collapses multiple project-scoped user rows that represent the same identity
 * (same idp provider+identifier) down to the most recent one. Used when listing
 * users across projects. Extracted from routes/api/user.js (#1640). Pure — no
 * Express `req`, no db.
 */

// Stable identity key for a user: idp provider+identifier when available,
// otherwise the id, otherwise an email/name/createdAt composite.
function getUniqueUserKey(user) {
  const provider = user?.idpUser?.provider;
  const identifier = user?.idpUser?.identifier;
  if (provider && identifier) {
    return `${provider}-*-${identifier}`;
  }
  if (user?.id) return `user-${user.id}`;
  return `user-${user?.email || ''}-${user?.name || ''}-${
    user?.createdAt || ''
  }`;
}

// Numeric recency for a user (updatedAt > lastLogin > createdAt), 0 if none parse.
function getRecencyValue(user) {
  const candidates = [user?.updatedAt, user?.lastLogin, user?.createdAt];
  for (const candidate of candidates) {
    const value = new Date(candidate || '').getTime();
    if (!isNaN(value)) return value;
  }
  return 0;
}

// Keep one user per identity key — the most recent (ties keep the later one).
function dedupeUsersByIdentity(users = []) {
  const map = new Map();

  users.forEach((user) => {
    const key = getUniqueUserKey(user);
    const previous = map.get(key);

    if (!previous) {
      map.set(key, user);
      return;
    }

    const prevRecency = getRecencyValue(previous);
    const currentRecency = getRecencyValue(user);
    if (currentRecency >= prevRecency) {
      map.set(key, user);
    }
  });

  return Array.from(map.values());
}

module.exports = {
  getUniqueUserKey,
  getRecencyValue,
  dedupeUsersByIdentity,
};
