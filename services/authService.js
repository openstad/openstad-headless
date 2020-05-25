const User = require('../models/index').User;
const ActionLog = require('../models/index').ActionLog;
const allowedRoles =  require('../config/roles').privilegedRoles;

exports.validateUser = async (email) => {
  // move this to config
  const user = await new User({ email }).fetch({ withRelated: ['roles'] });

  if(!user) {
    throw new Error('User not found');
  }

  const userIsAllowed = user.related('roles').some(role => allowedRoles.indexOf(role.get('name')) > -1);

  if(!userIsAllowed) {
    throw new Error('User does not have the allowed roles');
  }

  return user.serialize();
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
