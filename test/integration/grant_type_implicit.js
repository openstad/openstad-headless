'use strict';

const helper     = require('./common').helper;
const promisify  = require('es6-promisify');
const properties = require('./common').properties;
const request    = require('request').defaults({ jar: true, strictSSL: false }); // eslint-disable-line
const utils      = require('../../utils');
const validate   = require('./common').validate;

const get = promisify(request.get, { multiArgs : true });

/**
 * Tests for the Grant Type of Implicit.
 * This follows the testing guide roughly from
 * https://github.com/FrankHassanabad/Oauth2orizeRecipes/wiki/OAuth2orize-Authorization-Server-Tests
 */
describe('Grant Type Implicit', () => {
  test(
    'should redirect when trying to get authorization without logging in',
    () =>
      get(properties.logout)
      .then(() => helper.getAuthorization({ responseType: 'token' }))
      .then(([response]) => expect(response.request.href.indexOf('/#access_token=')).toEqual(-1))
  );

  test('should work with the implicit asking for a access token', () =>
    helper.login()
    .then(() => helper.getAuthorization({ responseType: 'token' }))
    .then(([response]) => {
      const accessTokenIndex = response.request.href.indexOf('#access_token') + '#access_token='.length;
      const endTokenIndex    = response.request.href.indexOf('&expires_in');
      const accessToken      = response.request.href.slice(accessTokenIndex, endTokenIndex);
      utils.verifyToken(accessToken);

      const expiresInIndex = response.request.href.indexOf('&expires_in') + '&expires_in='.length;
      const expiresIn = response.request.href.slice(expiresInIndex, expiresInIndex + 4);
      expect(expiresIn).toEqual('3600');

      const tokenTypeIndex = response.request.href.indexOf('&token_type') + '&token_type='.length;
      const tokenType = response.request.href.slice(tokenTypeIndex, tokenTypeIndex + 6);
      expect(tokenType).toEqual('Bearer');
      return accessToken;
    })
    .then(accessToken => helper.getUserInfo(accessToken))
    .then(([response, body]) => validate.userJson(response, body)));

  test('should give an error with an invalid client id', () =>
    helper.login()
    .then(() => helper.getAuthorization({ responseType: 'token', clientId: 'someinvalidclientid' }))
    .then(([response]) => expect(response.statusCode).toEqual(403)));

  test('should give an error with a missing client id', () =>
    helper.login()
    .then(() => get(`${properties.authorization}?redirect_uri=${properties.redirect}&response_type=token`))
    .then(([response]) => expect(response.statusCode).toEqual(400)));

  test('should give an error with an invalid response type', () =>
    helper.login()
    .then(() => helper.getAuthorization({ responseType: 'invalid' }))
    .then(([response]) => expect(response.statusCode).toEqual(501)));
});
