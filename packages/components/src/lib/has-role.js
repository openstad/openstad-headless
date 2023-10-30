const roles = {
  admin: ['admin', 'editor', 'moderator', 'member', 'anonymous', 'all'],
  editor: ['editor', 'moderator', 'member', 'anonymous', 'all'],
  moderator: ['moderator', 'member', 'anonymous', 'all'],
  member: ['member', 'anonymous', 'all'],
  anonymous: ['anonymous', 'all'],
  all: ['all'],   // special
  owner: null, // special
}

module.exports = function hasRole(user, minRoles, ownerId) {

  minRoles = minRoles || 'admin'; // admin can do anything
  if (!Array.isArray(minRoles)) minRoles = [minRoles];

  let userRole = user && user.role;

  let valid = minRoles.find( minRole => {
    return roles[userRole] && roles[userRole].indexOf(minRole) != -1
  });

  if (minRoles.includes('owner') && ownerId) {
    valid = valid || ( user.id == ownerId );
  }

  return valid;
  
}
