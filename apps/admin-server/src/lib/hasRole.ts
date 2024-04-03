import { roles, type Role } from './roles';

interface MustHaveRole {
  role: Role,
}

export default function hasRole(user:MustHaveRole, minRoles: Role | Array<Role>) {

  minRoles = minRoles || 'admin'; // admin can do anything
  if (!Array.isArray(minRoles)) minRoles = [minRoles];

  let userRole = user && user.role || 'all';

  let valid = minRoles.find( minRole => {
    return roles[userRole] && roles[userRole].indexOf(minRole) != -1
  });

  return valid;
  
}
