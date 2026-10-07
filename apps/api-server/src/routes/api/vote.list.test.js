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
const voteRouter = require('./vote');

const PROJECT_ID = 1;
const VOTER = 6168;
const OTHER = 7380;

let lastQuery = null;

db.Vote.scope = () => ({
  findAndCountAll: async (query) => {
    lastQuery = query;
    const rows = [
      { id: 1, resourceId: 10, userId: VOTER, opinion: 'yes', ip: '1.2.3.4' },
      { id: 2, resourceId: 10, userId: OTHER, opinion: 'no', ip: '5.6.7.8' },
    ];
    return { rows, count: rows.length };
  },
});

function createApp(user) {
  const app = express();
  app.use((req, res, next) => {
    req.user = user;
    req.project = { id: PROJECT_ID, config: { votes: { isViewable: true } } };
    req.dbQuery = {};
    next();
  });
  app.use('/project/:projectId(\\d+)/vote', voteRouter);
  app.use((err, req, res, next) => {
    res.status(err.status || 500).json({ error: err.message });
  });
  return app;
}

const url = `/project/${PROJECT_ID}/vote`;
const anonymous = { role: 'anonymous' };
const member = { role: 'member', id: VOTER };
const admin = { role: 'admin', id: 1 };

describe('vote list privacy', () => {
  beforeEach(() => {
    lastQuery = null;
  });

  it('hides userId and ip from anonymous visitors', async () => {
    const res = await request(createApp(anonymous)).get(url);

    expect(res.status).toBe(200);
    res.body.forEach((vote) => {
      expect(vote).not.toHaveProperty('userId');
      expect(vote).not.toHaveProperty('ip');
    });
  });

  it('only shows a member their own userId', async () => {
    const res = await request(createApp(member)).get(url);

    expect(res.body.find((v) => v.id === 1).userId).toBe(VOTER);
    expect(res.body.find((v) => v.id === 2)).not.toHaveProperty('userId');
  });

  it('rejects filtering on another user', async () => {
    const anon = await request(createApp(anonymous)).get(
      `${url}?userId=${VOTER}`
    );
    const other = await request(createApp(member)).get(
      `${url}?userId=${OTHER}`
    );

    expect(anon.status).toBe(403);
    expect(other.status).toBe(403);
  });

  it('allows a member to filter on their own userId', async () => {
    const res = await request(createApp(member)).get(`${url}?userId=${VOTER}`);

    expect(res.status).toBe(200);
    expect(lastQuery.where.userId).toBe(VOTER);
  });

  it('ignores ip filter and private sort fields for non-moderators', async () => {
    await request(createApp(anonymous)).get(`${url}?ip=1.2&sortBy=ip`);

    expect(lastQuery.where).not.toHaveProperty('ip');
    expect(lastQuery.order).toEqual([]);
  });

  it('keeps full access for admins', async () => {
    const res = await request(createApp(admin)).get(
      `${url}?userId=${OTHER}&ip=5.6&sortBy=ip&orderBy=desc`
    );

    expect(res.status).toBe(200);
    expect(lastQuery.where.userId).toBe(OTHER);
    expect(lastQuery.where).toHaveProperty('ip');
    expect(lastQuery.order).toEqual([['ip', 'DESC']]);
    expect(res.body[0].userId).toBe(VOTER);
    expect(res.body[0].ip).toBe('1.2.3.4');
  });
});
