'use strict';

require('process').env.OAUTHRECIPES_SURPRESS_TRACE = true;

const utils     = require('../../utils');
const validate  = require('../../validate');

const knex = require('../../knex/knex.js');
const mockKnex = require('mock-knex');

const tracker = require('mock-knex').getTracker();

describe('validate', () => {

  beforeEach((done) => {
    tracker.install();
    done();
  });

  afterEach((done) => {
    tracker.uninstall();
    done();
  });

  beforeAll((done) => {
    mockKnex.mock(knex);
    done();
  });

  afterAll((done) => {
    mockKnex.unmock(knex);
    done();
  });


  describe('#logAndThrow', () => {
    test('should throw a given mesage', () => {
      expect(() => validate.logAndThrow('some message')).toThrow('some message');
    });
  });

  describe('#user', () => {
    test('show throw if user is undefined', () => {
      expect(() => validate.user(undefined, 'pass')).toThrow('User does not exist');
    });

    test('show throw if user is null', () => {
      expect(() => validate.user(null, 'pass')).toThrow('User does not exist');
    });

    test('show throw if password does not match', () => {
      expect(() =>
        validate.user({ password : 'password' }, 'otherpassword'))
        .toThrow('User password does not match');
    });

    test('show return user if password matches', () => {
      expect(validate.user({ password: 'password' }, 'password'))
        .toEqual({ password : 'password' });
    });

    test('show return user if password matches with data', () => {
      expect(validate.user({ user: 'yo', password: 'password' }, 'password'))
        .toEqual({ user : 'yo', password : 'password' });
    });
  });

  describe('#userExists', () => {
    test('show throw if user is undefined', () => {
      expect(() => validate.userExists(undefined)).toThrow('User does not exist');
    });

    test('show throw if user is null', () => {
      expect(() => validate.userExists(null)).toThrow('User does not exist');
    });

    test('show return user if it exists', () => {
      expect(validate.userExists({ password : 'password' }))
        .toEqual({ password : 'password' });
    });
  });

  describe('#client', () => {
    test('show throw if client is undefined', () => {
      expect(() => validate.client(undefined, 'pass')).toThrow('Client does not exist');
    });

    test('show throw if client is null', () => {
      expect(() => validate.client(null, 'pass')).toThrow('Client does not exist');
    });

    test('show throw if client secret does not match', () => {
      expect(() =>
        validate.client({ clientSecret : 'password' }, 'otherpassword'))
        .toThrow('Client secret does not match');
    });

    test('show return client if client secret matches', () => {
      expect(validate.client({ clientSecret : 'password' }, 'password'))
        .toEqual({ clientSecret : 'password' });
    });

    test('show return client if password matches with data', () => {
      expect(validate.client({ client: 'yo', clientSecret: 'password' }, 'password'))
        .toEqual({ client : 'yo', clientSecret : 'password' });
    });
  });

  describe('#clientExists', () => {
    test('show throw if client is undefined', () => {
      expect(() => validate.clientExists(undefined)).toThrow('Client does not exist');
    });

    test('show throw if client is null', () => {
      expect(() => validate.clientExists(null)).toThrow('Client does not exist');
    });

    test('show return user if it exists', () => {
      expect(validate.clientExists({ clientSecret : 'password' }))
        .toEqual({ clientSecret : 'password' });
    });
  });

  describe('#token', () => {
    test('should throw with undefined code', () => {
      expect(() =>
        validate.token({ userID : '1' }, undefined))
          .toThrow('jwt must be provided');
    });

    test('should throw with null code', () => {
      expect(() =>
        validate.token({ userID : '1' }, null))
          .toThrow('jwt must be provided');
    });

    test('should throw with invalid userID', () => {
      const token = utils.createToken();
      tracker.on('query', (query) => {
        query.response();
      });
      return validate.token({ userID : '-1' }, token)
      .catch(err => expect(err.message).toEqual('User does not exist'));
    });

    test('should throw with invalid clientID', () => {
      const token = utils.createToken();
      tracker.on('query', (query) => {
        query.response();
      });
      return validate.token({ clientID: '-1' }, token)
      .catch(err => expect(err.message).toEqual('Client does not exist'));
    });

    test('should throw with invalid userID and invalid clientID', () => {
      const token = utils.createToken();
      tracker.on('query', (query) => {
        query.response();
      });

      return validate.token({ userID : '-1', clientID: '-1' }, token)
      .catch(err => expect(err.message).toEqual('User does not exist'));
    });

    test('should return user with valid user', () => {
      const token = utils.createToken();

      tracker.on('query', (query) => {
        query.response({id: 1});
      });

      const user  = { userID   : 1 };
      return validate.token(user, token)
      .then(returnedUser => {
        return expect(returnedUser.id).toBe(user.userID);
      });
    });

    test('should return client with valid client', () => {
      const token = utils.createToken();
      const client  = { clientID   : '2' };

      tracker.on('query', (query) => {
        query.response({id: '1', clientId: '2'});
      });

      return validate.token(client, token)
      .then(returnedClient => {
        return expect(returnedClient.clientId).toBe(client.clientID)
      });
    });
  });

  describe('#refreshToken', () => {
    test('should throw with undefined code', () => {
      expect(() =>
        validate.refreshToken({
          clientID : '1',
        }, undefined, {
          id : '1',
        })).toThrow('jwt must be provided');
    });

    test('should throw with null code', () => {
      expect(() =>
        validate.refreshToken({
          clientID : '1',
        }, null, {
          id : '1',
        })).toThrow('jwt must be provided');
    });

    test('should throw with invalid client ID', () => {
      const token = utils.createToken();
      expect(() =>
        validate.refreshToken({
          clientID : '1',
        }, token, {
          id : '2',
        })).toThrow('RefreshToken clientID does not match client id given');
    });

    test('should return refreshToken with everything valid', () => {
      const token = utils.createToken();
      expect(validate.refreshToken({ clientID: '1' }, token, { id : '1' })).toEqual(token);
    });
  });

  describe('#authCode', () => {
    test('should throw with undefined code', () => {
      expect(() =>
        validate.authCode(undefined, {
          clientID    : '1',
          redirectURI : 'a',
        }, {
          id : '1',
        }, 'a')).toThrow('jwt must be provided');
    });

    test('should throw with null code', () => {
      expect(() =>
        validate.authCode(null, {
          clientID    : '1',
          redirectURI : 'a',
        }, {
          id : '1',
        }, 'a')).toThrow('jwt must be provided');
    });

    test('should throw with invalid client ID', () => {
      const token = utils.createToken();
      expect(() =>
        validate.authCode(token, {
          clientID    : '1',
          redirectURI : 'a',
        }, {
          id : '2',
        }, 'a')).toThrow('AuthCode clientID does not match client id given');
    });

    test('should throw with invalid redirectURI', () => {
      const token = utils.createToken();
      expect(() =>
        validate.authCode(token, {
          clientID    : '1',
          redirectURI : 'a',
        }, {
          id : '1',
        }, 'b')).toThrow('AuthCode redirectURI does not match redirectURI given');
    });

    test('should return authCode with everything valid', () => {
      const token    = utils.createToken();
      const authCode = { clientID: '1', redirectURI : 'a' };
      expect(validate.authCode(token, authCode, { id : '1' }, 'a')).toEqual(authCode);
    });
  });

  describe('#isRefreshToken', () => {
    test('show return true for scope having offline_access', () => {
      expect(validate.isRefreshToken({ scope : 'offline_access' })).toEqual(true);
    });

    test('show return false for scope of other value', () => {
      expect(validate.isRefreshToken({ scope : '*' })).toEqual(false);
    });

    test('show return false for non existent scope', () => {
      expect(validate.isRefreshToken({ })).toEqual(false);
    });
  });

  describe('#generateRefreshToken', () => {
    test('should generate and return a refresh token', () =>
      validate.generateRefreshToken({ userID: '1', clientID: '1', scope: '*' })
      .then(token => utils.verifyToken(token)));
  });

  describe('#generateToken', () => {
    test('should generate and return a token', () =>
      validate.generateToken({ userID: '1', clientID: '1', scope: '*' })
      .then(token => utils.verifyToken(token)));
  });

  describe('#generateTokens', () => {
    test('should generate and return an access and refresh token', () =>
      validate.generateTokens({ userID : '1', clientID : '1', scope : 'offline_access' })
      .then(([accessToken, refreshToken]) => {
        utils.verifyToken(accessToken);
        utils.verifyToken(refreshToken);
      }));

    test(
      'should generate and return an access with no refresh token when scope is defined as all',
      () =>
        validate.generateTokens({ userID : '1', clientID : '1', scope : '*' })
        .then(([accessToken, refreshToken]) => {
          utils.verifyToken(accessToken);
          expect(refreshToken).toEqual(undefined);
        })
    );
  });

  describe('#tokenForHttp', () => {
    test('should return 400 status', () =>
      validate.tokenForHttp().catch(err => expect(err.status).toEqual(400)));

    test('should reject undefined token', () =>
      validate.tokenForHttp().catch(err => expect(err.message).toEqual('invalid_token')));

    test('should reject null token', () =>
      validate.tokenForHttp(null).catch(err => expect(err.message).toEqual('invalid_token')));

    test('should reject invalid token', () =>
      validate.tokenForHttp('abc').catch(err => expect(err.message).toEqual('invalid_token')));

    test('should work with a valid token', () => {
      const token = utils.createToken();
      return validate.tokenForHttp(token)
      .then(returnedToken => expect(returnedToken).toEqual(token));
    });
  });

  describe('#clientExistsForHttp', () => {
    test('should return 400 status', () => {
      try {
        validate.clientExistsForHttp();
      } catch (err) {
        expect(err.status).toEqual(400);
      }
    });

    test('should reject undefined client', () => {
      expect(() => validate.clientExistsForHttp()).toThrow('invalid_token');
    });

    test('should reject null client`', () => {
      expect(() => validate.clientExistsForHttp(null)).toThrow('invalid_token');
    });

    test('should return a non null client', () => {
      const client = validate.clientExistsForHttp({ client: 123 });
      expect(client).toEqual({ client: 123 });
    });
  });
});

