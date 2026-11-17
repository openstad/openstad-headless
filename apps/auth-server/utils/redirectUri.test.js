import { beforeEach, describe, expect, test, vi } from 'vitest';

const {
  prefillAllowedDomains,
  validateRedirectUri,
  safeRedirectUri,
} = require('./redirectUri');

const client = { allowedDomains: ['example.nl', 'foo.example.org'] };

beforeEach(() => {
  vi.unstubAllEnvs();
});

describe('validateRedirectUri', () => {
  test('accepts https URI on an allowed host', () => {
    expect(validateRedirectUri('https://example.nl/pad?x=1', client)).toBe(
      'https://example.nl/pad?x=1'
    );
  });

  test('returns null when absent', () => {
    expect(validateRedirectUri(undefined, client)).toBe(null);
    expect(validateRedirectUri(null, client)).toBe(null);
    expect(validateRedirectUri('', client)).toBe(null);
  });

  test('rejects a host outside the allowlist', () => {
    expect(() => validateRedirectUri('https://evil.example', client)).toThrow(
      /host is not in the allowed domains/
    );
  });

  test('rejects an unregistered subdomain of an allowed host', () => {
    expect(() =>
      validateRedirectUri('https://bar.example.nl', client)
    ).toThrow();
  });

  test('allows the parent domain of a registered subdomain (compat)', () => {
    expect(validateRedirectUri('https://example.org/x', client)).toBe(
      'https://example.org/x'
    );
  });

  test('rejects a mismatching port', () => {
    expect(() =>
      validateRedirectUri('https://example.nl:8443/x', client)
    ).toThrow();
  });

  test('rejects non-http(s) protocols', () => {
    expect(() => validateRedirectUri('ftp://example.nl/x', client)).toThrow(
      /protocol/
    );
    expect(() => validateRedirectUri('file:///etc/passwd', client)).toThrow();
    expect(() => validateRedirectUri('javascript:alert(1)', client)).toThrow();
  });

  test('rejects http in production, allows it in development', () => {
    vi.stubEnv('NODE_ENV', 'production');
    expect(() => validateRedirectUri('http://example.nl/x', client)).toThrow(
      /protocol/
    );
    vi.stubEnv('NODE_ENV', 'development');
    expect(validateRedirectUri('http://example.nl/x', client)).toBe(
      'http://example.nl/x'
    );
  });

  test('allows http on localhost even in production', () => {
    vi.stubEnv('NODE_ENV', 'production');
    const localClient = { allowedDomains: ['localhost:3000'] };
    expect(validateRedirectUri('http://localhost:3000/cb', localClient)).toBe(
      'http://localhost:3000/cb'
    );
  });

  test('rejects protocol-relative and relative URLs', () => {
    expect(() => validateRedirectUri('//example.nl/x', client)).toThrow(
      /absolute URL/
    );
    expect(() => validateRedirectUri('/pad/naar/iets', client)).toThrow(
      /absolute URL/
    );
  });

  test('rejects credentials in the URL', () => {
    expect(() =>
      validateRedirectUri('https://user:pw@example.nl/x', client)
    ).toThrow(/credentials/);
  });

  test('rejects fragments', () => {
    expect(() =>
      validateRedirectUri('https://example.nl/x#frag', client)
    ).toThrow(/fragment/);
  });

  test('rejects non-string values from the query parser', () => {
    expect(() => validateRedirectUri(['https://example.nl'], client)).toThrow(
      /single string/
    );
    expect(() =>
      validateRedirectUri({ a: 'https://example.nl' }, client)
    ).toThrow(/single string/);
  });

  test('rejects extremely long values', () => {
    const long = 'https://example.nl/' + 'a'.repeat(2100);
    expect(() => validateRedirectUri(long, client)).toThrow(/length/);
  });

  test('accepts hosts from platform env vars', () => {
    vi.stubEnv('ADMIN_URL', 'https://admin.platform.nl');
    expect(
      validateRedirectUri('https://admin.platform.nl/login', {
        allowedDomains: [],
      })
    ).toBe('https://admin.platform.nl/login');
  });

  test('errors carry status 400', () => {
    try {
      validateRedirectUri('https://evil.example', client);
      expect.unreachable();
    } catch (err) {
      expect(err.status).toBe(400);
    }
  });
});

describe('safeRedirectUri', () => {
  test('returns the URI when valid', () => {
    expect(safeRedirectUri('https://example.nl/x', client)).toBe(
      'https://example.nl/x'
    );
  });

  test('returns null instead of throwing when invalid', () => {
    expect(safeRedirectUri('https://evil.example', client)).toBe(null);
    expect(safeRedirectUri(['x'], client)).toBe(null);
  });

  test('returns null when absent', () => {
    expect(safeRedirectUri(undefined, client)).toBe(null);
  });
});

describe('prefillAllowedDomains', () => {
  test('adds parent domains for registered subdomains', () => {
    const list = prefillAllowedDomains(['foo.example.org']);
    expect(list).toContain('foo.example.org');
    expect(list).toContain('example.org');
  });

  test('handles empty input', () => {
    expect(Array.isArray(prefillAllowedDomains([]))).toBe(true);
    expect(Array.isArray(prefillAllowedDomains(undefined))).toBe(true);
  });
});
