'use strict';

const { refreshTokens } = require('../../db');
const jwt               = require('jsonwebtoken');
const utils             = require('../../utils');

describe('refreshTokens', () => {
  beforeEach(() => refreshTokens.removeAll());

  describe('#find', () => {
    test('should return empty refresh tokens with invalid token request', () =>
      refreshTokens.find('abc')
      .then(token => expect(token).toBeUndefined));

    test('should return empty refresh tokens with null', () =>
      refreshTokens.find(null)
      .then(token => expect(token).toBeUndefined));

    test('should return empty refresh tokens with undefined', () =>
      refreshTokens.find(undefined)
      .then(token => expect(token).toBeUndefined));

    test('should find a token saved', () => {
      const token = utils.createToken();
      return refreshTokens.save(token, '1', '1', '*')
      .then(() => refreshTokens.find(token))
      .then(foundToken => expect(foundToken).toEqual({
        clientID : '1',
        userID   : '1',
        scope    : '*',
      }));
    });
  });

  describe('#save', () => {
    test('should save an refresh token correctly and return that token', () => {
      const token = utils.createToken();
      return refreshTokens.save(token, '1', '1', '*')
      .then(saved => expect(saved).toEqual({
        clientID : '1',
        userID   : '1',
        scope    : '*',
      }))
      .then(() => refreshTokens.find(token))
      .then(foundToken => expect(foundToken).toEqual({
        clientID : '1',
        userID   : '1',
        scope    : '*',
      }));
    });
  });

  describe('#delete', () => {
    test('should return empty refresh tokens with invalid token request', () =>
      refreshTokens.delete('abc')
      .then(token => expect(token).toBeUndefined));

    test('should return empty refresh tokens with null', () =>
      refreshTokens.delete(null)
      .then(token => expect(token).toBeUndefined));

    test('should return empty refresh tokens with undefined', () =>
      refreshTokens.delete(undefined)
      .then(token => expect(token).toBeUndefined));

    test('should delete an refresh token and return it', () => {
      const token = utils.createToken();
      return refreshTokens.save(token, '1', '1', '*')
      .then(() => refreshTokens.delete(token))
      .then(deletedToken => expect(deletedToken).toEqual({
        clientID : '1',
        userID   : '1',
        scope    : '*',
      }))
      .then(() => refreshTokens.find(token))
      .then(foundToken => expect(foundToken).toEqual(undefined));
    });
  });

  describe('#removeAll', () => {
    test('should remove all tokens', () => {
      const token1   = utils.createToken();
      const token2   = utils.createToken();
      const tokenId1 = jwt.decode(token1).jti;
      const tokenId2 = jwt.decode(token2).jti;
      return refreshTokens.save(token1, '1', '1', '*')
      .then(() => refreshTokens.save(token2, '2', '2', '*'))
      .then(() => refreshTokens.removeAll())
      .then((expiredTokens) => {
        expect(expiredTokens[tokenId1]).toEqual({
          clientID : '1',
          userID   : '1',
          scope    : '*',
        });
        expect(expiredTokens[tokenId2]).toEqual({
          clientID : '2',
          userID   : '2',
          scope    : '*',
        });
      })
      .then(() => refreshTokens.find(token1))
      .then(foundToken => expect(foundToken).toEqual(undefined))
      .then(() => refreshTokens.find(token2))
      .then(foundToken => expect(foundToken).toEqual(undefined));
    });
  });
});
