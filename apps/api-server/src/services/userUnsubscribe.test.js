import { createHash } from 'crypto';
import { describe, expect, it } from 'vitest';

import userUnsubscribe from './userUnsubscribe.js';

const { computeUnsubscribeHash } = userUnsubscribe;

describe('computeUnsubscribeHash', () => {
  it('matches an md5 of `{salt}.{userId}.{projectId}`', () => {
    const expected = createHash('md5').update('s3cr3t.42.7').digest('hex');
    expect(computeUnsubscribeHash(42, 7, 's3cr3t')).toBe(expected);
  });

  it('is deterministic and salt-sensitive', () => {
    expect(computeUnsubscribeHash(42, 7, 'a')).toBe(
      computeUnsubscribeHash(42, 7, 'a')
    );
    expect(computeUnsubscribeHash(42, 7, 'a')).not.toBe(
      computeUnsubscribeHash(42, 7, 'b')
    );
  });

  it('falls back to USER_ID_SALT from env when salt is omitted', () => {
    const prev = process.env.USER_ID_SALT;
    process.env.USER_ID_SALT = 'env-salt';
    const expected = createHash('md5').update('env-salt.1.2').digest('hex');
    expect(computeUnsubscribeHash(1, 2)).toBe(expected);
    if (prev === undefined) delete process.env.USER_ID_SALT;
    else process.env.USER_ID_SALT = prev;
  });
});
