import jwt from 'jsonwebtoken';
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

process.env.NODE_CONFIG_DIR = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '../../../config'
);
process.env.SUPPRESS_NO_CONFIG_WARNING = '1';

const require = createRequire(import.meta.url);
const config = require('config');
const db = require('../../db');
const authSettings = require('../../util/auth-settings');
const service = require('./service');
const routes = require('./inline-login-routes');

const secret = config.auth.jwtSecret;
const authConfig = {
  provider: 'default',
  adapter: 'openstad',
  clientId: 'target-client',
  clientSecret: 'secret',
  serverUrlInternal: 'http://auth.local',
  jwtSecret: secret,
  userMapping: config.auth.adapter.openstad.userMapping,
};

const targetClient = (overrides = {}) => ({
  id: 7,
  clientId: 'target-client',
  authTypes: ['Url'],
  requiredUserFields: [],
  twoFactorRoles: null,
  ...overrides,
});

const rawUser = (overrides = {}) => ({
  id: 42,
  email: 'test@example.com',
  name: 'Test',
  roles: [],
  ...overrides,
});

const call = async (handler, body, projectId = 2) => {
  const req = {
    body,
    authConfig,
    ip: '1.2.3.4',
    project: { id: projectId, config: { users: { canCreateNewUsers: true } } },
  };
  const res = {
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
  };
  const next = vi.fn();
  await handler(req, res, next);
  return {
    status: res.status.mock.calls[0] ? res.status.mock.calls[0][0] : 200,
    body: res.json.mock.calls[0] && res.json.mock.calls[0][0],
    next,
  };
};

const sourceJwt = (claims = {}) =>
  jwt.sign(
    { userId: 5, authProvider: 'openstad', projectId: 1, ...claims },
    secret
  );

beforeEach(() => {
  vi.spyOn(db.User, 'findOne').mockResolvedValue({
    id: 5,
    projectId: 1,
    role: 'member',
    idpUser: { identifier: 42, provider: 'openstad' },
  });
  vi.spyOn(db.Project, 'findOne').mockResolvedValue({ id: 1 });
  vi.spyOn(authSettings, 'config').mockResolvedValue({
    ...authConfig,
    provider: 'openstad',
  });
  vi.spyOn(service, 'fetchClient').mockResolvedValue(targetClient());
  vi.spyOn(service, 'fetchUserData').mockResolvedValue(rawUser());
  vi.spyOn(service, 'fetchUniqueCodesForUser').mockResolvedValue({
    total: 0,
    data: [],
  });
  vi.spyOn(db.User, 'findAll').mockResolvedValue([]);
  vi.spyOn(db.User, 'create').mockResolvedValue({ id: 77, role: 'member' });
});

afterEach(() => vi.restoreAllMocks());

