import { roles } from './roles';

interface user {
  [key:string]: string | number,
}

export default function hasRole(user: user, minRoles: string | Array<string>) {

  minRoles = minRoles || 'admin'; // admin can do anything
  if (!Array.isArray(minRoles)) minRoles = [minRoles];

  let userRole = user && user.role;

  let valid = minRoles.find( minRole => {
    return roles[userRole] && roles[userRole].indexOf(minRole) != -1
  });

  return valid;
  
}
