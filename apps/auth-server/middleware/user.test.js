import { createRequire } from 'node:module';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const require = createRequire(import.meta.url);
const db = require('../db');
const { update } = require('./user');

const userObject = (overrides = {}) => ({
  emailNotificationConsent: { 3: true },
  privacyConsentAt: { 3: '2026-01-01T00:00:00.000Z' },
  update: vi.fn(async (data) => ({ ...data })),
  ...overrides,
});

const run = (body, user) =>
  new Promise((resolve, reject) => {
    const req = { body, userObject: user };
    update(req, {}, (err) => (err ? reject(err) : resolve(user.update)));
  });

beforeEach(() => {
  vi.spyOn(db.Client, 'findOne').mockResolvedValue({ id: 7 });
});

afterEach(() => vi.restoreAllMocks());

describe('userMw.update client consents', () => {
  it('adds a privacy consent timestamp for the client and keeps the others', async () => {
    const updateCall = await run(
      { clientId: 'target', privacyConsent: true },
      userObject()
    );
    const data = updateCall.mock.calls[0][0];

    expect(data.privacyConsentAt['3']).toBe('2026-01-01T00:00:00.000Z');
    expect(typeof data.privacyConsentAt['7']).toBe('string');
    expect(data.emailNotificationConsent).toBeUndefined();
  });

  it('keeps an existing privacy consent timestamp', async () => {
    const user = userObject({
      privacyConsentAt: { 7: '2026-02-02T00:00:00.000Z' },
    });
    const updateCall = await run(
      { clientId: 'target', privacyConsent: true },
      user
    );

    expect(updateCall.mock.calls[0][0].privacyConsentAt).toEqual({
      7: '2026-02-02T00:00:00.000Z',
    });
  });

  it('still merges email notification consent per client', async () => {
    const updateCall = await run(
      { clientId: 'target', emailNotificationConsent: false },
      userObject()
    );

    expect(updateCall.mock.calls[0][0].emailNotificationConsent).toEqual({
      3: true,
      7: false,
    });
  });

  it('ignores privacyConsent values other than true', async () => {
    const updateCall = await run(
      { clientId: 'target', privacyConsent: 'yes', name: 'Jan' },
      userObject()
    );

    expect(db.Client.findOne).not.toHaveBeenCalled();
    expect(updateCall.mock.calls[0][0]).toEqual({ name: 'Jan' });
  });
});