describe('exchange', () => {
  it('rejects an invalid or pending source token', async () => {
    expect((await call(routes.exchange, { sourceJwt: 'nope' })).status).toBe(
      401
    );
    expect(
      (await call(routes.exchange, { sourceJwt: sourceJwt({ pending: true }) }))
        .body
    ).toEqual({ status: 'invalid_token' });
  });

  it('rejects anonymous source users', async () => {
    db.User.findOne.mockResolvedValue({
      id: 5,
      projectId: 1,
      role: 'anonymous',
      idpUser: { identifier: 42, provider: 'anonymous' },
    });

    expect(
      (await call(routes.exchange, { sourceJwt: sourceJwt() })).body
    ).toEqual({ status: 'not_allowed' });
  });

  it('rejects a source user from another auth server', async () => {
    authSettings.config.mockResolvedValue({
      ...authConfig,
      serverUrlInternal: 'http://other-auth.local',
    });

    expect(
      (await call(routes.exchange, { sourceJwt: sourceJwt() })).status
    ).toBe(401);
  });

  it('mints a jwt for the target project with the member role when the user has no role row there', async () => {
    service.fetchUserData.mockResolvedValue(
      rawUser({
        role: 'admin',
        roles: [{ clientId: 'other-client', roleId: 1 }],
      })
    );

    const { status, body } = await call(routes.exchange, {
      sourceJwt: sourceJwt(),
    });

    expect(status).toBe(200);
    const claims = jwt.verify(body.jwt, secret);
    expect(claims).toMatchObject({ userId: 77, projectId: 2 });
    expect(claims.exp - claims.iat).toBe(7 * 24 * 60 * 60);
    expect(db.User.create.mock.calls[0][0]).toMatchObject({
      role: 'member',
      projectId: 2,
      idpUser: { identifier: 42, provider: 'default' },
    });
  });

  it('returns 409 without a token or upsert when 2FA is required', async () => {
    service.fetchClient.mockResolvedValue(
      targetClient({ twoFactorRoles: ['member'] })
    );

    const { status, body } = await call(routes.exchange, {
      sourceJwt: sourceJwt(),
    });

    expect(status).toBe(409);
    expect(body).toEqual({ status: 'two_factor_required' });
    expect(db.User.create).not.toHaveBeenCalled();
  });

  it('returns a pending token and the missing fields when fields are required', async () => {
    service.fetchClient.mockResolvedValue(
      targetClient({ requiredUserFields: ['postcode'] })
    );

    const { status, body } = await call(routes.exchange, {
      sourceJwt: sourceJwt(),
    });

    expect(status).toBe(409);
    expect(body.status).toBe('fields_required');
    expect(body.missingFields).toEqual(['postcode']);
    expect(jwt.verify(body.pendingJwt, secret).pending).toBe(true);
  });

  it('sends the project labels and privacy link with fields_required', async () => {
    service.fetchClient.mockResolvedValue(
      targetClient({
        requiredUserFields: ['privacyConsent'],
        config: {
          clientDisclaimerUrl: 'https://example.com/privacy',
          requiredFields: {
            requiredUserFieldsLabels: {
              privacyConsent: 'Ik ga akkoord met de {link}',
            },
          },
        },
      })
    );

    const { body } = await call(routes.exchange, { sourceJwt: sourceJwt() });

    expect(body.labels).toEqual({
      privacyConsent: 'Ik ga akkoord met de {link}',
    });
    expect(body.privacy).toEqual({
      url: 'https://example.com/privacy',
      text: 'privacyverklaring',
    });
  });

  it('forbids the admin environment for non-privileged users', async () => {
    const { status } = await call(
      routes.exchange,
      { sourceJwt: sourceJwt() },
      1
    );

    expect(status).toBe(403);
  });
});

describe('uniqueCodeLogin', () => {
  it('requires a code', async () => {
    expect((await call(routes.uniqueCodeLogin, {})).status).toBe(400);
  });

  it('maps an unknown code to 401 and passes the lockout through as 429', async () => {
    const login = vi
      .spyOn(service, 'loginWithUniqueCode')
      .mockResolvedValueOnce({ status: 404, data: { error: 'invalid_code' } })
      .mockResolvedValueOnce({
        status: 429,
        data: { error: 'too_many_attempts' },
      });

    expect((await call(routes.uniqueCodeLogin, { code: 'X' })).body).toEqual({
      status: 'invalid_code',
    });
    expect((await call(routes.uniqueCodeLogin, { code: 'X' })).status).toBe(
      429
    );
    expect(login.mock.calls[0][0]).toMatchObject({ code: 'X', ip: '1.2.3.4' });
  });

  it('tells the widget when the whole client is locked', async () => {
    vi.spyOn(service, 'loginWithUniqueCode').mockResolvedValue({
      status: 429,
      data: { error: 'too_many_attempts', scope: 'client' },
    });

    const { status, body } = await call(routes.uniqueCodeLogin, { code: 'X' });

    expect(status).toBe(429);
    expect(body).toEqual({ status: 'client_locked' });
  });

  it('mints a jwt for a valid code', async () => {
    vi.spyOn(service, 'loginWithUniqueCode').mockResolvedValue({
      status: 200,
      data: { user: rawUser(), role: 'member', isNew: true },
    });

    const { status, body } = await call(routes.uniqueCodeLogin, {
      code: 'OK',
    });

    expect(status).toBe(200);
    expect(jwt.verify(body.jwt, secret).projectId).toBe(2);
  });
});

