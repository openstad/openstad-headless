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
const widgetRouter = require('./widget');

let widget;

db.Widget.findOne = async () => widget;

function createApp() {
  const app = express();
  app.use('/widget', widgetRouter);
  app.use((err, req, res, next) => {
    res.status(err.status || 500).json({ error: err.message });
  });
  return app;
}

describe('GET widget script', () => {
  beforeEach(() => {
    widget = null;
  });

  it('returns 404 when the widget belongs to an archived project', async () => {
    widget = { id: 5, type: 'enquete', config: {}, project: null };

    const res = await request(createApp()).get('/widget/5');

    expect(res.status).toBe(404);
  });

  it('returns 500 instead of crashing when building the widget script fails', async () => {
    widget = {
      id: 5,
      type: 'enquete',
      config: {},
      project: {
        get config() {
          throw new Error('broken project config');
        },
      },
    };

    const res = await request(createApp()).get('/widget/5');

    expect(res.status).toBe(500);
  });
});
