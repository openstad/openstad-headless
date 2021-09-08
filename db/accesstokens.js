'use strict';
const AccessToken = require('../models').AccessToken;

const jwt = require('jsonwebtoken');

// The access tokens.
// You will use these to access your end point data through the means outlined
// in the RFC The OAuth 2.0 Authorization Framework: Bearer Token Usage
// (http://tools.ietf.org/html/rfc6750)

/**
 * Tokens in-memory data structure which stores all of the access tokens
 */
let tokens = Object.create(null);

/**
 * Returns an access token if it finds one, otherwise returns null if one is not found.
 * @param   {String}  token - The token to decode to get the id of the access token to find.
 * @returns {Promise} resolved with the token if found, otherwise resolved with undefined
 */
exports.find = (token) => {
    const id = jwt.decode(token).jti;

    const findAction = new Promise((resolve, reject) => {
      new AccessToken({ tokenId: id  })
      .fetch()
      .then((token) => {
        if (!token) {
          resolve(undefined);
        }
        const tokenData = token.serialize();
        tokenData.id = tokenData.id;

        return resolve(tokenData);
      })
      .catch((e) => {
        console.warn('Error finding accesstoken: ', e)
        return resolve(undefined);
      })
    });

    return findAction;
};

/**
 * Saves a access token, expiration date, user id, client id, and scope. Note: The actual full
 * access token is never saved.  Instead just the ID of the token is saved.  In case of a database
 * breach this prevents anyone from stealing the live tokens.
 * @param   {Object}  token          - The access token (required)
 * @param   {Date}    expirationDate - The expiration of the access token (required)
 * @param   {String}  userID         - The user ID (required)
 * @param   {String}  clientID       - The client ID (required)
 * @param   {String}  scope          - The scope (optional)
 * @returns {Promise} resolved with the saved token
 */
exports.save = (token, expirationDate, userID, clientID, scope) => {
  const id = jwt.decode(token).jti;

  const saveAction = new Promise((resolve, reject) => {
    new AccessToken({tokenId: id, userID, expirationDate, clientID, scope})
      .save()
      .then((token) => {
        console.log('Savedddd access token')
        if (!token) {
          resolve(undefined);
        }

        const tokenData = token.serialize();
        tokenData.id = tokenData.id;

        return resolve(tokenData);
      })
      .catch((e) => {
        console.warn('Error creating accesstoken: ', e)
        return resolve(undefined);
      });
  });


  return saveAction;
};

/**
 * Deletes/Revokes an access token by getting the ID and removing it from the storage.
 * @param   {String}  token - The token to decode to get the id of the access token to delete.
 * @returns {Promise} resolved with the deleted token
 */
exports.delete = (token) => {
  const id = jwt.decode(token).jti;

  const deleteAction = new Promise((resolve, reject) => {
    return  new AccessToken({ tokenId: id  })
      .fetch()
      .then((token) => {
        const tokenData = token.serialize();

        return token
          .destroy()
          .then(() => {
            return tokenData ? resolve(tokenData) : resolve(undefined);
          })
          .catch(() =>{
            console.warn('Error delete accesstoken: ', e)
            return resolve(undefined)
          })
      })
      .catch((e) => {
        console.warn('Error delete accesstoken: ', e)
        return resolve(undefined);
      })
  });

  return deleteAction;

};

/**
 * Removes expired access tokens. It does this by looping through them all and then removing the
 * expired ones it finds.
 * @returns {Promise} resolved with an associative of tokens that were expired
 */
exports.removeExpired = () => {
  const removeExpiredAction = new Promise((resolve, reject) => {

    new AccessToken()
      .fetchAll()
      .then(async (tokens) => {
        const deleteActions = [];
       // tokens = tokens.serialize();


        tokens.forEach((accessToken) => {
          const expirationDate = accessToken.get('expirationDate');

          if (new Date() > expirationDate)  {
            deleteActions.push(accessToken.destroy())
          }
        });

        Promise.all(deleteActions)
          .then((success) => {
            console.log('success', success);
            resolve();
          })
          .catch((e) => {
            resolve();
            console.log('e', e)
          })

      })
      .catch((e) => {
        console.warn('Error delete accesstoken: ', e)
        return Promise.resolve(undefined);
      });

    resolve(undefined)
  });

  return removeExpiredAction;
};

/**
 * Removes all access tokens.
 * @returns {Promise} resolved with all removed tokens returned
 */
exports.removeAll = () => {
  //const deletedTokens = tokens;
  //tokens              = Object.create(null);
 // return Promise.resolve(deletedTokens);
};
