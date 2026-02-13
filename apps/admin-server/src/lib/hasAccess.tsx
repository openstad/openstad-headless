import { Role } from '@/lib/roles';

import hasRole from './hasRole';

const validRoles: Role[] = [
  'superuser',
  'admin',
  'editor',
  'moderator',
  'member',
  'anonymous',
  'all',
];

function isRole(role: any): role is Role {
  return validRoles.includes(role);
}

export function HasAccess(user?: { role?: string }) {
  if (user?.role && isRole(user.role)) {
    return hasRole({ ...user, role: user.role }, 'admin');
  }
  return false;
}
