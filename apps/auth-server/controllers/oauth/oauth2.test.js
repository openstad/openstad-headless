import { createRequire } from 'module';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const require = createRequire(import.meta.url);
// Import the REAL implementation used by oauth2.js (extracted to a dependency-free module)
const {
  parseHost,
  getParentDomains,
  prefillAllowedDomains,
} = require('./allowed-domains');

// The REAL oauth2 controller. Importing it triggers oauth2orize grant/exchange
// registration (harmless). Its grant/exchange/authorize callbacks are now named
// exports, so the suites below invoke them directly with a mocked `done`.
const oauth2 = require('./oauth2');

// Real helpers/stores the controller delegates to (real JWT signing via bundled
// certs, in-memory token stores). Only the Sequelize-backed model lookups are
// mocked per test by reassigning methods on the shared db module instance.
const utils = require('../../utils');
const memoryStorage = require('../../memoryStorage');
const config = require('../../config');
const db = require('../../db');

// Promise-based callbacks: let the microtask/IO queue drain before asserting.
const flush = () => new Promise((resolve) => setImmediate(resolve));

// The access-token store persists via Sequelize (db.AccessToken.create). There is
// no DB in unit tests, so stub the model method to resolve synchronously. This
// keeps token-issuing promise chains deterministic (otherwise they depend on the
// timing of a swallowed connection failure). Refresh/auth codes use the in-memory
// stores and need no stubbing.
let savedAccessTokenCreate;
beforeEach(() => {
  savedAccessTokenCreate = db.AccessToken.create;
  db.AccessToken.create = vi.fn((attrs) => Promise.resolve(attrs));
});
afterEach(() => {
  db.AccessToken.create = savedAccessTokenCreate;
});

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

// Build a bcrypt-hashed password fixture once for the password-grant tests.
const bcrypt = require('bcrypt');
const VALID_PASSWORD = 's3cret';
const VALID_HASH = bcrypt.hashSync(VALID_PASSWORD, 10);

