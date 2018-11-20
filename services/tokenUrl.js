const Promise = require('bluebird');
const LoginTo ken = require('../models').LoginToken;
const appUrl = proccess.env.APP_URL;

/**
 *
 */
exports.format = (clientId, user) => {
  return new Promise((resolve, reject) =>  {
    new LoginToken({
      userId: user.get('id'),
      token: token
    })
    .save()
    .then((loginToken) => {
      const base = user.get('firstName').length === 0 && user.get('lastName').length ? 
      const url = `${appUrl}/login-with-token?=${loginToken.get('token')}&client_id=${clientId}`;
      resolve(url);
    })
    .catch((err) => {
      reject(err);
    });
  });

}

exports.getUserIdForToken(token) => {

}
