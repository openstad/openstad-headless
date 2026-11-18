import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

process.env.NODE_CONFIG_DIR = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '../../config'
);
process.env.SUPPRESS_NO_CONFIG_WARNING = '1';

const require = createRequire(import.meta.url);
const db = require('../db');
const { CONTENT_CATALOG } = require('../notifications/content-catalog');

function customTemplate(values) {
  return db.NotificationTemplate.build({
    projectId: 1,
    label: 'Eigen versie',
    ...values,
  });
}

describe('NotificationTemplate content validation', () => {
  const { isNotificationContent } =
    db.NotificationTemplate.rawAttributes.content.validate;
  const { contentOnlyForContentTypes } =
    db.NotificationTemplate.options.validate;

  it('accepts the known text fields and the logo switch', () => {
    expect(() =>
      isNotificationContent({
        heading: 'Titel',
        intro: 'Tekst',
        buttonLabel: 'Knop',
        buttonUrl: '{{ redirectUrl }}',
        footer: 'Afsluiting',
        showLogo: false,
      })
    ).not.toThrow();
    expect(() => isNotificationContent(null)).not.toThrow();
  });

  it.each([
    [{ script: 'x' }, 'unknown field: script'],
    [{ heading: 5 }, 'content.heading must be a string'],
    [{ showLogo: 'ja' }, 'content.showLogo must be a boolean'],
    [['heading'], 'content must be an object'],
  ])('refuses %j', (content, message) => {
    expect(() => isNotificationContent(content)).toThrow(message);
  });

  it('only allows fields for mail types that have them', () => {
    const login = customTemplate({ type: 'login email', content: {} });
    const comment = customTemplate({
      type: 'notification comment - user',
      content: {},
    });
    const loginHtml = customTemplate({ type: 'login email', content: null });

    expect(() => contentOnlyForContentTypes.call(login)).toThrow(
      "Notification type 'login email' cannot be edited with fields"
    );
    expect(() => contentOnlyForContentTypes.call(comment)).not.toThrow();
    expect(() => contentOnlyForContentTypes.call(loginHtml)).not.toThrow();
  });
});

describe('NotificationMessage builds the mail from fields or html', () => {
  let storedTemplate;

  beforeEach(() => {
    storedTemplate = null;
    vi.spyOn(db.NotificationTemplate, 'findOne').mockImplementation(
      async () => storedTemplate
    );
    vi.spyOn(db.Project, 'scope').mockReturnValue({
      findByPk: async () =>
        db.Project.build({
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
        }),
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  async function renderMessage(type, data = {}) {
    const message = db.NotificationMessage.build({
      projectId: 1,
      engine: 'email',
      type,
      from: 'afzender@example.com',
      to: 'ontvanger@example.com',
    });
    await db.NotificationMessage.runHooks('beforeValidate', message, {
      data: { user: { name: 'Test Gebruiker' }, ...data },
    });
    return message;
  }

  it('builds a stored template with fields through the layout', async () => {
    const type = 'user account about to expire';
    storedTemplate = customTemplate({
      type,
      subject: 'Eigen onderwerp',
      body: '',
      content: {
        ...CONTENT_CATALOG[type].content,
        heading: 'Eigen titel voor {{ user.name }}',
      },
    });

    const message = await renderMessage(type);

    expect(message.subject).toBe('Eigen onderwerp');
    expect(message.body).toContain('Eigen titel voor Test Gebruiker');
    expect(message.body.toLowerCase()).toContain('#d32f2f');
  });

  it('keeps sending a stored html template as it is', async () => {
    const type = 'user account about to expire';
    storedTemplate = customTemplate({
      type,
      subject: 'Html onderwerp',
      body: '<mjml><mj-body><mj-section><mj-column><mj-text>EIGEN-HTML</mj-text></mj-column></mj-section></mj-body></mjml>',
      content: null,
    });

    const message = await renderMessage(type);

    expect(message.body).toContain('EIGEN-HTML');
    expect(message.body).not.toContain('We gaan je account verwijderen');
  });

  it('sends the catalog default when there is no stored template', async () => {
    const message = await renderMessage('user account about to expire');

    expect(message.subject).toBe('We gaan je account verwijderen');
    expect(message.body).toContain('We gaan je account verwijderen');
  });

  it('now has a default for the enquete mails', async () => {
    const message = await renderMessage('new enquete - user', {
      enqueteContent: '',
    });

    expect(message.subject).toBe('Bedankt voor het invullen van de enquête');
    expect(message.body).toContain(
      'Bedankt voor het invullen van onze enquête!'
    );
  });
});
