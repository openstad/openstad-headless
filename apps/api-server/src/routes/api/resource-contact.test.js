import express from 'express';
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import request from 'supertest';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

process.env.NODE_CONFIG_DIR = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '../../../config'
);
process.env.SUPPRESS_NO_CONFIG_WARNING = '1';

const require = createRequire(import.meta.url);
const db = require('../../db');
const pluginExtensions = require('../../services/plugin-extensions');
const contactRouter = require('./resource-contact');

const OWNER = { id: 7, email: 'owner@example.test' };
let resourceOwnerId = OWNER.id;
let ownerRecord = OWNER;
let notifications = [];

db.Resource.findOne = async ({ where }) =>
  where.id === 5 && where.projectId === 1
    ? { id: 5, projectId: 1, userId: resourceOwnerId }
    : null;
db.User.findByPk = async (id) => (id === OWNER.id ? ownerRecord : null);
db.Notification.create = async (data) => {
  notifications.push(data);
  return data;
};

function createApp(user) {
  const app = express();
  app.use(express.json());
  app.use((req, res, next) => {
    req.user = user;
    req.project = { id: 1 };
    next();
  });
  app.use(
    '/project/:projectId(\\d+)/resource/:resourceId(\\d+)/contact',
    contactRouter
  );
  app.use((err, req, res, next) => {
    res.status(err.status || 500).json({ error: err.message });
  });
  return app;
}

const sender = {
  id: 3,
  role: 'member',
  name: 'Angelo',
  email: 'sender@example.test',
};
const url = '/project/1/resource/5/contact';
const validBody = { message: 'Hallo!', consent: true };

describe('POST contact', () => {
  beforeEach(() => {
    notifications = [];
    resourceOwnerId = OWNER.id;
    ownerRecord = OWNER;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('requires a logged in user', async () => {
    const res = await request(createApp({ role: 'anonymous', id: null }))
      .post(url)
      .send(validBody);
    expect(res.status).toBe(401);
  });

  it('returns 404 for an unknown resource', async () => {
    const res = await request(createApp(sender))
      .post('/project/1/resource/6/contact')
      .send(validBody);
    expect(res.status).toBe(404);
  });

  it.each([
    ['without consent', { message: 'Hallo!' }],
    ['with an empty message', { message: '   ', consent: true }],
    ['with a too long message', { message: 'x'.repeat(2001), consent: true }],
    ['with an unknown handler', { ...validBody, handler: 'unknown' }],
  ])('rejects a message %s', async (_label, body) => {
    vi.spyOn(pluginExtensions, 'get').mockReturnValue({
      getContactHandler: () => null,
    });
    const res = await request(createApp(sender)).post(url).send(body);
    expect(res.status).toBe(422);
    expect(notifications).toEqual([]);
  });

  it('rejects a sender without email address', async () => {
    const res = await request(createApp({ ...sender, email: null }))
      .post(url)
      .send(validBody);
    expect(res.status).toBe(422);
  });

  it('rejects a submission without owner email', async () => {
    ownerRecord = { id: OWNER.id, email: null };
    const res = await request(createApp(sender)).post(url).send(validBody);
    expect(res.status).toBe(422);
    expect(notifications).toEqual([]);
  });

  it('mails the owner with the sender details', async () => {
    const res = await request(createApp(sender)).post(url).send(validBody);

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ sent: true });
    expect(notifications).toEqual([
      {
        type: 'contact message - user',
        projectId: 1,
        to: OWNER.email,
        data: {
          resourceId: 5,
          userId: OWNER.id,
          message: 'Hallo!',
          senderName: 'Angelo',
          senderEmail: 'sender@example.test',
        },
      },
    ]);
  });

  it('lets a plugin contact handler take over', async () => {
    const handle = vi.fn(async () => ({ requestId: 12 }));
    vi.spyOn(pluginExtensions, 'get').mockReturnValue({
      getContactHandler: (key) => (key === 'link-request' ? { handle } : null),
    });

    const res = await request(createApp(sender))
      .post(url)
      .send({
        ...validBody,
        handler: 'link-request',
        fields: { resourceId: 9 },
      });

    expect(res.body).toEqual({ handled: true, result: { requestId: 12 } });
    expect(handle).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'Hallo!',
        user: sender,
        fields: { resourceId: 9 },
      })
    );
    expect(notifications).toEqual([]);
  });
});
