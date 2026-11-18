import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

// email.js is CommonJS, so stub the transport on the shared module object
// instead of through vi.mock (which only intercepts ESM imports).
const nodemailer = require('nodemailer');
const sendMail = vi.fn((message, callback) =>
  callback(null, { messageId: 'test' })
);
nodemailer.createTransport = () => ({ sendMail });

const email = require('./email');

const CANARY = 'globalThis.__emailTemplateCanary = true; return 1';

describe('email.send with a client-provided templateString', () => {
  beforeEach(() => {
    sendMail.mockClear();
  });

  afterEach(() => {
    delete globalThis.__emailTemplateCanary;
  });

  test('does not execute code embedded in the template', async () => {
    const templateString =
      '<mjml><mj-body><mj-section><mj-column><mj-text>' +
      `{{ range.constructor("${CANARY}")() }}` +
      '</mj-text></mj-column></mj-section></mj-body></mjml>';

    await email
      .send({ toEmail: 'a@example.org', templateString, variables: {} })
      .catch(() => {});

    expect(globalThis.__emailTemplateCanary).toBeUndefined();
  });

  test('strips Sequelize methods from variables via toPlainData', async () => {
    const templateString =
      '<mjml><mj-body><mj-section><mj-column><mj-text>' +
      '{{ user.name }}' +
      '</mj-text></mj-column></mj-section></mj-body></mjml>';

    const user = {
      sequelize: { query: () => (globalThis.__emailTemplateCanary = true) },
      get: ({ plain }) => (plain ? { name: 'Alice' } : null),
      destroy: () => (globalThis.__emailTemplateCanary = true),
    };

    await email
      .send({ toEmail: 'a@example.org', templateString, variables: { user } })
      .catch(() => {});

    expect(globalThis.__emailTemplateCanary).toBeUndefined();
    expect(sendMail).toHaveBeenCalledTimes(1);
    expect(sendMail.mock.calls[0][0].html).toContain('Alice');
  });

  test('still renders variables and the shared layout', async () => {
    const templateString =
      "{% extends 'emails/layout.html' %}" +
      '{% block body %}<mj-section><mj-column><mj-text>' +
      'Hi {{ name }}, {{ tokenUrl }}' +
      '</mj-text></mj-column></mj-section>{% endblock %}';

    await email.send({
      toEmail: 'a@example.org',
      templateString,
      variables: { name: 'Test', tokenUrl: 'https://example.org/login' },
    });

    expect(sendMail).toHaveBeenCalledTimes(1);
    expect(sendMail.mock.calls[0][0].html).toContain(
      'Hi Test, https://example.org/login'
    );
  });
});
