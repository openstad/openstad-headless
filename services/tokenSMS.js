const Promise = require('bluebird');
const LoginToken = require('../models').LoginToken;
const generateSMSToken = require('../utils/generateSMSToken');

exports.format = (client, user, redirectUrl) => {
  return new Promise((resolve, reject) =>  {

    const token = generateSMSToken();

    new LoginToken({
      userId: user.id,
      token: token
    })
    .save()
    .then((loginToken) => {
      resolve(token);
    })
    .catch((err) => {
      reject(err);
    });
  });
}

exports.invalidateTokensForUser = (userId) => {
  return new Promise((resolve, reject) => {
    if (!userId) {
      resolve();
    } else {
      LoginToken
      .where({userId: userId})
      .save(
          {valid: false},
          {method: 'update', patch: true}
       )
       .then(() => { resolve(); })
       .catch(() => { resolve(); })
     }
  });

}
