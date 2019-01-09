const Promise = require('bluebird');
const LoginToken = require('../models').LoginToken;
const appUrl = process.env.APP_URL;
const hat = require('hat');

/**
 *
 */
const getUrl = (user, client, token) => {
  const slug = 'auth/url/authenticate';
  return `${appUrl}/${slug}?token=${token}&clientId=${client.clientId}`;
}

exports.format = (client, user) => {
  return new Promise((resolve, reject) =>  {
    const token = hat();

    new LoginToken({
      userId: user.id,
      token: token
    })
    .save()
    .then((loginToken) => {
      const url = getUrl(user, client, token);
      resolve(url);
    })
    .catch((err) => {
      reject(err);
    });
  });
}

exports.getUrl = getUrl;

exports.invalidateTokensForUser = (userId) => {
  return LoginToken
    .where({userId: userId})
    .save(
        {valid: false},
        {method: 'update', patch: true}
     );
}
