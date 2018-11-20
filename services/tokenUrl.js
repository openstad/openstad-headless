const Promise = require('bluebird');
const LoginToken = require('../models').LoginToken;

/**
 *
 */
exports.format = (clientId, userId) => {
  return new Promise((resolve, reject) =>  {
    new LoginToken({
      userId: userId
      token: token
    })
    .save()
    .then((token) => {
      const url = token
      resolve(err);
    })
    .catch((err) => {
      resolve(err);
    });
  });

}

exports.getUserIdForToken(token) => {

}
