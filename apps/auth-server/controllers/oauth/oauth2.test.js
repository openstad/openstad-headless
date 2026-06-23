import { createRequire } from 'module';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

const require = createRequire(import.meta.url);
// Import the REAL implementation used by oauth2.js (extracted to a dependency-free module)
const {
  parseHost,
  getParentDomains,
  prefillAllowedDomains,
} = require('./allowed-domains');

// The grant/exchange callbacks in oauth2.js are closures passed into oauth2orize
// and are NOT exported, so they cannot be invoked in isolation. They are, however,
// thin wrappers that delegate every meaningful decision to these dependency-free,
// DB-free helpers (real JWTs via the bundled certs, in-memory token stores). The
// suites below exercise those exact code paths end-to-end.
const utils = require('../../utils');
const validate = require('../../validate');
const memoryStorage = require('../../memoryStorage');
const config = require('../../config');

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

// ---------------------------------------------------------------------------
// AUTHORIZE flow: redirectURI / host validation.
//
// The authorize handler (oauth2.js `server.authorization` callback) computes
// `prefillAllowedDomains(client.allowedDomains)` and accepts the request only if
// `new URL(redirectURI).host` is a member of that set, otherwise it throws
// "Redirect host doesn't match the client host". This is the security-critical
// custom logic; we replicate the exact membership decision here.
// ---------------------------------------------------------------------------
describe('authorize: redirectURI host validation', () => {
  const isRedirectAllowed = (clientAllowedDomains, redirectURI) => {
    const allowedDomains = prefillAllowedDomains(clientAllowedDomains || []);
    const redirectUrlHost = new URL(redirectURI).host;
    return allowedDomains && allowedDomains.indexOf(redirectUrlHost) !== -1;
  };

  it('accepts a redirectURI whose host matches a configured domain', () => {
    expect(
      isRedirectAllowed(
        ['https://app.example.com'],
        'https://app.example.com/callback?code=1'
      )
    ).toBe(true);
  });

  it('accepts a redirectURI on a parent of the configured domain', () => {
    // prefillAllowedDomains adds parent domains, so example.com is allowed too.
    expect(
      isRedirectAllowed(['https://app.example.com'], 'https://example.com/cb')
    ).toBe(true);
  });

  it('rejects a redirectURI host from an unrelated domain', () => {
    expect(
      isRedirectAllowed(
        ['https://app.example.com'],
        'https://evil.attacker.com/steal'
      )
    ).toBe(false);
  });

  it('rejects every redirectURI when the client has no allowed domains', () => {
    expect(isRedirectAllowed([], 'https://app.example.com/cb')).toBe(false);
  });

  it('matches on host including port, not just hostname', () => {
    expect(
      isRedirectAllowed(['https://localhost:3000'], 'https://localhost:3000/cb')
    ).toBe(true);
    expect(
      isRedirectAllowed(['https://localhost:3000'], 'https://localhost:4000/cb')
    ).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// EXCHANGE flow: authorization code -> access (+ optional refresh) tokens.
//
// Mirrors oauth2.js `server.exchange(oauth2orize.exchange.code(...))`:
//   authorizationCodes.delete(code)
//     -> validate.authCode(code, authCode, client, redirectURI)
//     -> validate.generateTokens(authCode)
// using the real in-memory store, real JWT signing, and the real validators.
// ---------------------------------------------------------------------------
describe('exchange: authorization code grant', () => {
  const client = { id: 'client-1' };
  const redirectURI = 'https://app.example.com/cb';

  afterEach(async () => {
    await memoryStorage.authorizationCodes.removeAll();
    await memoryStorage.accessTokens.removeAll();
    await memoryStorage.refreshTokens.removeAll();
  });

  const issueAuthCode = async ({
    scope = undefined,
    clientID = client.id,
  } = {}) => {
    const code = utils.createToken({
      sub: 'user-1',
      exp: config.codeToken.expiresIn,
    });
    await memoryStorage.authorizationCodes.save(
      code,
      clientID,
      redirectURI,
      'user-1',
      scope
    );
    return code;
  };

  it('exchanges a valid code for a single access token (no offline scope)', async () => {
    const code = await issueAuthCode();

    const authCode = await memoryStorage.authorizationCodes.delete(code);
    validate.authCode(code, authCode, client, redirectURI);
    const tokens = await validate.generateTokens(authCode);

    expect(tokens).toHaveLength(1);
    // Issued token is a verifiable JWT for the authorizing user.
    expect(utils.verifyToken(tokens[0]).sub).toBe('user-1');
  });

  it('issues an access AND refresh token when scope is offline_access', async () => {
    const code = await issueAuthCode({ scope: 'offline_access' });

    const authCode = await memoryStorage.authorizationCodes.delete(code);
    validate.authCode(code, authCode, client, redirectURI);
    const tokens = await validate.generateTokens(authCode);

    expect(tokens).toHaveLength(2);
    expect(utils.verifyToken(tokens[0])).toBeTruthy();
    expect(utils.verifyToken(tokens[1])).toBeTruthy();
    // The refresh token is persisted in the store for later exchange.
    expect(await memoryStorage.refreshTokens.find(tokens[1])).toBeTruthy();
  });

  it('rejects a code issued to a different client', async () => {
    const code = await issueAuthCode({ clientID: 'someone-else' });
    const authCode = await memoryStorage.authorizationCodes.delete(code);

    expect(() =>
      validate.authCode(code, authCode, client, redirectURI)
    ).toThrow(/clientID does not match/);
  });

  it('consumes the code so it cannot be replayed', async () => {
    const code = await issueAuthCode();

    const first = await memoryStorage.authorizationCodes.delete(code);
    expect(first).toBeTruthy();
    // Second delete (replay) finds nothing.
    const second = await memoryStorage.authorizationCodes.delete(code);
    expect(second).toBeUndefined();
  });
});

// ---------------------------------------------------------------------------
// REFRESH flow: refresh token -> new access token.
//
// Mirrors oauth2.js `server.exchange(oauth2orize.exchange.refreshToken(...))`:
//   refreshTokens.find(refreshToken)
//     -> validate.refreshToken(found, refreshToken, client)
//     -> validate.generateToken(found)
// ---------------------------------------------------------------------------
describe('exchange: refresh token grant', () => {
  const client = { id: 'client-1' };

  afterEach(async () => {
    await memoryStorage.refreshTokens.removeAll();
  });

  const issueRefreshToken = async ({ clientID = client.id } = {}) => {
    const refreshToken = utils.createToken({
      sub: 'user-1',
      exp: config.refreshToken.expiresIn,
    });
    await memoryStorage.refreshTokens.save(
      refreshToken,
      'user-1',
      clientID,
      undefined
    );
    return refreshToken;
  };

  it('exchanges a valid refresh token for a new access token', async () => {
    const refreshToken = await issueRefreshToken();

    const found = await memoryStorage.refreshTokens.find(refreshToken);
    validate.refreshToken(found, refreshToken, client);
    const accessToken = await validate.generateToken(found);

    // A fresh, verifiable access-token JWT is issued for the authorizing user.
    // (Persistence goes to the DB-backed access-token store, exercised in DB tests.)
    expect(utils.verifyToken(accessToken).sub).toBe('user-1');
  });

  it('rejects a refresh token belonging to a different client', async () => {
    const refreshToken = await issueRefreshToken({ clientID: 'other-client' });
    const found = await memoryStorage.refreshTokens.find(refreshToken);

    expect(() => validate.refreshToken(found, refreshToken, client)).toThrow(
      /clientID does not match/
    );
  });

  it('rejects a tampered / unverifiable refresh token', () => {
    expect(() =>
      validate.refreshToken({ clientID: client.id }, 'not-a-jwt', client)
    ).toThrow();
  });
});
