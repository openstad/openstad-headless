'use strict';

const supertest = require('supertest');
const app = require('../../app-init');

const db = require('../../db');

const { Umzug, SequelizeStorage } = require('umzug');

const umzug = new Umzug({
  migrations: {
    glob: './migrations/*.js',
    params: [
            db.sequelize.getQueryInterface(),
            db.Sequelize // Sequelize constructor - the required module
        ],
     },
  context: db.sequelize.getQueryInterface(),
  storage: new SequelizeStorage({ sequelize: db.sequelize, tableName : 'migrations' }),
  logger: console,
});

let agent;

const randomId = (Math.random().toString(36).substring(2, 8)).toUpperCase();
const randomSecret = (Math.random().toString(36).substring(2, 8)).toUpperCase();

const clientId = process.env.CLIENT_ID || randomId;
const clientSecret = process.env.CLIENT_SECRET || randomSecret;

/**
 * Tests for the Grant Type of Client.
 * This follows the testing guide roughly from
 * https://github.com/FrankHassanabad/Oauth2orizeRecipes/wiki/OAuth2orize-Authorization-Server-Tests
 */
describe('Grant Type Client', () => {

  beforeAll(async () => {

    process.env.ENVIRONMENT = 'test';
    agent = supertest.agent(app);

    await umzug.up();

    await db.Sequelize.query(`insert into clients (\`id\`, \`name\`, \`redirectUrl\`, \`description\`, \`clientId\`, \`clientSecret\`, \`authTypes\`) values(1, 'test', 'test', 'test', ${clientId}, ${clientSecret}, '["UniqueCode"]');`);

  });


  it('should able to login with basic auth', async (done) => {

    const basicAuth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

    agent.get('/api/admin/users')
      .set('Content-Type', 'application/json')
      .set('Authorization', `Basic ${basicAuth}`)
      .expect(200, done);

  });

  it('should get all users', (done) => {

    const basicAuth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

    agent.get('/api/admin/users')
      .set('Content-Type', 'application/json')
      .set('Authorization', `Basic ${basicAuth}`)
      .expect(200, done)

  });

});
