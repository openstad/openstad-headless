import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

process.env.NODE_CONFIG_DIR = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '../../config'
);
process.env.SUPPRESS_NO_CONFIG_WARNING = '1';

const require = createRequire(import.meta.url);
const db = require('../db');

const VALID_EMAIL = {
  login: {
    fromAddress: 'login@example.com',
    fromName: 'Gemeente',
    helpAddress: 'help@example.com',
  },
  notifications: {
    fromAddress: 'noreply@example.com',
    fromName: 'Gemeente',
    replyTo: 'reply@example.com',
  },
};

function storedSettings() {
  return db.GlobalSettings.build(
    { id: 1, branding: {}, email: {} },
    { isNewRecord: false }
  );
}

describe('GlobalSettings validation', () => {
  const { isBranding } = db.GlobalSettings.rawAttributes.branding.validate;
  const { isEmailSettings } = db.GlobalSettings.rawAttributes.email.validate;

  it('accepts complete branding and e-mail settings', () => {
    expect(() =>
      isBranding({
        logo: 'https://example.com/logo.png',
        favicon: 'https://example.com/favicon.ico',
        accentColor: '#00325F',
      })
    ).not.toThrow();
    expect(() => isBranding({ accentColor: '' })).not.toThrow();
    expect(() => isEmailSettings(VALID_EMAIL)).not.toThrow();
  });

  it.each([
    [{ script: 'x' }, 'branding contains an unknown field: script'],
    [{ logo: 5 }, 'branding.logo must be a string'],
    [{ accentColor: 'blue' }, 'De accentkleur moet een kleurcode zijn'],
    [['logo'], 'branding must be an object'],
  ])('refuses branding %j', (branding, message) => {
    expect(() => isBranding(branding)).toThrow(message);
  });

  it.each([
    [{ ...VALID_EMAIL, extra: {} }, 'email contains an unknown section: extra'],
    [
      {
        ...VALID_EMAIL,
        login: { ...VALID_EMAIL.login, password: 'x' },
      },
      'email.login contains an unknown field: password',
    ],
    [
      { ...VALID_EMAIL, login: { ...VALID_EMAIL.login, fromAddress: '' } },
      'Het afzenderadres van de inlogmails is verplicht',
    ],
    [
      { login: VALID_EMAIL.login },
      'Het afzenderadres van de notificaties is verplicht',
    ],
    [
      {
        ...VALID_EMAIL,
        notifications: { ...VALID_EMAIL.notifications, replyTo: 'geen-adres' },
      },
      'Vul een geldig e-mailadres in voor het reply-to adres',
    ],
  ])('refuses e-mail settings %#', (email, message) => {
    expect(() => isEmailSettings(email)).toThrow(message);
  });

  it('saves branding while the e-mail settings are still empty', async () => {
    const settings = storedSettings();
    settings.set({ branding: { accentColor: '#123456' } });

    await expect(
      settings.validate({ fields: ['branding'] })
    ).resolves.not.toThrow();
  });

  it('refuses e-mail settings without the required senders on save', async () => {
    const settings = storedSettings();
    settings.set({ email: { login: { fromName: 'Gemeente' } } });

    await expect(settings.validate({ fields: ['email'] })).rejects.toThrow(
      'Het afzenderadres van de inlogmails is verplicht'
    );
  });
});
