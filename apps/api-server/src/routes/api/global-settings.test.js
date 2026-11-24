import express from 'express';
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import request from 'supertest';
import { beforeEach, describe, expect, it } from 'vitest';

process.env.NODE_CONFIG_DIR = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '../../../config'
);
process.env.SUPPRESS_NO_CONFIG_WARNING = '1';

const require = createRequire(import.meta.url);
const db = require('../../db');
const globalSettingsRouter = require('./global-settings');

let stored;
let savedValues;

function storedSettings() {
  const settings = db.GlobalSettings.build(
    {
      id: 1,
      branding: { accentColor: '#00325F' },
      email: {},
    },
    { isNewRecord: false }
  );
  settings.update = async (values) => {
    settings.set(values);
    await settings.validate({ fields: Object.keys(values) });
    savedValues = values;
    return settings;
  };
  return settings;
}

db.GlobalSettings.findByPk = async () => stored;

function createApp(user) {
  const app = express();
  app.use(express.json());
  app.use((req, res, next) => {
    req.user = user;
    next();
  });
  app.use('/global-settings', globalSettingsRouter);
  app.use((err, req, res, next) => {
    const status =
      err.status || (err.name === 'SequelizeValidationError' && 400) || 500;
    res.status(status).json({ error: err.message });
  });
  return app;
}

const superuser = { role: 'superuser', id: 1 };
const editor = { role: 'editor', id: 2 };
const anonymous = { role: 'anonymous', id: null };

describe('/global-settings', () => {
  beforeEach(() => {
    stored = storedSettings();
    savedValues = null;
  });

  it('lets a superuser read the settings', async () => {
    const res = await request(createApp(superuser)).get('/global-settings');

    expect(res.status).toBe(200);
    expect(res.body.branding).toEqual({ accentColor: '#00325F' });
  });

  it('lets a superuser save one section', async () => {
    const res = await request(createApp(superuser))
      .put('/global-settings')
      .send({ branding: { logo: 'https://example.com/logo.png' } });

    expect(res.status).toBe(200);
    expect(savedValues).toEqual({
      branding: { logo: 'https://example.com/logo.png' },
    });
  });

  it('refuses e-mail settings without the required senders', async () => {
    const res = await request(createApp(superuser))
      .put('/global-settings')
      .send({
        email: { notifications: { fromAddress: 'noreply@example.com' } },
      });

    expect(res.status).toBe(400);
    expect(res.body.error).toContain(
      'Het afzenderadres van de inlogmails is verplicht'
    );
    expect(savedValues).toBeNull();
  });

  it('refuses a request without a section', async () => {
    const res = await request(createApp(superuser))
      .put('/global-settings')
      .send({ other: {} });

    expect(res.status).toBe(400);
  });

  it.each([
    ['an editor', editor],
    ['an anonymous user', anonymous],
  ])('does not let %s read or save the settings', async (name, user) => {
    const read = await request(createApp(user)).get('/global-settings');
    const save = await request(createApp(user))
      .put('/global-settings')
      .send({ branding: { logo: 'x' } });

    expect(read.status).not.toBe(200);
    expect(read.body.error).toBe('You cannot view this GlobalSettings');
    expect(save.status).not.toBe(200);
    expect(savedValues).toBeNull();
  });
});
