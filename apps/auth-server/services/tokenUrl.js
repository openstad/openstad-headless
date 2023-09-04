const Promise = require('bluebird');
const db = require('../db');
const appUrl = process.env.APP_URL;
const hat = require('hat');

/**
 *
 */
const getUrl = (user, client, token, redirectUrl) => {
  const slug = 'auth/url/authenticate';
  return `${appUrl}/${slug}?token=${token}&clientId=${client.clientId}&redirect_uri=${redirectUrl}`;
}

const getAdminUrl = (user, client, token, redirectUrl) => {
  const slug = 'auth/admin/authenticate';
  return `${appUrl}/${slug}?token=${token}&clientId=${client.clientId}&redirect_uri=${redirectUrl}`;
}

exports.format = (client, user, redirectUrl, admin) => {
  return new Promise((resolve, reject) =>  {
    const token = hat();

    db.LoginToken
    .create({
      userId: user.id,
      token: token,
      valid: true,
    })
    .then((loginToken) => {
      const url = admin ? getAdminUrl(user, client, token, redirectUrl) : getUrl(user, client, token, redirectUrl);
      resolve(url);
    })
    .catch((err) => {
      reject(err);
    });
  });
}

exports.getUrl = getUrl;

exports.invalidateTokensForUser = (userId) => {
  return new Promise((resolve, reject) => {
    if (!userId) {
      resolve();
    } else {
      db.LoginToken
        .update({ valid: false }, { where: {userId: userId} })
        .then(() => { resolve(); })
        .catch(() => { resolve(); })
    }
  });

}
