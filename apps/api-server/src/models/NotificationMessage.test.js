import { describe, expect, it } from 'vitest';

import notificationMessageModel from './NotificationMessage.js';

const { renderTemplate, loadDefaultTemplate } = notificationMessageModel;

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
});
