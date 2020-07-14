'use strict';
const {
  clientId,
  authorization,
  redirect,
} = require('./common/properties.js');

const properties = require('./common').properties;
const db = require('../../knex/knex');
const supertest = require('supertest');
const app = require('../../app-init');

let agent;
/**
 * Tests for the Grant Type of Authorization Code.
 * This follows the testing guide roughly from
 * https://github.com/FrankHassanabad/Oauth2orizeRecipes/wiki/OAuth2orize-Authorization-Server-Tests
 */
describe('Grant Type Authorization Code', () => {
  beforeAll(async () => {
    agent = supertest.agent(app);
    await db.migrate.latest();
  });

  it(
    'should redirect when trying to get authorization without logging in',
    () =>
      agent.get(properties.logout)
      .then(() => {
        return agent.get(`${authorization}?redirect_uri=${redirect}&response_type=code&client_id=${clientId}&scope=`); // eslint-disable-line camelcase
      })
      .then((response) => {
        return expect(response.req.path.indexOf('/?code=')).toEqual(-1);
      })
  );

});