describe('completeFields', () => {
  const pendingJwt = (claims = {}) =>
    jwt.sign({ userId: 77, projectId: 2, pending: true, ...claims }, secret);

  beforeEach(() => {
    db.User.findOne.mockResolvedValue({
      id: 77,
      projectId: 2,
      idpUser: { identifier: 42, provider: 'default' },
    });
    service.fetchClient.mockResolvedValue(
      targetClient({ requiredUserFields: ['postcode', 'accessCode'] })
    );
  });

  it('rejects tokens that are not pending or belong to another project', async () => {
    const fields = { postcode: '1234AB' };
    expect(
      (
        await call(routes.completeFields, {
          pendingJwt: pendingJwt({ pending: undefined }),
          fields,
        })
      ).status
    ).toBe(401);
    expect(
      (
        await call(routes.completeFields, {
          pendingJwt: pendingJwt({ projectId: 3 }),
          fields,
        })
      ).status
    ).toBe(401);
  });

  it('sends only the missing fields to the auth server, never a role', async () => {
    vi.spyOn(service, 'validateAccessCode').mockResolvedValue(true);
    const update = vi.spyOn(service, 'updateUser').mockResolvedValue({});

    await call(routes.completeFields, {
      pendingJwt: pendingJwt(),
      fields: {
        postcode: '1234AB',
        accessCode: 'CODE',
        role: 'admin',
        password: 'x',
      },
    });

    expect(update).toHaveBeenCalledWith({
      authConfig,
      userData: { id: 42, postcode: '1234AB', accessCode: 'CODE' },
    });
  });

  it('refuses an unknown access code without updating the user', async () => {
    vi.spyOn(service, 'validateAccessCode').mockResolvedValue(false);
    const update = vi.spyOn(service, 'updateUser');

    const { status, body } = await call(routes.completeFields, {
      pendingJwt: pendingJwt(),
      fields: { postcode: '1234AB', accessCode: 'NOPE' },
    });

    expect(status).toBe(422);
    expect(body.invalidFields).toEqual(['accessCode']);
    expect(update).not.toHaveBeenCalled();
  });

  it('mints the final jwt once all fields are filled', async () => {
    vi.spyOn(service, 'validateAccessCode').mockResolvedValue(true);
    vi.spyOn(service, 'updateUser').mockResolvedValue({});
    service.fetchUserData
      .mockResolvedValueOnce(rawUser())
      .mockResolvedValueOnce(
        rawUser({ postcode: '1234AB', accessCode: 'CODE' })
      );

    const { status, body } = await call(routes.completeFields, {
      pendingJwt: pendingJwt(),
      fields: { postcode: '1234AB', accessCode: 'CODE' },
    });

    expect(status).toBe(200);
    expect(jwt.verify(body.jwt, secret).pending).toBeUndefined();
  });

  it('asks again for the fields that are still missing', async () => {
    vi.spyOn(service, 'updateUser').mockResolvedValue({});
    service.fetchUserData
      .mockResolvedValueOnce(rawUser())
      .mockResolvedValueOnce(rawUser({ postcode: '1234AB' }));

    const { status, body } = await call(routes.completeFields, {
      pendingJwt: pendingJwt(),
      fields: { postcode: '1234AB' },
    });

    expect(status).toBe(409);
    expect(body.missingFields).toEqual(['accessCode']);
  });

  it('refuses values the project user would reject, without updating', async () => {
    vi.spyOn(service, 'validateAccessCode').mockResolvedValue(true);
    const update = vi.spyOn(service, 'updateUser');

    const { status, body } = await call(routes.completeFields, {
      pendingJwt: pendingJwt(),
      fields: { postcode: 'abc', accessCode: 'CODE' },
    });

    expect(status).toBe(422);
    expect(body).toEqual({
      status: 'invalid_fields',
      invalidFields: ['postcode'],
    });
    expect(update).not.toHaveBeenCalled();
  });

  it('does not mint a jwt when the project user cannot be updated', async () => {
    service.fetchClient.mockResolvedValue(
      targetClient({ requiredUserFields: ['postcode'] })
    );
    vi.spyOn(service, 'updateUser').mockResolvedValue({});
    service.fetchUserData
      .mockResolvedValueOnce(rawUser())
      .mockResolvedValueOnce(rawUser({ postcode: '1234AB' }));
    db.User.findAll.mockResolvedValue([
      { id: 77, update: vi.fn().mockRejectedValue(new Error('Validation')) },
    ]);

    const { body, next } = await call(routes.completeFields, {
      pendingJwt: pendingJwt(),
      fields: { postcode: '1234AB' },
    });

    expect(body).toBeUndefined();
    expect(next).toHaveBeenCalledWith(expect.any(Error));
  });
});