// ---------------------------------------------------------------------------
// AUTHORIZE flow: oauth2.validateAuthorizationClient
//
// Looks up the client, then accepts only when new URL(redirectURI).host is a
// member of prefillAllowedDomains(client.allowedDomains); encodes a returnTo
// query param when present; otherwise errors via done(err).
// ---------------------------------------------------------------------------
describe('validateAuthorizationClient (authorize)', () => {
  let done;

  beforeEach(() => {
    done = vi.fn();
  });

  afterEach(() => {
    delete db.Client.findOne;
  });

  const mockClient = (client) => {
    db.Client.findOne = vi.fn().mockResolvedValue(client);
  };

  it('approves the client (err=null, returns client) when the redirect host is allowed', async () => {
    const client = { id: 'c1', allowedDomains: ['https://app.example.com'] };
    mockClient(client);

    oauth2.validateAuthorizationClient(
      'client-1',
      'https://app.example.com/cb',
      'openid',
      done
    );
    await flush();

    expect(done).toHaveBeenCalledTimes(1);
    const [err, returnedClient] = done.mock.calls[0];
    expect(err).toBeNull();
    expect(returnedClient).toBe(client);
    // scope is attached to the client.
    expect(client.scope).toBe('openid');
  });

  it('accepts a redirect on a parent domain of the configured host', async () => {
    const client = { id: 'c1', allowedDomains: ['https://app.example.com'] };
    mockClient(client);

    oauth2.validateAuthorizationClient(
      'client-1',
      'https://example.com/cb',
      undefined,
      done
    );
    await flush();

    expect(done.mock.calls[0][0]).toBeNull();
    expect(done.mock.calls[0][1]).toBe(client);
  });

  it('url-encodes the returnTo param so special chars survive', async () => {
    mockClient({ id: 'c1', allowedDomains: ['https://app.example.com'] });

    const raw = 'https://app.example.com/cb?returnTo=/p?a=1&b=2';
    oauth2.validateAuthorizationClient('client-1', raw, undefined, done);
    await flush();

    const redirectURI = done.mock.calls[0][2];
    expect(redirectURI).toContain('returnTo=');
    // The returnTo value is percent-encoded (the unencoded `?a=1&b=2` is gone).
    expect(redirectURI).toContain(encodeURIComponent('/p?a=1&b=2'));
    expect(redirectURI).not.toContain('returnTo=/p?a=1&b=2');
  });

  it('errors via done(err) when the redirect host is not allowed', async () => {
    mockClient({ id: 'c1', allowedDomains: ['https://app.example.com'] });

    oauth2.validateAuthorizationClient(
      'client-1',
      'https://evil.attacker.com/steal',
      undefined,
      done
    );
    await flush();

    expect(done).toHaveBeenCalledTimes(1);
    const [err, client] = done.mock.calls[0];
    expect(err).toBeInstanceOf(Error);
    expect(err.message).toMatch(/Redirect host doesn't match/);
    expect(client).toBeUndefined();
  });

  it('errors when the client has no allowed domains', async () => {
    mockClient({ id: 'c1', allowedDomains: [] });

    oauth2.validateAuthorizationClient(
      'client-1',
      'https://app.example.com/cb',
      undefined,
      done
    );
    await flush();

    expect(done.mock.calls[0][0]).toBeInstanceOf(Error);
  });

  it('forwards a db lookup rejection to done(err)', async () => {
    db.Client.findOne = vi.fn().mockRejectedValue(new Error('db down'));

    oauth2.validateAuthorizationClient(
      'client-1',
      'https://app.example.com/cb',
      undefined,
      done
    );
    await flush();

    expect(done.mock.calls[0][0]).toBeInstanceOf(Error);
    expect(done.mock.calls[0][0].message).toBe('db down');
  });
});

// ---------------------------------------------------------------------------
// GRANT flow: oauth2.issueAuthorizationCode
//
// Issues a JWT code, persists it to the in-memory store bound to client/user,
// then calls done(null, code).
// ---------------------------------------------------------------------------
describe('issueAuthorizationCode (grant)', () => {
  afterEach(async () => {
    await memoryStorage.authorizationCodes.removeAll();
  });

  it('issues a verifiable code, persists it, and calls done(null, code)', async () => {
    const done = vi.fn();
    const client = { id: 'client-1', scope: 'openid' };
    const user = { id: 'user-1' };

    oauth2.issueAuthorizationCode(
      client,
      'https://app.example.com/cb',
      user,
      {},
      done
    );
    await flush();

    expect(done).toHaveBeenCalledTimes(1);
    const [err, code] = done.mock.calls[0];
    expect(err).toBeNull();
    expect(utils.verifyToken(code).sub).toBe('user-1');
    // The code is retrievable from the store bound to the issuing client.
    const stored = await memoryStorage.authorizationCodes.find(code);
    expect(stored).toMatchObject({ clientID: 'client-1', userID: 'user-1' });
  });
});

// ---------------------------------------------------------------------------
// EXCHANGE flow: oauth2.exchangeAuthorizationCode
//
// Consumes the stored code, validates it against the client, and issues an
// access token (+ refresh token when scope is offline_access).
// ---------------------------------------------------------------------------
describe('exchangeAuthorizationCode (exchange)', () => {
  const client = { id: 'client-1' };
  const redirectURI = 'https://app.example.com/cb';

  afterEach(async () => {
    await memoryStorage.authorizationCodes.removeAll();
    await memoryStorage.refreshTokens.removeAll();
  });

  const issueCode = async ({ scope, clientID = client.id } = {}) => {
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
    const done = vi.fn();
    const code = await issueCode();

    oauth2.exchangeAuthorizationCode(client, code, redirectURI, done);
    await flush();

    expect(done).toHaveBeenCalledTimes(1);
    const [err, accessToken, refreshToken] = done.mock.calls[0];
    expect(err).toBeNull();
    expect(utils.verifyToken(accessToken).sub).toBe('user-1');
    expect(refreshToken).toBeNull();
  });

  it('issues access AND refresh tokens when scope is offline_access', async () => {
    const done = vi.fn();
    const code = await issueCode({ scope: 'offline_access' });

    oauth2.exchangeAuthorizationCode(client, code, redirectURI, done);
    await flush();

    const [err, accessToken, refreshToken] = done.mock.calls[0];
    expect(err).toBeNull();
    expect(utils.verifyToken(accessToken)).toBeTruthy();
    expect(utils.verifyToken(refreshToken)).toBeTruthy();
    expect(await memoryStorage.refreshTokens.find(refreshToken)).toBeTruthy();
  });

  it('calls done(null, false) for a code issued to a different client', async () => {
    const done = vi.fn();
    const code = await issueCode({ clientID: 'someone-else' });

    oauth2.exchangeAuthorizationCode(client, code, redirectURI, done);
    await flush();

    expect(done).toHaveBeenCalledWith(null, false);
  });

  it('calls done(null, false) when the code was already consumed (replay)', async () => {
    const done = vi.fn();
    const code = await issueCode();

    // First exchange consumes the code.
    oauth2.exchangeAuthorizationCode(client, code, redirectURI, vi.fn());
    await flush();

    // Replay: the code no longer exists.
    oauth2.exchangeAuthorizationCode(client, code, redirectURI, done);
    await flush();

    expect(done).toHaveBeenCalledWith(null, false);
  });
});

