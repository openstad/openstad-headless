import { createRequire } from 'module';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

const require = createRequire(import.meta.url);
// Import the REAL implementation used by oauth2.js (extracted to a dependency-free module)
const {
  parseHost,
  getParentDomains,
  prefillAllowedDomains,
} = require('./allowed-domains');

// prefillAllowedDomains reads process.env at call time; isolate the env per test.
const ENV_KEYS = ['BASE_DOMAIN', 'APP_URL', 'CMS_URL', 'API_URL', 'ADMIN_URL'];
let savedEnv;

beforeEach(() => {
  savedEnv = {};
  for (const key of ENV_KEYS) {
    savedEnv[key] = process.env[key];
    delete process.env[key];
  }
});

afterEach(() => {
  for (const key of ENV_KEYS) {
    if (savedEnv[key] === undefined) {
      delete process.env[key];
    } else {
      process.env[key] = savedEnv[key];
    }
  }
});

describe('parseHost', () => {
  it('parses a full URL to its host', () => {
    expect(parseHost('https://example.com')).toBe('example.com');
  });

  it('adds https:// prefix when missing', () => {
    expect(parseHost('example.com')).toBe('example.com');
  });

  it('returns null for empty input', () => {
    expect(parseHost('')).toBeNull();
    expect(parseHost(null)).toBeNull();
    expect(parseHost(undefined)).toBeNull();
  });

  it('returns null for invalid URLs', () => {
    expect(parseHost('not a valid url!!!')).toBeNull();
  });

  it('preserves port numbers', () => {
    expect(parseHost('https://localhost:3000')).toBe('localhost:3000');
  });
});

describe('getParentDomains', () => {
  it('returns intermediate parent domains', () => {
    const parents = getParentDomains('sub.example.com');
    expect(parents).toContain('example.com');
  });

  it('returns empty array for TLD-only domain', () => {
    expect(getParentDomains('example.com')).toEqual([]);
  });

  it('returns multiple parents for deep subdomains', () => {
    const parents = getParentDomains('a.b.c.example.com');
    expect(parents).toContain('b.c.example.com');
    expect(parents).toContain('c.example.com');
    expect(parents).toContain('example.com');
  });

  it('strips the port before computing parents', () => {
    const parents = getParentDomains('sub.example.com:3000');
    expect(parents).toContain('example.com');
  });
});

describe('prefillAllowedDomains', () => {
  it('preserves original domains in the output', () => {
    const result = prefillAllowedDomains(['https://example.com']);
    expect(result).toContain('https://example.com');
  });

  it('includes the parsed host alongside the original entry', () => {
    const result = prefillAllowedDomains(['https://app.example.com']);
    expect(result).toContain('app.example.com');
    expect(result).toContain('example.com');
  });

  it('deduplicates entries', () => {
    const result = prefillAllowedDomains([
      'https://example.com',
      'https://example.com',
    ]);
    const count = result.filter((d) => d === 'example.com').length;
    expect(count).toBe(1);
  });

  it('returns empty array for empty input', () => {
    expect(prefillAllowedDomains([])).toEqual([]);
    expect(prefillAllowedDomains(null)).toEqual([]);
  });

  it('allows a redirectURI host that is in the configured list', () => {
    const allowed = prefillAllowedDomains(['https://app.example.com']);
    expect(allowed.indexOf('app.example.com')).not.toBe(-1);
  });

  it('does NOT allow a redirectURI host from a different domain', () => {
    const allowed = prefillAllowedDomains(['https://app.example.com']);
    expect(allowed.indexOf('evil.attacker.com')).toBe(-1);
  });

  it('adds hosts (and parents) from BASE_DOMAIN / APP_URL env vars', () => {
    process.env.BASE_DOMAIN = 'https://base.example.org';
    process.env.APP_URL = 'https://app.other.net';

    const result = prefillAllowedDomains([]);

    expect(result).toContain('base.example.org');
    expect(result).toContain('example.org');
    expect(result).toContain('app.other.net');
    expect(result).toContain('other.net');
  });

  it('ignores unset env vars without throwing', () => {
    // All env vars are cleared in beforeEach
    const result = prefillAllowedDomains(['https://only.example.com']);
    expect(result).toContain('only.example.com');
  });
});
