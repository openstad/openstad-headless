import fs from 'fs/promises';
import path from 'path';
import { describe, expect, it } from 'vitest';

import notificationMessageModel from './NotificationMessage.js';

const { renderTemplate, loadDefaultTemplate } = notificationMessageModel;

const validTemplate = {
  subject: 'Hallo {{user.name}}',
  body: '<mjml><mj-body><mj-section><mj-column><mj-text>Beste {{user.name}}</mj-text></mj-column></mj-section></mj-body></mjml>',
};

const templateData = { user: { name: 'Test Gebruiker' } };

const TEMPLATES_DIR = path.join(
  __dirname,
  '../notifications/default-templates'
);

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
