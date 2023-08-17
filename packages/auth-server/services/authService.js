const db = require('../db');
const userRepository = require('../repositories/userRepository');
const privilegedRoles =  require('../config/roles').privilegedRoles;

exports.validatePrivilegeUser = async (email, clientId) => {
  // Get user for specific client and assigned to one of the privilegedRoles
  const user = await userRepository.getUserByClientAndRoles(email, clientId, privilegedRoles);

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

  return db.ActionLog.create(values);
};
