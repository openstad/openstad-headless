'use strict';

const { accessTokens } = require('../../../db');
const jwt              = require('jsonwebtoken');
const utils            = require('../../../utils');

describe('accesstokens', () => {
  beforeEach(() => accessTokens.removeAll());

  describe('#find', () => {
    test('should return empty access tokens with invalid token request', () =>
      accessTokens.find('abc')
      .then(token => expect(token).toBeUndefined));

    test('should return empty access tokens with null', () =>
      accessTokens.find(null)
      .then(token => expect(token).toBeUndefined));

    test('should return empty access tokens with undefined', () =>
      accessTokens.find(undefined)
      .then(token => expect(token).toBeUndefined));

    test('should find a token saved', () => {
      const token = utils.createToken();
      return accessTokens.save(token, new Date(0), '1', '1', '*')
      .then(() => accessTokens.find(token))
      .then(foundToken => expect(foundToken).toEqual({
        clientID       : '1',
        expirationDate : new Date(0),
        userID         : '1',
        scope          : '*',
      }));
    });
  });

  describe('#save', () => {
    test('should save an access token correctly and return that token', () => {
      const token = utils.createToken();
      return accessTokens.save(token, new Date(0), '1', '1', '*')
      .then(saved => expect(saved).toEqual({
        clientID       : '1',
        expirationDate : new Date(0),
        userID         : '1',
        scope          : '*',
      }))
      .then(() => accessTokens.find(token))
      .then(foundToken => expect(foundToken).toEqual({
        clientID       : '1',
        expirationDate : new Date(0),
        userID         : '1',
        scope          : '*',
      }));
    });
  });

  describe('#delete', () => {
    test('should return empty access tokens with invalid token request', () =>
      accessTokens.delete('abc')
      .then(token => expect(token).toBeUndefined));

    test('should return empty access tokens with null', () =>
      accessTokens.delete(null)
      .then(token => expect(token).toBeUndefined));

    test('should return empty access tokens with undefined', () =>
      accessTokens.delete(undefined)
      .then(token => expect(token).toBeUndefined));

    test('should delete an access token and return it', () => {
      const token = utils.createToken();
      return accessTokens.save(token, new Date(0), '1', '1', '*')
      .then(() => accessTokens.delete(token))
      .then(deletedToken => expect(deletedToken).toEqual({
        clientID       : '1',
        expirationDate : new Date(0),
        userID         : '1',
        scope          : '*',
      }))
      .then(() => accessTokens.find(token))
      .then(foundToken => expect(foundToken).toEqual(undefined));
    });
  });

  describe('#removeExpired', () => {
    test('should remove expired tokens', () => {
      const token1   = utils.createToken();
      const token2   = utils.createToken();
      const tokenId1 = jwt.decode(token1).jti;
      const tokenId2 = jwt.decode(token2).jti;
      return accessTokens.save(token1, new Date(0), '1', '1', '*')
      .then(() => accessTokens.save(token2, new Date(0), '2', '2', '*'))
      .then(() => accessTokens.removeExpired())
      .then((expiredTokens) => {
        expect(expiredTokens[tokenId1]).toEqual({
          clientID       : '1',
          expirationDate : new Date(0),
          userID         : '1',
          scope          : '*',
        });
        expect(expiredTokens[tokenId2]).toEqual({
          clientID       : '2',
          expirationDate : new Date(0),
          userID         : '2',
          scope          : '*',
        });
      })
      .then(() => accessTokens.find(token1))
      .then(foundToken => expect(foundToken).toEqual(undefined))
      .then(() => accessTokens.find(token2))
      .then(foundToken => expect(foundToken).toEqual(undefined));
    });
  });

  describe('#removeAll', () => {
    test('should remove all tokens', () => {
      const token1   = utils.createToken();
      const token2   = utils.createToken();
      const tokenId1 = jwt.decode(token1).jti;
      const tokenId2 = jwt.decode(token2).jti;
      return accessTokens.save(token1, new Date(0), '1', '1', '*')
      .then(() => accessTokens.save(token2, new Date(0), '2', '2', '*'))
      .then(() => accessTokens.removeAll())
      .then((expiredTokens) => {
        expect(expiredTokens[tokenId1]).toEqual({
          clientID       : '1',
          expirationDate : new Date(0),
          userID         : '1',
          scope          : '*',
        });
        expect(expiredTokens[tokenId2]).toEqual({
          clientID       : '2',
          expirationDate : new Date(0),
          userID         : '2',
          scope          : '*',
        });
      })
      .then(() => accessTokens.find(token1))
      .then(foundToken => expect(foundToken).toEqual(undefined))
      .then(() => accessTokens.find(token2))
      .then(foundToken => expect(foundToken).toEqual(undefined));
    });
  });
});
