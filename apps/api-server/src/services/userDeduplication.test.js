import { describe, expect, it } from 'vitest';

import userDeduplication from './userDeduplication.js';

const { getUniqueUserKey, getRecencyValue, dedupeUsersByIdentity } =
  userDeduplication;

describe('getUniqueUserKey', () => {
  it('uses idp provider+identifier when present', () => {
    expect(
      getUniqueUserKey({ idpUser: { provider: 'openstad', identifier: 'abc' } })
    ).toBe('openstad-*-abc');
  });

  it('falls back to id, then to an email/name/createdAt composite', () => {
    expect(getUniqueUserKey({ id: 7 })).toBe('user-7');
    expect(getUniqueUserKey({ email: 'a@b.nl', name: 'A' })).toBe(
      'user-a@b.nl-A-'
    );
  });
});

describe('getRecencyValue', () => {
  it('prefers updatedAt over lastLogin over createdAt', () => {
    const updated = new Date('2024-01-02').getTime();
    expect(
      getRecencyValue({
        updatedAt: '2024-01-02',
        lastLogin: '2020-01-01',
        createdAt: '2019-01-01',
      })
    ).toBe(updated);
  });

  it('returns 0 when no date parses', () => {
    expect(getRecencyValue({})).toBe(0);
    expect(getRecencyValue({ updatedAt: 'not-a-date' })).toBe(0);
  });
});

describe('dedupeUsersByIdentity', () => {
  it('keeps the most recent row per identity', () => {
    const older = {
      idpUser: { provider: 'p', identifier: 'x' },
      updatedAt: '2020-01-01',
      name: 'old',
    };
    const newer = {
      idpUser: { provider: 'p', identifier: 'x' },
      updatedAt: '2024-01-01',
      name: 'new',
    };
    const result = dedupeUsersByIdentity([older, newer]);
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('new');
  });

  it('keeps distinct identities separate', () => {
    const a = { idpUser: { provider: 'p', identifier: 'a' } };
    const b = { idpUser: { provider: 'p', identifier: 'b' } };
    expect(dedupeUsersByIdentity([a, b])).toHaveLength(2);
  });

  it('returns an empty array for no users', () => {
    expect(dedupeUsersByIdentity()).toEqual([]);
  });
});
