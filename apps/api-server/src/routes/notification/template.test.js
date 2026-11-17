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
  app.use(express.json());
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

describe('preview of a notification template', () => {
  const fs = require('fs');
  const defaultTemplatesDir = require('path').join(
    __dirname,
    '../../notifications/default-templates'
  );

  function defaultTemplate(type) {
    const file = fs
      .readFileSync(require('path').join(defaultTemplatesDir, type))
      .toString();
    return {
      subject: file.match(/<subject>([\s\S]*)<\/subject>/)[1],
      body: file.match(/<body>([\s\S]*)<\/body>/)[1],
    };
  }

  afterEach(() => {
    vi.restoreAllMocks();
  });

  function withProject() {
    const project = db.Project.build({
      id: 1,
      name: 'Voorbeeldproject',
      title: 'Voorbeeldproject',
      config: {},
      emailConfig: {
        styling: {
          logo: 'https://example.com/brand.png',
          accentColor: '#d32f2f',
        },
      },
    });
    vi.spyOn(db.Project, 'scope').mockReturnValue({
      findByPk: async () => project,
    });
  }

  function preview(user, payload) {
    return request(createApp(user))
      .post('/project/1/template/preview')
      .send(payload);
  }

  it('renders a default mail with sample data and the project styling', async () => {
    withProject();
    const type = 'new published resource - user feedback';

    const res = await preview(editor, {
      type,
      engine: 'email',
      ...defaultTemplate(type),
    });

    expect(res.status).toBe(200);
    expect(res.body.subject).toBe('Nieuwe inzending op Voorbeeldproject');
    expect(res.body.html).toContain('src="https://example.com/brand.png"');
    expect(res.body.html.toLowerCase()).toContain('#d32f2f');
    expect(res.body.html).toContain('Meer bomen in de straat');
  });

  it('greets the user by name in the login mail', async () => {
    withProject();

    const res = await preview(editor, {
      type: 'login email',
      engine: 'email',
      ...defaultTemplate('login email'),
    });

    expect(res.status).toBe(200);
    expect(res.body.html).toContain('Beste Voorbeeld Gebruiker');
    expect(res.body.html).not.toContain('[object Object]');
  });

  it('returns plain text for an sms', async () => {
    withProject();

    const res = await preview(editor, {
      type: 'login sms',
      engine: 'sms',
      subject: '',
      body: 'Je code is {{ code }}',
    });

    expect(res.status).toBe(200);
    expect(res.body.text).toBe('Je code is 123456');
  });

  it('answers 400 for a template that cannot be rendered', async () => {
    withProject();

    const res = await preview(editor, {
      type: 'user account about to expire',
      engine: 'email',
      subject: 'Test',
      body: '<mjml><mj-body>{% if %}</mj-body></mjml>',
    });

    expect(res.status).toBe(400);
    expect(res.body.error).toContain('De template kan niet worden gerenderd');
  });

  it('does not run code injected into the template', async () => {
    withProject();

    const res = await preview(editor, {
      type: 'user account about to expire',
      engine: 'email',
      subject: '{{ constructor.constructor("return 6*7")() }}',
      body: '<mjml><mj-body><mj-section><mj-column><mj-text>x</mj-text></mj-column></mj-section></mj-body></mjml>',
    });

    expect(JSON.stringify(res.body)).not.toContain('42');
  });

  it('answers 400 for an unknown engine', async () => {
    withProject();

    const res = await preview(editor, {
      type: 'login email',
      engine: 'fax',
      subject: '',
      body: '',
    });

    expect(res.status).toBe(400);
  });

  it('does not render a preview for someone without rights', async () => {
    withProject();

    const res = await preview(
      { id: 2, role: 'member' },
      { type: 'login email', engine: 'email', subject: 'x', body: 'x' }
    );

    expect(res.status).not.toBe(200);
    expect(res.body.html).toBeUndefined();
  });
});
