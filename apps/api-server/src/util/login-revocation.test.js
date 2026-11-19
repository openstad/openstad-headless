import { describe, expect, it, vi } from 'vitest';

import loginRevocation from './login-revocation.js';

const { revoke, isRevoked } = loginRevocation;

const REVOKED_AT = new Date('2026-01-01T12:00:00.500Z');
const REVOKED_SECOND = Math.floor(REVOKED_AT.getTime() / 1000);

const createDb = (row = null) => ({
  LoginRevocation: {
    findOne: vi.fn().mockResolvedValue(row),
    upsert: vi.fn().mockResolvedValue([{}, true]),
  },
});

describe('revoke', () => {
  it('upserts the revocation by provider and string identifier', async () => {
    const db = createDb();

    await revoke({ db, provider: 'openstad', identifier: 42, at: REVOKED_AT });

    expect(db.LoginRevocation.upsert).toHaveBeenCalledWith({
      provider: 'openstad',
      identifier: '42',
      revokedAt: REVOKED_AT,
    });
  });

  it('uses the current time when no moment is given', async () => {
    const db = createDb();
    const before = Date.now();

    await revoke({ db, provider: 'openstad', identifier: '42' });

    const { revokedAt } = db.LoginRevocation.upsert.mock.calls[0][0];
    expect(revokedAt).toBeInstanceOf(Date);
    expect(revokedAt.getTime()).toBeGreaterThanOrEqual(before);
    expect(revokedAt.getTime()).toBeLessThanOrEqual(Date.now());
  });
});

describe('isRevoked', () => {
  it('is false when there is no revocation for the identity', async () => {
    const db = createDb(null);

    expect(
      await isRevoked({
        db,
        provider: 'openstad',
        identifier: '42',
        issuedAt: REVOKED_SECOND,
      })
    ).toBe(false);
  });

  it('revokes a token issued in the same second as the revocation', async () => {
    const db = createDb({ revokedAt: REVOKED_AT });

    expect(
      await isRevoked({
        db,
        provider: 'openstad',
        identifier: '42',
        issuedAt: REVOKED_SECOND,
      })
    ).toBe(true);
  });

  it('revokes a token issued before the revocation', async () => {
    const db = createDb({ revokedAt: REVOKED_AT });

    expect(
      await isRevoked({
        db,
        provider: 'openstad',
        identifier: '42',
        issuedAt: REVOKED_SECOND - 60,
      })
    ).toBe(true);
  });

  it('accepts a token issued one second after the revocation', async () => {
    const db = createDb({ revokedAt: REVOKED_AT });

    expect(
      await isRevoked({
        db,
        provider: 'openstad',
        identifier: '42',
        issuedAt: REVOKED_SECOND + 1,
      })
    ).toBe(false);
  });

  it('fails closed for a token without an issue time', async () => {
    const db = createDb({ revokedAt: REVOKED_AT });

    expect(
      await isRevoked({
        db,
        provider: 'openstad',
        identifier: '42',
        issuedAt: undefined,
      })
    ).toBe(true);
  });

  it('looks up a numeric identifier as a string', async () => {
    const db = createDb({ revokedAt: REVOKED_AT });

    await isRevoked({
      db,
      provider: 'openstad',
      identifier: 42,
      issuedAt: REVOKED_SECOND,
    });

    expect(db.LoginRevocation.findOne).toHaveBeenCalledWith({
      where: { provider: 'openstad', identifier: '42' },
    });
  });
});

describe('identities without a provider or identifier', () => {
  it('does not look up a revocation without a provider', async () => {
    const db = createDb({ revokedAt: REVOKED_AT });

    const result = await isRevoked({
      db,
      provider: undefined,
      identifier: 42,
      issuedAt: REVOKED_SECOND,
    });

    expect(result).toBe(false);
    expect(db.LoginRevocation.findOne).not.toHaveBeenCalled();
  });

  it('does not look up a revocation without an identifier', async () => {
    const db = createDb({ revokedAt: REVOKED_AT });

    const result = await isRevoked({
      db,
      provider: 'openstad',
      identifier: undefined,
      issuedAt: REVOKED_SECOND,
    });

    expect(result).toBe(false);
    expect(db.LoginRevocation.findOne).not.toHaveBeenCalled();
  });

  it('does not write a revocation without a provider', async () => {
    const db = createDb();

    const result = await revoke({ db, provider: null, identifier: 42 });

    expect(result).toBeNull();
    expect(db.LoginRevocation.upsert).not.toHaveBeenCalled();
  });
});
