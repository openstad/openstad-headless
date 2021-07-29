const Promise = require('bluebird');
const PasswordResetToken = require('../models').PasswordResetToken;
const appUrl = process.env.APP_URL;
const hat = require('hat');

/**
 *
 */
const getUrl = (user, client, token, redirectUrl) => {
  return `${appUrl}/auth/local/reset?token=${token}&clientId=${client.clientId}&redirect_uri=${redirectUrl}`;
}

exports.formatResetLink = (client, user, redirectUrl) => {
  return new Promise((resolve, reject) =>  {
    const token = hat();

    new PasswordResetToken({
      userId: user.id,
      token: token
    })
    .save()
    .then((resetToken) => {
      const url = getUrl(user, client, resetToken.get('token'), redirectUrl);
      resolve(url);
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
      PasswordResetToken
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
