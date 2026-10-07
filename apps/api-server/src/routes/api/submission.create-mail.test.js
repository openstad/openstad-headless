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
const submissionRouter = require('./submission');

const notificationCreate = vi.fn(async () => ({}));
let widget;

db.Notification.create = notificationCreate;
db.Submission.create = async (data) => ({
  id: 11,
  ...data,
  toJSON: () => ({ id: 11 }),
});
db.Widget.findOne = vi.fn(async ({ where }) =>
  widget && widget.id == where.id && widget.projectId == where.projectId
    ? widget
    : null
);

function createApp() {
  const app = express();
  app.use(express.json());
  app.use((req, res, next) => {
    req.user = { role: 'anonymous', id: null };
    req.project = { id: 1, config: {} };
    next();
  });
  app.use('/project/:projectId(\\d+)/submission', submissionRouter);
  app.use((err, req, res, next) => {
    res.status(err.status || 500).json({ error: err.message });
  });
  return app;
}

const submit = (widgetId) =>
  request(createApp())
    .post('/project/1/submission')
    .send({
      widgetId,
      submittedData: {
        answer: 'x',
        confirmationAdmin: true,
        overwriteEmailAddress: 'victim@example.com',
      },
    });

const adminMail = async () => {
  await vi.waitFor(() => expect(notificationCreate).toHaveBeenCalled());
  return notificationCreate.mock.calls.find(
    ([n]) => n.type === 'new enquete - admin'
  )[0];
};

describe('POST submission admin confirmation recipients', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    widget = {
      id: 4,
      projectId: 1,
      config: { confirmation: { overwriteEmailAddress: 'beheer@example.nl' } },
    };
  });

  it('uses the recipients from the widget config, not from the request', async () => {
    await submit(4);

    expect((await adminMail()).data.emailReceivers).toEqual([
      'beheer@example.nl',
    ]);
  });

  it('falls back to the project default without a known widget', async () => {
    await submit(999);

    expect((await adminMail()).data.emailReceivers).toBeUndefined();
  });
});
