import { describe, expect, test } from 'vitest';

const rateLimiter = require('./rateLimiter');
const { isPrivateIp, normalizeIp } = rateLimiter;

describe('normalizeIp', () => {
  test('strips IPv4-mapped IPv6 prefix', () => {
    expect(normalizeIp('::ffff:192.168.1.1')).toBe('192.168.1.1');
    expect(normalizeIp('::FFFF:10.0.0.5')).toBe('10.0.0.5');
  });

  test('leaves bare addresses unchanged', () => {
    expect(normalizeIp('192.168.1.1')).toBe('192.168.1.1');
    expect(normalizeIp('2001:db8::1')).toBe('2001:db8::1');
  });

  test('returns empty string for non-strings', () => {
    expect(normalizeIp(undefined)).toBe('');
    expect(normalizeIp(null)).toBe('');
  });
});

describe('isPrivateIp', () => {
  test.each([
    '10.0.0.1',
    '10.255.255.255',
    '172.16.0.1',
    '172.31.255.255',
    '192.168.0.1',
    '127.0.0.1',
    '169.254.1.1',
    '::1',
    'fc00::1',
    'fd12:3456::1',
    'fe80::1',
    '::ffff:192.168.1.1',
  ])('classifies %s as private', (addr) => {
    expect(isPrivateIp(addr)).toBe(true);
  });

  test.each([
    '8.8.8.8',
    '1.1.1.1',
    '172.32.0.1', // just outside 172.16/12
    '172.15.0.1',
    '192.167.0.1',
    '169.253.0.1',
    '2001:db8::1', // documentation range, treated as public here
    '::ffff:8.8.8.8',
  ])('classifies %s as public', (addr) => {
    expect(isPrivateIp(addr)).toBe(false);
  });

  test('handles invalid input safely', () => {
    expect(isPrivateIp('')).toBe(false);
    expect(isPrivateIp(undefined)).toBe(false);
    expect(isPrivateIp('not.an.ip.addr')).toBe(false);
    expect(isPrivateIp('999.999.999.999')).toBe(false);
  });
});
