import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { afterEach, describe, expect, it, vi } from 'vitest';

process.env.NODE_CONFIG_DIR = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '../../config'
);
process.env.SUPPRESS_NO_CONFIG_WARNING = '1';

const require = createRequire(import.meta.url);
const db = require('../db');
const authSettings = require('../util/auth-settings');
const service = require('../adapter/openstad/service');
const projectController = require('../controllers/projectController');
const {
  authClientDefaults,
  emailConfigDefaults,
} = require('./global-settings');

const GLOBAL = {
  branding: {
    logo: 'https://example.com/logo.png',
    favicon: 'https://example.com/favicon.ico',
    accentColor: '#123456',
  },
  email: {
    login: {
      fromAddress: 'login@example.com',
      fromName: 'Gemeente',
      helpAddress: 'help@example.com',
    },
    notifications: {
      fromAddress: 'noreply@example.com',
      fromName: 'Gemeente Notificaties',
      replyTo: 'reply@example.com',
    },
  },
};

const EMPTY = { branding: {}, email: {} };

function useGlobalSettings(values) {
  const original = db.GlobalSettings.findByPk;
  db.GlobalSettings.findByPk = async () =>
    db.GlobalSettings.build({ id: 1, ...values }, { isNewRecord: false });
  return () => {
    db.GlobalSettings.findByPk = original;
  };
}

describe('global settings defaults', () => {
  it('maps the notification sender, reply-to and accent colour onto emailConfig', () => {
    expect(emailConfigDefaults(GLOBAL)).toEqual({
      notifications: {
        fromAddress: 'noreply@example.com',
        fromName: 'Gemeente Notificaties',
        replyTo: 'reply@example.com',
      },
      styling: { accentColor: '#123456' },
    });
  });

  it('maps the login sender, help address, logo and favicon onto the auth client', () => {
    expect(authClientDefaults(GLOBAL)).toEqual({
      fromEmail: 'login@example.com',
      fromName: 'Gemeente',
      contactEmail: 'help@example.com',
      styling: {
        logo: 'https://example.com/logo.png',
        favicon: 'https://example.com/favicon.ico',
      },
    });
  });

  it('leaves out values that are not filled in', () => {
    expect(emailConfigDefaults(EMPTY)).toEqual({
      notifications: {},
      styling: {},
    });
    expect(authClientDefaults(EMPTY)).toEqual({ styling: {} });
  });
});

describe('applyGlobalSettings', () => {
  let restore;
  afterEach(() => restore?.());

  async function apply(body) {
    const req = { body };
    const next = vi.fn();
    await projectController.applyGlobalSettings(req, {}, next);
    return { req, next };
  }

  it('gives a new project the global e-mail settings', async () => {
    restore = useGlobalSettings(GLOBAL);

    const { req, next } = await apply({ name: 'Nieuw' });

    expect(next).toHaveBeenCalledWith();
    expect(req.body.emailConfig.notifications).toEqual(
      GLOBAL.email.notifications
    );
    expect(req.body.emailConfig.styling).toEqual({ accentColor: '#123456' });
  });

  it('keeps the values the request brings along', async () => {
    restore = useGlobalSettings(GLOBAL);

    const { req } = await apply({
      emailConfig: {
        notifications: { fromAddress: 'template@example.com' },
        styling: { accentColor: '#ABCDEF' },
      },
    });

    expect(req.body.emailConfig.notifications).toEqual({
      fromAddress: 'template@example.com',
      fromName: 'Gemeente Notificaties',
      replyTo: 'reply@example.com',
    });
    expect(req.body.emailConfig.styling.accentColor).toBe('#ABCDEF');
  });

  it('stops the project creation when the global settings cannot be read', async () => {
    const original = db.GlobalSettings.findByPk;
    db.GlobalSettings.findByPk = async () => null;
    restore = () => {
      db.GlobalSettings.findByPk = original;
    };

    const { next } = await apply({ name: 'Nieuw' });

    expect(next).toHaveBeenCalledWith(
      expect.objectContaining({
        message: expect.stringContaining('global settings row is missing'),
      })
    );
  });
});

describe('service.createClient', () => {
  let restore;
  afterEach(() => {
    restore?.();
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  async function createdClientConfig(projectConfig) {
    const fetch = vi.fn(async () => ({
      ok: true,
      json: async () => ({ clientId: 'id', clientSecret: 'secret' }),
    }));
    vi.stubGlobal('fetch', fetch);
    vi.spyOn(db.Project, 'findByPk').mockResolvedValue({ id: 1, config: {} });
    vi.spyOn(authSettings, 'config').mockResolvedValue({
      clientId: 'admin',
      clientSecret: 'secret',
      serverUrlInternal: 'http://auth',
    });

    await service.createClient({
      authConfig: { provider: 'openstad' },
      project: { name: 'Nieuw', config: projectConfig },
    });

    return JSON.parse(fetch.mock.calls[0][1].body).config;
  }

  it('gives the new auth client the global login sender, logo and favicon', async () => {
    restore = useGlobalSettings(GLOBAL);

    const clientConfig = await createdClientConfig({});

    expect(clientConfig.fromEmail).toBe('login@example.com');
    expect(clientConfig.fromName).toBe('Gemeente');
    expect(clientConfig.contactEmail).toBe('help@example.com');
    expect(clientConfig.styling.logo).toBe('https://example.com/logo.png');
    expect(clientConfig.styling.favicon).toBe(
      'https://example.com/favicon.ico'
    );
  });

  it('keeps a logo the project brings along', async () => {
    restore = useGlobalSettings(GLOBAL);

    const clientConfig = await createdClientConfig({
      styling: { logo: 'https://example.com/own.png' },
    });

    expect(clientConfig.styling.logo).toBe('https://example.com/own.png');
  });
});
