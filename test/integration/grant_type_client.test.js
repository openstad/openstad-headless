'use strict';

const {
  clientId,
  clientSecret,
  password,
  username,
  token,
} = require('./common/properties.js');

const supertest = require('supertest');

const app = require('../../app-init');

let agent;

/**
 * Tests for the Grant Type of Client.
 * This follows the testing guide roughly from
 * https://github.com/FrankHassanabad/Oauth2orizeRecipes/wiki/OAuth2orize-Authorization-Server-Tests
 */
describe('Grant Type Client', () => {

  beforeAll((done) => {

    agent = supertest.agent(app);

    done();
  });

  it('should get an 401 when asking for an access token', (done) => {
    const basicAuth = new Buffer(`${clientId}:${clientSecret}`).toString('base64');

    agent.post(token, {
      form: {
        username,
        password,
        scope: {},
        grant_type: 'client_credentials',
      },
      headers: {
        Authorization: `Basic ${basicAuth}`,
      },
    }).expect(401, done);

  });

});
