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
const authSettings = require('../util/auth-settings');

let updateClient;

beforeEach(() => {
  updateClient = vi.fn().mockResolvedValue(undefined);
  vi.spyOn(db.Project, 'findByPk').mockResolvedValue(
    db.Project.build({ id: 1, name: 'Voorbeeldproject', config: {} })
  );
  vi.spyOn(authSettings, 'providers').mockResolvedValue(['openstad']);
  vi.spyOn(authSettings, 'configForClientUpdate').mockResolvedValue({
    config: { Url: { emailTemplate: 'oud', emailSubject: 'oud' } },
  });
  vi.spyOn(authSettings, 'adapter').mockResolvedValue({
    service: { updateClient },
  });
});

afterEach(() => {
  vi.restoreAllMocks();
});

function template(type) {
  return db.NotificationTemplate.build({
    id: 7,
    projectId: 1,
    type,
    label: 'Test',
    subject: 'Eigen onderwerp',
    body: '<mjml>eigen</mjml>',
  });
}

describe('NotificationTemplate and the auth client', () => {
  it('clears the login mail on the auth client when the template is removed', async () => {
    await db.NotificationTemplate.runHooks(
      'afterDestroy',
      template('login email'),
      {}
    );

    expect(updateClient).toHaveBeenCalledTimes(1);
    const { authConfig } = updateClient.mock.calls[0][0];
    expect(authConfig.config.Url).toEqual({
      emailTemplate: '',
      emailSubject: '',
    });
  });

  it('still sends the saved login mail to the auth client', async () => {
    await db.NotificationTemplate.runHooks(
      'afterUpdate',
      template('login email'),
      {}
    );

    const { authConfig } = updateClient.mock.calls[0][0];
    expect(authConfig.config.Url).toEqual({
      emailTemplate: '<mjml>eigen</mjml>',
      emailSubject: 'Eigen onderwerp',
    });
  });

  it('leaves the auth client alone for other mail types', async () => {
    await db.NotificationTemplate.runHooks(
      'afterDestroy',
      template('user account about to expire'),
      {}
    );

    expect(updateClient).not.toHaveBeenCalled();
  });
});
