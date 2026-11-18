import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { afterEach, describe, expect, it, vi } from 'vitest';

process.env.NODE_CONFIG_DIR = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '../../../config'
);
process.env.SUPPRESS_NO_CONFIG_WARNING = '1';

const require = createRequire(import.meta.url);
const nodemailer = require('nodemailer');
const db = require('../../db');
const sendEngines = require('./index');
const sendEmail = require('./email');

const message = {
  from: 'noreply@example.com',
  to: 'user@example.com',
  subject: 'Onderwerp',
  body: '<p>Hallo</p>',
};

function captureSentMail() {
  const sendMail = vi.fn(async () => ({}));
  vi.spyOn(nodemailer, 'createTransport').mockReturnValue({ sendMail });
  return sendMail;
}

describe('email send engine', () => {
  afterEach(() => vi.restoreAllMocks());

  it('adds a Reply-To when one is given', async () => {
    const sendMail = captureSentMail();

    await sendEmail({ message, replyTo: 'reply@example.com' });

    expect(sendMail.mock.calls[0][0].replyTo).toBe('reply@example.com');
  });

  it('leaves Reply-To out when none is given', async () => {
    const sendMail = captureSentMail();

    await sendEmail({ message });

    expect(sendMail.mock.calls[0][0]).not.toHaveProperty('replyTo');
  });
});

describe('NotificationMessage.send', () => {
  afterEach(() => vi.restoreAllMocks());

  function storedMessage(projectId) {
    const notificationMessage = db.NotificationMessage.build(
      { id: 1, projectId, engine: 'email', type: 'action', ...message },
      { isNewRecord: false }
    );
    notificationMessage.update = vi.fn(async () => notificationMessage);
    return notificationMessage;
  }

  function projectWithReplyTo(replyTo) {
    const findByPk = vi.fn(async () => ({
      emailConfig: { notifications: { replyTo } },
    }));
    vi.spyOn(db.Project, 'scope').mockReturnValue({ findByPk });
    return findByPk;
  }

  it("passes the project's reply-to address to the send engine", async () => {
    const findByPk = projectWithReplyTo('reply@example.com');
    const engine = vi.spyOn(sendEngines, 'email').mockResolvedValue();

    await storedMessage(7).send();

    expect(findByPk).toHaveBeenCalledWith(7);
    expect(engine.mock.calls[0][0].replyTo).toBe('reply@example.com');
  });

  it('passes no reply-to when the project has none', async () => {
    projectWithReplyTo('');
    const engine = vi.spyOn(sendEngines, 'email').mockResolvedValue();

    await storedMessage(7).send();

    expect(engine.mock.calls[0][0].replyTo).toBeUndefined();
  });
});
