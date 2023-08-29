let roles = {
  admin: ['admin', 'moderator', 'editor', 'member', 'anonymous', 'all'],
  moderator: ['moderator', 'editor', 'member', 'anonymous', 'all'],
  editor: ['editor', 'member', 'anonymous', 'all'],
  member: ['member', 'anonymous', 'all'],
  anonymous: ['anonymous', 'all'],
  all: ['all'],   // special
  owner: null, // special
}

export default function(user = {}, requiredRole) {
  let userRole = user.role;
  if (!Object.keys(roles).includes(userRole)) userRole = 'all';
  return roles[userRole].includes(requiredRole);
}
