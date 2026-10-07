import express from 'express';
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import request from 'supertest';
import { beforeEach, describe, expect, it, vi } from 'vitest';

process.env.NODE_CONFIG_DIR = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '../../../config'
);
process.env.SUPPRESS_NO_CONFIG_WARNING = '1';

const require = createRequire(import.meta.url);
const db = require('../../db');
const commentRouter = require('./comment');

const notificationCreate = vi.fn(async () => ({}));
let widgets;

function createdComment() {
  return db.Comment.build({
    id: 42,
    resourceId: 5,
    userId: 7,
    sentiment: 'no sentiment',
    description: 'x',
  });
}

db.Notification.create = notificationCreate;
db.Comment.create = async () => createdComment();
db.Comment.scope = () => ({ findByPk: async () => createdComment() });
db.Resource.scope = () => ({
  findByPk: async () => ({ projectId: 1, auth: { canComment: () => true } }),
});
// The resource owner has not consented to notifications.
db.Resource.findByPk = async () => ({ id: 5, userId: 3 });
db.User.findByPk = async () => ({ id: 3, email: 'owner@example.com' });
db.Project.unscoped = () => ({ findByPk: async () => null });
db.Widget.findOne = async ({ where }) =>
  widgets.find((w) => w.id == where.id && w.projectId == where.projectId) ||
  null;

function createApp() {
  const app = express();
  app.use(express.json());
  app.use((req, res, next) => {
    req.user = { role: 'member', id: 7 };
    req.project = { id: 1, config: {} };
    next();
  });
  app.use(
    '/project/:projectId(\\d+)/resource/:resourceId(\\d+)/comment',
    commentRouter
  );
  return app;
}

const post = (body) =>
  request(createApp())
    .post('/project/1/resource/5/comment')
    .send({ description: 'x', confirmation: true, ...body });

const receivers = () => notificationCreate.mock.calls.map(([n]) => n.to);

describe('POST comment confirmation recipient', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    widgets = [
      {
        id: 4,
        projectId: 1,
        config: { overwriteEmailAddress: 'a@example.nl' },
      },
      {
        id: 6,
        projectId: 1,
        config: { commentsWidget: { overwriteEmailAddress: 'b@example.nl' } },
      },
      {
        id: 8,
        projectId: 2,
        config: { overwriteEmailAddress: 'c@example.nl' },
      },
    ];
  });

  it('ignores an address chosen by the caller', async () => {
    await post({ overwriteEmailAddress: 'victim@example.com' });

    expect(receivers()).not.toContain('victim@example.com');
  });

  it('uses the address from the comments widget config', async () => {
    await post({ widgetId: 4, overwriteEmailAddress: 'victim@example.com' });

    await vi.waitFor(() => expect(receivers()).toEqual(['a@example.nl']));
  });

  it('uses the address from a nested comments config', async () => {
    await post({ widgetId: 6 });

    await vi.waitFor(() => expect(receivers()).toEqual(['b@example.nl']));
  });

  it('sends nothing (no owner fallback) when an address was configured but the widget is unknown', async () => {
    db.User.findByPk = vi.fn(async () => ({
      id: 3,
      email: 'owner@example.com',
      emailNotificationConsent: true,
    }));

    await post({ overwriteEmailAddress: 'beheer@example.nl' });

    expect(db.User.findByPk).not.toHaveBeenCalled();
    expect(notificationCreate).not.toHaveBeenCalled();
  });

  it('ignores widgets of other projects', async () => {
    await post({ widgetId: 8 });

    expect(receivers()).not.toContain('c@example.nl');
  });
});
