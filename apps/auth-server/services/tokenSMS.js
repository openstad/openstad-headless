const Promise = require('bluebird');
const db = require('../db');
const generateSMSToken = require('../utils/generateSMSToken');

exports.format = (client, user, redirectUrl) => {
  return new Promise((resolve, reject) =>  {

    const token = generateSMSToken();

    db.LoginToken
    .create({
      userId: user.id,
      token: token,
      valid: true
    })
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
      return db.LoginToken
        .update({valid: false}, { where: {userId: userId} })
        .then(() => { resolve(); })
        .catch(() => { resolve(); })
     }
  });

}
