'use strict';

const db = require('../db');
const utils = require('../utils');

/**
 * Returns a refresh token if it finds one, otherwise returns undefined.
 * @param   {String}  token - The token to decode to get the id of the refresh token to find.
 * @returns {Promise} resolved with the token
 */
exports.find = (token) => {
  let decoded;
  try {
    decoded = utils.verifyToken(token);
  } catch (e) {
    return Promise.resolve(undefined);
  }

  const id = decoded.jti;

  return db.RefreshToken.findOne({ where: { tokenId: id } })
    .then((record) => {
      if (!record) return undefined;
      return {
        userID: record.userID,
        clientID: record.clientID,
        scope: record.scope,
      };
    })
    .catch((e) => {
      console.warn('Error finding refresh token: ', e);
      return undefined;
    });
};

/**
 * Saves a refresh token, user id, client id, and scope.
 * @param   {Object}  token    - The refresh token (required)
 * @param   {String}  userID   - The user ID (required)
 * @param   {String}  clientID - The client ID (required)
 * @param   {String}  scope    - The scope (optional)
 * @returns {Promise} resolved with the saved token
 */
exports.save = (token, userID, clientID, scope) => {
  let decoded;
  try {
    decoded = utils.verifyToken(token);
  } catch (e) {
    console.warn('Error verifying JWT: ', e);
    return Promise.resolve(new Error('Invalid refresh token'));
  }

  const id = decoded.jti;

  return db.RefreshToken.create({
    tokenId: id,
    userID,
    clientID,
    scope,
  })
    .then((record) => ({
      userID: record.userID,
      clientID: record.clientID,
      scope: record.scope,
    }))
    .catch((e) => {
      console.warn('Error saving refresh token: ', e);
      return undefined;
    });
};

/**
 * Deletes a refresh token
 * @param   {String}  token - The token to decode to get the id of the refresh token to delete.
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

  return db.RefreshToken.findOne({ where: { tokenId: id } })
    .then((record) => {
      if (!record) return undefined;
      const data = {
        userID: record.userID,
        clientID: record.clientID,
        scope: record.scope,
      };
      return record.destroy().then(() => data);
    })
    .catch((e) => {
      console.warn('Error deleting refresh token: ', e);
      return undefined;
    });
};

/**
 * Removes all refresh tokens.
 * @returns {Promise} resolved when all tokens are removed
 */
exports.removeAll = () => {
  return db.RefreshToken.destroy({ where: {} });
};
