const Promise = require('bluebird');
const PasswordResetToken = require('../models').PasswordResetToken;
const appUrl = process.env.APP_URL;
const hat = require('hat');

/**
 *
 */
const getUrl = (user, client, token) => {
  return `${appUrl}/auth/local/reset?token=${token}&clientId=${client.clientId}`;
}

exports.formatResetLink = (client, user) => {
  return new Promise((resolve, reject) =>  {
    const token = hat();

    new PasswordResetToken({
      userId: user.id,
      token: token
    })
    .save()
    .then((resetToken) => {
      const url = getUrl(user, client, resetToken.get('token'));
      resolve(url);
    })
    .catch((err) => {
      reject(err);
    });
  });
}

exports.invalidateTokensForUser = (userId) => {
  console.log('userId', userId);

  return PasswordResetToken
    .where({userId: userId})
    .save(
        {valid: false},
        {method: 'update', patch: true}
     );
}
