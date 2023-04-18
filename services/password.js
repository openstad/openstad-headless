const Promise = require('bluebird');
const db = require('../db');
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

    db.PasswordResetToken
    .create({
      userId: user.id,
      token: token
    })
    .then((resetToken) => {
      const url = getUrl(user, client, resetToken.token, redirectUrl);
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
      db.PasswordResetToken
        .finndOne({ where: {userId: userId} })
        .update({valid: false})
        .then(() => { resolve(); })
        .catch(() => { resolve(); })
    }
  });
}
