import { describe, expect, it } from 'vitest';

import {
  mergeEmailConfigSections,
  pickAllowedConfig,
  touchesSenderSections,
  validateEmailConfig,
} from './global-settings-validation.js';

const complete = {
  notifications: {
    fromAddress: 'notif@example.com',
    replyTo: 'reply@example.com',
  },
  login: { fromAddress: 'login@example.com' },
};

describe('validateEmailConfig', () => {
  it('accepts a config with every required address filled in', () => {
    expect(validateEmailConfig(complete)).toEqual([]);
  });

  it('reports every missing required field by its label', () => {
    expect(validateEmailConfig({})).toEqual([
      'Notification sender e-mailaddress is required',
      'Reply to notifications e-mailaddress is required',
      'Login Sender e-mailaddress is required',
    ]);
  });

  it('treats an empty string and whitespace as missing', () => {
    const errors = validateEmailConfig({
      ...complete,
      notifications: { fromAddress: '', replyTo: '   ' },
    });
    expect(errors).toEqual([
      'Notification sender e-mailaddress is required',
      'Reply to notifications e-mailaddress is required',
    ]);
  });

  it('rejects a value that is not an e-mail address', () => {
    const errors = validateEmailConfig({
      ...complete,
      login: { fromAddress: 'not-an-address' },
    });
    expect(errors).toEqual([
      'Login Sender e-mailaddress must be a valid e-mail address',
    ]);
  });

  it('does not throw when a whole section is missing', () => {
    expect(
      validateEmailConfig({ login: { fromAddress: 'login@example.com' } })
    ).toEqual([
      'Notification sender e-mailaddress is required',
      'Reply to notifications e-mailaddress is required',
    ]);
  });
});

describe('touchesSenderSections', () => {
  it('is true for a post that changes the notification senders', () => {
    expect(
      touchesSenderSections({ notifications: { fromAddress: 'a@b.nl' } })
    ).toBe(true);
  });

  it('is true for a post that changes the login senders', () => {
    expect(touchesSenderSections({ login: { fromName: 'Gemeente' } })).toBe(
      true
    );
  });

  // The notification styling form posts only this section. Requiring the sender
  // addresses there would block saving a logo before any address is filled in.
  it('is false for a styling only post', () => {
    expect(
      touchesSenderSections({ styling: { logo: 'https://x.nl/l.png' } })
    ).toBe(false);
  });

  it('is false for an empty or missing post', () => {
    expect(touchesSenderSections({})).toBe(false);
    expect(touchesSenderSections(undefined)).toBe(false);
  });

  it('is true as soon as one of the two sections rides along', () => {
    expect(
      touchesSenderSections({ styling: {}, login: { fromAddress: 'a@b.nl' } })
    ).toBe(true);
  });
});

describe('mergeEmailConfigSections', () => {
  it('keeps stored siblings when only one field of a section is posted', () => {
    const merged = mergeEmailConfigSections(complete, {
      notifications: { fromAddress: 'nieuw@example.com' },
    });
    expect(merged.notifications).toEqual({
      fromAddress: 'nieuw@example.com',
      replyTo: 'reply@example.com',
    });
    expect(merged.login).toEqual({ fromAddress: 'login@example.com' });
  });

  it('leaves untouched sections alone', () => {
    const merged = mergeEmailConfigSections(complete, {
      login: { fromAddress: 'anders@example.com' },
    });
    expect(merged.notifications).toEqual(complete.notifications);
  });

  it('a section posted as empty does not wipe the stored one', () => {
    const merged = mergeEmailConfigSections(complete, { notifications: {} });
    expect(merged.notifications).toEqual(complete.notifications);
  });

  it('handles an empty stored config', () => {
    expect(
      mergeEmailConfigSections(undefined, { login: { fromAddress: 'a@b.nl' } })
    ).toEqual({ login: { fromAddress: 'a@b.nl' } });
  });
});

describe('pickAllowedConfig', () => {
  it('keeps the styling section', () => {
    const { allowed, errors } = pickAllowedConfig({
      styling: { logo: 'https://x.nl/l.png' },
    });
    expect(allowed).toEqual({ styling: { logo: 'https://x.nl/l.png' } });
    expect(errors).toEqual([]);
  });

  it('rejects a key that belongs to a project instead of dropping it', () => {
    const { allowed, errors } = pickAllowedConfig({
      styling: { logo: 'https://x.nl/l.png' },
      allowedDomains: ['evil.nl'],
    });
    expect(allowed).toEqual({ styling: { logo: 'https://x.nl/l.png' } });
    expect(errors).toEqual([
      'Config key "allowedDomains" cannot be stored in the global settings',
    ]);
  });

  it('reports every rejected key', () => {
    const { errors } = pickAllowedConfig({ auth: {}, users: {} });
    expect(errors).toEqual([
      'Config key "auth" cannot be stored in the global settings',
      'Config key "users" cannot be stored in the global settings',
    ]);
  });

  it('handles an empty or missing config', () => {
    expect(pickAllowedConfig({})).toEqual({ allowed: {}, errors: [] });
    expect(pickAllowedConfig(undefined)).toEqual({ allowed: {}, errors: [] });
  });
});
