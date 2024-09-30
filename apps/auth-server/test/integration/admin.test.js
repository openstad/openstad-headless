'use strict';

const supertest = require('supertest');
const app = require('../../app-init');

const db = require('../../knex/knex');

let agent;

/**
 * Tests for the Grant Type of Client.
 * This follows the testing guide roughly from
 * https://github.com/FrankHassanabad/Oauth2orizeRecipes/wiki/OAuth2orize-Authorization-Server-Tests
 */
describe('Grant Type Client', () => {

  beforeAll(async () => {

    process.env.ENVIRONMENT = 'test';
    agent = supertest.agent(app);

    await db.migrate.latest();

    await db.raw("insert into clients (`id`, `name`, `redirectUrl`, `description`, `clientId`, `clientSecret`, `authTypes`) values(1, 'test', 'test', 'test', 'trustedClient', 'ssh-otherpassword', '[\"UniqueCode\"]');");

  });


  it('should able to login with basic auth', async (done) => {

    const clientId = 'trustedClient';
    const clientSecret = 'ssh-otherpassword';

    const basicAuth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

    agent.get('/api/admin/users')
      .set('Content-Type', 'application/json')
      .set('Authorization', `Basic ${basicAuth}`)
      .expect(200, done);

  });

  it('should get all users', (done) => {
    const clientId = 'trustedClient';
    const clientSecret = 'ssh-otherpassword';

    const basicAuth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

    agent.get('/api/admin/users')
      .set('Content-Type', 'application/json')
      .set('Authorization', `Basic ${basicAuth}`)
      .expect(200, done)

  });

});
