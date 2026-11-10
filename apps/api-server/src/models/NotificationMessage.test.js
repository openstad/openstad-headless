import fs from 'node:fs/promises';
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it, vi } from 'vitest';

import notificationMessageModel from './NotificationMessage.js';

const require = createRequire(import.meta.url);
const pluginExtensions = require('../services/plugin-extensions');
const { buildExtensions } = pluginExtensions;
const { resolvePluginFile } = require('@openstad-headless/plugin-loader');

const { renderTemplate, loadDefaultTemplate } = notificationMessageModel;

const fixtureDir = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '../services/test-fixtures/links-plugin'
);
const fixturePlugin = {
  name: 'links-fixture',
  config: {},
  dir: fixtureDir,
  api: require('../services/test-fixtures/links-plugin').manifest.api,
};

const validTemplate = {
  subject: 'Hallo {{user.name}}',
  body: '<mjml><mj-body><mj-section><mj-column><mj-text>Beste {{user.name}}</mj-text></mj-column></mj-section></mj-body></mjml>',
};

const templateData = { user: { name: 'Test Gebruiker' } };

describe('renderTemplate', () => {
  it('renders subject and mjml body for the email engine', async () => {
    const rendered = await renderTemplate(validTemplate, templateData, {
      engine: 'email',
      type: 'test',
      projectId: 1,
    });

    expect(rendered.subject).toBe('Hallo Test Gebruiker');
    expect(rendered.body).toContain('<html');
    expect(rendered.body).toContain('Beste Test Gebruiker');
  });

  it('throws for the email engine when the body is not valid mjml', async () => {
    const brokenTemplate = {
      subject: 'Hallo',
      body: 'gewoon platte tekst zonder mjml',
    };

    await expect(
      renderTemplate(brokenTemplate, templateData, {
        engine: 'email',
        type: 'test',
        projectId: 1,
      })
    ).rejects.toThrow();
  });

  it('returns the rendered body as-is for the sms engine', async () => {
    const smsTemplate = {
      subject: 'login sms',
      body: 'Je code is {{code}}.',
    };

    const rendered = await renderTemplate(
      smsTemplate,
      { code: '1234' },
      { engine: 'sms', type: 'login sms', projectId: 1 }
    );

    expect(rendered.body).toBe('Je code is 1234.');
  });
});

describe('loadDefaultTemplate', () => {
  it('is exported for use in the render fallback', () => {
    expect(typeof loadDefaultTemplate).toBe('function');
  });

  it('loads a core default template', async () => {
    const template = await loadDefaultTemplate('login email');
    expect(template.subject).toBeTruthy();
    expect(template.body).toContain('<mjml');
  });

  it('returns null for an unknown type', async () => {
    expect(await loadDefaultTemplate('does not exist')).toBeNull();
  });

  it('loads the template of a plugin notification type', async () => {
    const getSpy = vi
      .spyOn(pluginExtensions, 'get')
      .mockReturnValue(buildExtensions([fixturePlugin], {}, resolvePluginFile));

    const template = await loadDefaultTemplate('link invitation - user');
    getSpy.mockRestore();

    expect(template.subject).toBe('Fixture uitnodiging ontvangen');
    expect(template.body).toContain('Fixture template voor een uitnodiging.');
  });
});

const TEMPLATES_DIR = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  '../notifications/default-templates'
);

describe('default templates for comment notifications', () => {
  it.each(['notification comment - user', 'notification comment reply - user'])(
    'resolves a non-empty subject and body for %s',
    async (type) => {
      const template = await loadDefaultTemplate(type);

      expect(template).not.toBeNull();
      expect(template.subject.trim().length).toBeGreaterThan(0);
      expect(template.body.trim().length).toBeGreaterThan(0);
    }
  );
});

describe('default-templates shape', () => {
  it('has exactly one <subject> and one <body>, both non-empty, in every file', async () => {
    const files = await fs.readdir(TEMPLATES_DIR);
    expect(files.length).toBeGreaterThan(0);

    for (const file of files) {
      const content = (
        await fs.readFile(path.join(TEMPLATES_DIR, file))
      ).toString();

      expect((content.match(/<subject>/g) || []).length, file).toBe(1);
      expect((content.match(/<\/subject>/g) || []).length, file).toBe(1);
      expect((content.match(/<body>/g) || []).length, file).toBe(1);
      expect((content.match(/<\/body>/g) || []).length, file).toBe(1);

      const template = await loadDefaultTemplate(file);
      expect(template, file).not.toBeNull();
      expect(template.subject.trim().length, file).toBeGreaterThan(0);
      expect(template.body.trim().length, file).toBeGreaterThan(0);
    }
  });
});
