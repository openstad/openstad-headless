const User = require('../models/index').User;
const ActionLog = require('../models/index').ActionLog;
const privilegedRoles =  require('../config/roles').privilegedRoles;

exports.validateUser = async (email, clientId) => {

  // Get user for specific client and assigned to one of the privilegedRoles
  const user = await User
    .query()
    .join('user_roles', 'user_roles.userId', 'users.id')
    .join('roles', 'roles.id', 'user_roles.roleId')
    .where('users.email', '=', email)
    .where('user_roles.clientId', '=', clientId)
    .whereIn('roles.name', privilegedRoles)
    .first();

  if(!user) {
    throw new Error('User not found or user does not have the allowed roles');
  }

  return user;
};

exports.logSuccessFullLogin = (req) => {
  const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;

  const values = {
    method: 'post',
    name: 'Url',
    value: 'login',
    clientId: req.client.id,
    userId: req.user.id,
    ip: ip
  };

  return new ActionLog(values).save();
};
