const roles = require('./roles');

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