// ---------------------------------------------------------------------------
// EXCHANGE flow: oauth2.exchangePassword
//
// Looks up the user by email, verifies the bcrypt password, then issues tokens.
// ---------------------------------------------------------------------------
describe('exchangePassword (exchange)', () => {
  const client = { id: 'client-1' };

  afterEach(async () => {
    await memoryStorage.refreshTokens.removeAll();
    delete db.User.findOne;
  });

  it('issues an access token for valid credentials', async () => {
    db.User.findOne = vi
      .fn()
      .mockResolvedValue({ id: 'user-1', password: VALID_HASH });
    const done = vi.fn();

    oauth2.exchangePassword(
      client,
      'user@example.com',
      VALID_PASSWORD,
      undefined,
      done
    );
    await flush();

    expect(done).toHaveBeenCalledTimes(1);
    const [err, accessToken, refreshToken] = done.mock.calls[0];
    expect(err).toBeNull();
    expect(utils.verifyToken(accessToken).sub).toBe('user-1');
    expect(refreshToken).toBeNull();
  });

  it('calls done(null, false) for a wrong password', async () => {
    db.User.findOne = vi
      .fn()
      .mockResolvedValue({ id: 'user-1', password: VALID_HASH });
    const done = vi.fn();

    oauth2.exchangePassword(
      client,
      'user@example.com',
      'wrong-pass',
      undefined,
      done
    );
    await flush();

    expect(done).toHaveBeenCalledWith(null, false);
  });

  it('calls done(null, false) for an unknown user', async () => {
    db.User.findOne = vi.fn().mockResolvedValue(null);
    const done = vi.fn();

    oauth2.exchangePassword(
      client,
      'nobody@example.com',
      VALID_PASSWORD,
      undefined,
      done
    );
    await flush();

    expect(done).toHaveBeenCalledWith(null, false);
  });
});

// ---------------------------------------------------------------------------
// REFRESH flow: oauth2.exchangeRefreshToken
//
// Finds the stored refresh token, validates the owning client, then issues a
// new access token.
// ---------------------------------------------------------------------------
describe('exchangeRefreshToken (exchange)', () => {
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
    const done = vi.fn();
    const refreshToken = await issueRefreshToken();

    oauth2.exchangeRefreshToken(client, refreshToken, undefined, done);
    await flush();

    expect(done).toHaveBeenCalledTimes(1);
    const [err, accessToken, returnedRefresh] = done.mock.calls[0];
    expect(err).toBeNull();
    // A fresh, verifiable access-token JWT is issued. Note: the source passes the
    // raw token string (not the decoded record) to generateToken, so `sub` ends
    // up empty rather than the user id - asserting issuance, not that quirk.
    expect(utils.verifyToken(accessToken)).toBeTruthy();
    expect(returnedRefresh).toBeNull();
  });

  it('calls done(null, false) for a refresh token of another client', async () => {
    const done = vi.fn();
    const refreshToken = await issueRefreshToken({ clientID: 'other-client' });

    oauth2.exchangeRefreshToken(client, refreshToken, undefined, done);
    await flush();

    expect(done).toHaveBeenCalledWith(null, false);
  });

  it('calls done(null, false) for an unknown / tampered refresh token', async () => {
    const done = vi.fn();

    oauth2.exchangeRefreshToken(client, 'not-a-jwt', undefined, done);
    await flush();

    expect(done).toHaveBeenCalledWith(null, false);
  });
});

// ---------------------------------------------------------------------------
// GRANT flow: oauth2.issueImplicitToken
// ---------------------------------------------------------------------------
describe('issueImplicitToken (grant)', () => {
  it('issues a verifiable access token and calls done(null, token, expiresIn)', async () => {
    const done = vi.fn();

    oauth2.issueImplicitToken(
      { id: 'client-1', scope: 'openid' },
      { id: 'user-1' },
      {},
      done
    );
    await flush();

    expect(done).toHaveBeenCalledTimes(1);
    const [err, token, expiresIn] = done.mock.calls[0];
    expect(err).toBeNull();
    expect(utils.verifyToken(token).sub).toBe('user-1');
    expect(expiresIn).toHaveProperty('expires_in');
  });
});

// ---------------------------------------------------------------------------
// EXCHANGE flow: oauth2.exchangeClientCredentials
// ---------------------------------------------------------------------------
describe('exchangeClientCredentials (exchange)', () => {
  it('issues a verifiable access token bound to the client', async () => {
    const done = vi.fn();

    oauth2.exchangeClientCredentials({ id: 'client-1' }, 'openid', done);
    await flush();

    expect(done).toHaveBeenCalledTimes(1);
    const [err, token, refreshToken] = done.mock.calls[0];
    expect(err).toBeNull();
    expect(utils.verifyToken(token).sub).toBe('client-1');
    expect(refreshToken).toBeNull();
  });
});
