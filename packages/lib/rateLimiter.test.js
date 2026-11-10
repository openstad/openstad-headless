import { afterEach, describe, expect, test } from 'vitest';

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

// Fire requests from a public IP straight at the middleware and return the
// status and RateLimit-Policy header of the last response.
async function hit(limiter, times) {
  let last;
  for (let i = 0; i < times; i++) {
    const headers = {};
    last = await new Promise((resolve) => {
      const res = {
        statusCode: 200,
        headersSent: false,
        setHeader: (name, value) => (headers[name.toLowerCase()] = value),
        getHeader: (name) => headers[name.toLowerCase()],
        status(code) {
          this.statusCode = code;
          return this;
        },
        send() {
          resolve({ status: this.statusCode, headers });
        },
      };
      limiter({ ip: '203.0.113.10', app: { get: () => false } }, res, () =>
        resolve({ status: 200, headers })
      );
    });
  }
  return last;
}

describe('rateLimiter options', () => {
  afterEach(() => {
    delete process.env.RATE_LIMIT;
    delete process.env.RATE_WINDOW_MS;
  });

  test('explicit max and windowMs win over the env', async () => {
    process.env.RATE_LIMIT = '75000';
    process.env.RATE_WINDOW_MS = '1000';
    const limiter = rateLimiter({ windowMs: 10 * 60 * 1000, max: 2 });

    expect((await hit(limiter, 2)).status).toBe(200);
    const blocked = await hit(limiter, 1);
    expect(blocked.status).toBe(429);
    expect(blocked.headers['ratelimit-policy']).toBe('2;w=600');
  });

  test('without options the env values are used', async () => {
    process.env.RATE_LIMIT = '2';
    process.env.RATE_WINDOW_MS = '5000';
    const limiter = rateLimiter();

    expect((await hit(limiter, 2)).status).toBe(200);
    const blocked = await hit(limiter, 1);
    expect(blocked.status).toBe(429);
    expect(blocked.headers['ratelimit-policy']).toBe('2;w=5');
  });
});
