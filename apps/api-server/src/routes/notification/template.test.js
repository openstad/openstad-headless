import express from 'express';
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import request from 'supertest';
import { afterEach, describe, expect, it, vi } from 'vitest';

process.env.NODE_CONFIG_DIR = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '../../../config'
);
process.env.SUPPRESS_NO_CONFIG_WARNING = '1';

const require = createRequire(import.meta.url);
const db = require('../../db');
const templateRouter = require('./template');

function createApp(user) {
  const app = express();
  app.use((req, res, next) => {
    req.user = user;
    req.project = { id: 1 };
    next();
  });
  app.use('/project/:projectId(\\d+)/template', templateRouter);
  app.use((err, req, res, next) => {
    res.status(err.status || 500).json({ error: err.message });
  });
  return app;
}

const editor = { id: 1, role: 'editor' };

describe('default notification template', () => {
  it('returns the default template of a core type', async () => {
    const res = await request(createApp(editor)).get(
      '/project/1/template/default/contact%20message%20-%20user'
    );

    expect(res.status).toBe(200);
    expect(res.body.type).toBe('contact message - user');
    expect(res.body.subject).toBe('Bericht ontvangen over een inzending');
    expect(res.body.body).toContain('{{senderName}}');
  });

  it('answers 404 for a type without a default template', async () => {
    const res = await request(createApp(editor)).get(
      '/project/1/template/default/onbekend%20type'
    );

    expect(res.status).toBe(404);
  });

  it('does not return the template to someone without rights', async () => {
    const res = await request(createApp({ id: 2, role: 'member' })).get(
      '/project/1/template/default/contact%20message%20-%20user'
    );

    expect(res.status).not.toBe(200);
    expect(res.body.subject).toBeUndefined();
  });
});

describe('mail styling for the preview', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  function withProject(emailConfig) {
    const project = db.Project.build({ id: 1, config: {}, emailConfig });
    return vi.spyOn(db.Project, 'scope').mockReturnValue({
      findByPk: async () => project,
    });
  }

  it('returns the logo and accent color the mail will use', async () => {
    const scope = withProject({
      styling: {
        logo: 'https://example.com/brand.png',
        accentColor: '#d32f2f',
      },
    });

    const res = await request(createApp(editor)).get(
      '/project/1/template/styling'
    );

    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      logo: 'https://example.com/brand.png',
      accentColor: '#d32f2f',
    });
    expect(scope).toHaveBeenCalledWith('includeConfig', 'includeEmailConfig');
  });

  it('does not return the styling to someone without rights', async () => {
    withProject({ styling: { logo: 'https://example.com/brand.png' } });

    const res = await request(createApp({ id: 2, role: 'member' })).get(
      '/project/1/template/styling'
    );

    expect(res.status).not.toBe(200);
    expect(res.body.logo).toBeUndefined();
  });
});
