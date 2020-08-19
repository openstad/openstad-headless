const User = require('../models/index').User;

exports.getUserByClientAndRoles = (email, clientId, roles) => User
  .query()
  .select('users.*')
  .join('user_roles', 'user_roles.userId', 'users.id')
  .join('roles', 'roles.id', 'user_roles.roleId')
  .where('users.email', '=', email)
  .where('user_roles.clientId', '=', clientId)
  .whereIn('roles.name', roles)
  .first();
