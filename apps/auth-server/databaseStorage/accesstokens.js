'use strict';

const db = require('../db');
const utils = require('../utils');

/**
 * Returns an access token if it finds one, otherwise returns undefined.
 * @param   {String}  token - The token to decode to get the id of the access token to find.
 * @returns {Promise} resolved with the token if found, otherwise resolved with undefined
 */
exports.find = (token) => {
  let decoded;
  try {
    decoded = utils.verifyToken(token);
  } catch (e) {
    return Promise.resolve(undefined);
  }

  const id = decoded.jti;

  return db.AccessToken.findOne({ where: { tokenId: id } })
    .then((token) => token || undefined)
    .catch((e) => {
      console.warn('Error finding accesstoken: ', e);
      return undefined;
    });
};

/**
 * Saves an access token, expiration date, user id, client id, and scope.
 * @param   {Object}  token          - The access token (required)
 * @param   {Date}    expirationDate - The expiration of the access token (required)
 * @param   {String}  userID         - The user ID (required)
 * @param   {String}  clientID       - The client ID (required)
 * @param   {String}  scope          - The scope (optional)
 * @returns {Promise} resolved with the saved token
 */
exports.save = (token, expirationDate, userID, clientID, scope) => {
  let decoded;
  try {
    decoded = utils.verifyToken(token);
  } catch (e) {
    return Promise.resolve(undefined);
  }

  const id = decoded.jti;

  return db.AccessToken.create({
    tokenId: id,
    userID,
    expirationDate,
    clientID,
    scope,
  })
    .then((token) => token || undefined)
    .catch((e) => {
      console.warn('Error creating accesstoken: ', e);
      return undefined;
    });
};

/**
 * Deletes/Revokes an access token by getting the ID and removing it from the storage.
 * @param   {String}  token - The token to decode to get the id of the access token to delete.
 * @returns {Promise} resolved with the deleted token
 */
exports.delete = (token) => {
  let decoded;
  try {
    decoded = utils.verifyToken(token);
  } catch (e) {
    return Promise.resolve(undefined);
  }

  const id = decoded.jti;

  return db.AccessToken.findOne({ where: { tokenId: id } })
    .then((token) => {
      if (!token) return undefined;
      return token.destroy().then(() => token);
    })
    .catch((e) => {
      console.warn('Error deleting accesstoken: ', e);
      return undefined;
    });
};

/**
 * Removes expired access tokens.
 * @returns {Promise} resolved when expired tokens are removed
 */
exports.removeExpired = () => {
  return db.AccessToken.destroy({
    where: {
      expirationDate: {
        [db.Sequelize.Op.lt]: new Date(),
      },
    },
  }).catch((e) => {
    console.warn('Error removing expired access tokens: ', e);
  });
};

/**
 * Removes all access tokens.
 * @returns {Promise} resolved when all tokens are removed
 */
exports.removeAll = () => {
  return db.AccessToken.destroy({ where: {} });
};
