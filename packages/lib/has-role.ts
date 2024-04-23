const roles = {
  superuser: ['superuser', 'admin', 'editor', 'moderator', 'member', 'anonymous', 'all'],
  admin: ['admin', 'editor', 'moderator', 'member', 'anonymous', 'all'],
  editor: ['editor', 'moderator', 'member', 'anonymous', 'all'],
  moderator: ['moderator', 'member', 'anonymous', 'all'],
  member: ['member', 'anonymous', 'all'],
  anonymous: ['anonymous', 'all'],
  all: ['all'],   // special
  owner: null, // special
} as const

function hasRole(user:any, minRoles:any, ownerId?:any) {

  minRoles = minRoles || 'admin'; // admin can do anything
  if (!Array.isArray(minRoles)) minRoles = [minRoles];

  let userRole:keyof typeof roles = user && user.role;

  let valid = minRoles.find( (minRole:any) => {
    return roles[userRole] && roles[userRole]?.indexOf(minRole) != -1
  });

  if (minRoles.includes('owner') && ownerId) {
    valid = valid || ( user.id == ownerId );
  }

  return valid;

}

export {
  hasRole as default,
  hasRole,
}
