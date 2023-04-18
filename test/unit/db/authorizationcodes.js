'use strict';

const { authorizationCodes } = require('../../../memoryStorage');
const jwt                    = require('jsonwebtoken');
const utils                  = require('../../../utils');

describe('authorizationCodes', () => {
  beforeEach(() => authorizationCodes.removeAll());

  describe('#find', () => {
    test(
      'should return empty authorization tokens with invalid token request',
      () =>
        authorizationCodes.find('abc')
        .then(token => expect(token).toBeUndefined)
    );

    test('should return empty authorization tokens with null', () =>
      authorizationCodes.find(null)
      .then(token => expect(token).toBeUndefined));

    test('should return empty authorization tokens with undefined', () =>
      authorizationCodes.find(undefined)
      .then(token => expect(token).toBeUndefined));

    test('should find a token saved', () => {
      const token = utils.createToken();
      return authorizationCodes.save(token, '1', 'http://google.com', '1', '*')
      .then(() => authorizationCodes.find(token))
      .then(foundToken => expect(foundToken).toEqual({
        clientID    : '1',
        redirectURI : 'http://google.com',
        userID      : '1',
        scope       : '*',
      }));
    });
  });

  describe('#save', () => {
    test(
      'should save an authorization token correctly and return that token',
      () => {
        const token = utils.createToken();
        return authorizationCodes.save(token, '1', 'http://google.com', '1', '*')
        .then(saved => expect(saved).toEqual({
          clientID    : '1',
          redirectURI : 'http://google.com',
          userID      : '1',
          scope       : '*',
        }))
        .then(() => authorizationCodes.find(token))
        .then(foundToken => expect(foundToken).toEqual({
          clientID    : '1',
          redirectURI : 'http://google.com',
          userID      : '1',
          scope       : '*',
        }));
      }
    );
  });

  describe('#delete', () => {
    test(
      'should return empty authorization tokens with invalid token request',
      () =>
        authorizationCodes.delete('abc')
        .then(token => expect(token).toBeUndefined)
    );

    test('should return empty authorization tokens with null', () =>
      authorizationCodes.delete(null)
      .then(token => expect(token).toBeUndefined));

    test('should return empty authorization tokens with undefined', () =>
      authorizationCodes.delete(undefined)
      .then(token => expect(token).toBeUndefined));

    test('should delete an authorization token and return it', () => {
      const token = utils.createToken();
      return authorizationCodes.save(token, '1', 'http://google.com', '1', '*')
      .then(() => authorizationCodes.delete(token))
      .then(deletedToken => expect(deletedToken).toEqual({
        clientID    : '1',
        redirectURI : 'http://google.com',
        userID      : '1',
        scope       : '*',
      }))
      .then(() => authorizationCodes.find(token))
      .then(foundToken => expect(foundToken).toEqual(undefined));
    });
  });

  describe('#removeAll', () => {
    test('should remove all tokens', () => {
      const token1   = utils.createToken();
      const token2   = utils.createToken();
      const tokenId1 = jwt.decode(token1).jti;
      const tokenId2 = jwt.decode(token2).jti;
      return authorizationCodes.save(token1, '1', 'http://google.com', '1', '*')
      .then(() => authorizationCodes.save(token2, '2', 'http://google.com', '2', '*'))
      .then(() => authorizationCodes.removeAll())
      .then((expiredTokens) => {
        expect(expiredTokens[tokenId1]).toEqual({
          clientID    : '1',
          redirectURI : 'http://google.com',
          userID      : '1',
          scope       : '*',
        });
        expect(expiredTokens[tokenId2]).toEqual({
          clientID    : '2',
          redirectURI : 'http://google.com',
          userID      : '2',
          scope       : '*',
        });
      })
      .then(() => authorizationCodes.find(token1))
      .then(foundToken => expect(foundToken).toEqual(undefined))
      .then(() => authorizationCodes.find(token2))
      .then(foundToken => expect(foundToken).toEqual(undefined));
    });
  });
});
