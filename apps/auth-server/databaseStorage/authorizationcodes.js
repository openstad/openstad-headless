'use strict';

const db = require('../db');
const utils = require('../utils');

/**
 * Returns an authorization code if it finds one, otherwise returns undefined.
 * @param   {String}  token - The token to decode to get the id of the authorization token to find.
 * @returns {Promise} resolved with the authorization code if found, otherwise undefined
 */
exports.find = (token) => {
  let decoded;
  try {
    decoded = utils.verifyToken(token);
  } catch (e) {
    return Promise.resolve(undefined);
  }

  const id = decoded.jti;

  return db.AuthorizationCode.findOne({ where: { tokenId: id } })
    .then((code) => {
      if (!code) return undefined;
      return {
        clientID: code.clientID,
        redirectURI: code.redirectURI,
        userID: code.userID,
        scope: code.scope,
      };
    })
    .catch((e) => {
      console.warn('Error finding authorization code: ', e);
      return undefined;
    });
};

/**
 * Saves an authorization code, client id, redirect uri, user id, and scope.
 * @param   {String}  code        - The authorization code (required)
 * @param   {String}  clientID    - The client ID (required)
 * @param   {String}  redirectURI - The redirect URI of where to send access tokens once exchanged
 * @param   {String}  userID      - The user ID (required)
 * @param   {String}  scope       - The scope (optional)
 * @returns {Promise} resolved with the saved token
 */
exports.save = (code, clientID, redirectURI, userID, scope) => {
  let decoded;
  try {
    decoded = utils.verifyToken(code);
  } catch (e) {
    return Promise.reject(new Error('Invalid authorization code'));
  }

  const id = decoded.jti;

  return db.AuthorizationCode.create({
    tokenId: id,
    clientID,
    redirectURI,
    userID,
    scope,
  })
    .then((record) => ({
      clientID: record.clientID,
      redirectURI: record.redirectURI,
      userID: record.userID,
      scope: record.scope,
    }))
    .catch((e) => {
      console.warn('Error saving authorization code: ', e);
      return undefined;
    });
};

/**
 * Deletes an authorization code
 * @param   {String}  token - The authorization code to delete
 * @returns {Promise} resolved with the deleted value
 */
exports.delete = (token) => {
  let decoded;
  try {
    decoded = utils.verifyToken(token);
  } catch (e) {
    return Promise.resolve(undefined);
  }

  const id = decoded.jti;

  return db.AuthorizationCode.findOne({ where: { tokenId: id } })
    .then((code) => {
      if (!code) return undefined;
      const data = {
        clientID: code.clientID,
        redirectURI: code.redirectURI,
        userID: code.userID,
        scope: code.scope,
      };
      return code.destroy().then(() => data);
    })
    .catch((e) => {
      console.warn('Error deleting authorization code: ', e);
      return undefined;
    });
};

/**
 * Removes all authorization codes.
 * @returns {Promise} resolved when all codes are removed
 */
exports.removeAll = () => {
  return db.AuthorizationCode.destroy({ where: {} });
};
