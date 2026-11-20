import { describe, expect, test } from 'vitest';

const { bruteKey } = require('./bruteForce');

describe('brute force limiter key', () => {
  test('is the client IP when nothing identifies the account', () => {
    expect(bruteKey({ ip: '203.0.113.5', body: {} })).toBe('203.0.113.5');
    expect(bruteKey({ ip: '203.0.113.5' })).toBe('203.0.113.5');
  });

  test('does not depend on the session, so dropping the cookie does not reset the counter', () => {
    const a = bruteKey({
      ip: '203.0.113.5',
      session: { id: 'one' },
      body: { email: 'a@b.nl' },
    });
    const b = bruteKey({
      ip: '203.0.113.5',
      session: { id: 'two' },
      body: { email: 'a@b.nl' },
    });
    expect(a).toBe(b);
  });

  test('combines IP with the normalised e-mail, phone number or code', () => {
    expect(bruteKey({ ip: '203.0.113.5', body: { email: ' A@B.nl ' } })).toBe(
      '203.0.113.5|a@b.nl'
    );
    expect(
      bruteKey({ ip: '203.0.113.5', body: { phoneNumber: '+31612345678' } })
    ).toBe('203.0.113.5|+31612345678');
    expect(bruteKey({ ip: '203.0.113.5', body: { uniqueCode: 'ABCD' } })).toBe(
      '203.0.113.5|abcd'
    );
  });

  test('a different IP trying the same account gets its own counter', () => {
    expect(bruteKey({ ip: '203.0.113.5', body: { email: 'a@b.nl' } })).not.toBe(
      bruteKey({ ip: '198.51.100.9', body: { email: 'a@b.nl' } })
    );
  });
});
