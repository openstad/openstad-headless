import { describe, expect, test } from 'vitest';

const trustProxy = require('./trust-proxy');

describe('trustProxy', () => {
  test('keeps trusting every proxy when unset', () => {
    expect(trustProxy(undefined)).toBe(true);
    expect(trustProxy('')).toBe(true);
    expect(trustProxy('true')).toBe(true);
  });

  test('can disable proxy trust', () => {
    expect(trustProxy('false')).toBe(false);
  });

  test('turns a hop count into a number', () => {
    expect(trustProxy('1')).toBe(1);
  });

  test('passes an address or subnet list on to express', () => {
    expect(trustProxy('10.0.0.0/8, loopback')).toBe('10.0.0.0/8, loopback');
  });
});
