import { afterEach, beforeEach, describe, expect, test } from 'vitest';

const db = require('../db');
const admin = require('./admin');
const userMw = require('./user');
const codeMw = require('./code');
const accessCodeMw = require('./access-code');

const ADMIN_CLIENT_ID = 'admin-client-id';
const adminClient = { id: 1, clientId: ADMIN_CLIENT_ID };
const ownClient = { id: 5, clientId: 'own-client-id' };
const otherClient = { id: 7, clientId: 'other-client-id' };

const run = (mw, req) =>
  new Promise((resolve) => {
    const result = mw(req, {}, (err) => resolve(err));
    if (result && typeof result.catch === 'function') result.catch(resolve);
  });

let originalEnv;
const originalModels = {};

beforeEach(() => {
  originalEnv = process.env.AUTH_ADMIN_CLIENT_ID;
  process.env.AUTH_ADMIN_CLIENT_ID = ADMIN_CLIENT_ID;
  for (const key of ['UserRole', 'UniqueCode', 'AccessCode']) {
    originalModels[key] = db[key];
  }
});

afterEach(() => {
  if (originalEnv === undefined) delete process.env.AUTH_ADMIN_CLIENT_ID;
  else process.env.AUTH_ADMIN_CLIENT_ID = originalEnv;
  Object.assign(db, originalModels);
});

describe('admin.isAdminClient', () => {
  test('matches the seeded admin client by id 1 or by AUTH_ADMIN_CLIENT_ID', () => {
    expect(admin.isAdminClient(adminClient)).toBe(true);
    expect(admin.isAdminClient({ id: 9, clientId: ADMIN_CLIENT_ID })).toBe(
      true
    );
    expect(admin.isAdminClient(ownClient)).toBe(false);
  });

  test('does not treat every client as admin when the env var is missing', () => {
    delete process.env.AUTH_ADMIN_CLIENT_ID;
    expect(admin.isAdminClient({ id: 5, clientId: undefined })).toBe(false);
    expect(admin.isAdminClient(undefined)).toBe(false);
  });
});

describe('admin.ensureOwnClient', () => {
  test('allows a client to act on itself', async () => {
    const err = await run(admin.ensureOwnClient, {
      user: ownClient,
      client: { ...ownClient },
    });
    expect(err).toBeUndefined();
  });

  test('rejects a client acting on another client with 403', async () => {
    const err = await run(admin.ensureOwnClient, {
      user: ownClient,
      client: otherClient,
    });
    expect(err?.status).toBe(403);
  });

  test('allows the admin client to act on any client', async () => {
    const err = await run(admin.ensureOwnClient, {
      user: adminClient,
      client: otherClient,
    });
    expect(err).toBeUndefined();
  });
});

describe('admin.ensureAdminClient', () => {
  test('rejects non-admin clients with 403 and allows the admin client', async () => {
    expect(
      (await run(admin.ensureAdminClient, { user: ownClient }))?.status
    ).toBe(403);
    expect(
      await run(admin.ensureAdminClient, { user: adminClient })
    ).toBeUndefined();
  });
});

describe('user.saveRoles client scoping', () => {
  const saved = [];
  beforeEach(() => {
    saved.length = 0;
    db.UserRole = {
      findOne: async () => null,
      create: async (values) => saved.push(values),
    };
  });

  const req = (user) => ({
    user,
    userObject: { id: 42 },
    roles: [
      { id: 1, name: 'admin' },
      { id: 2, name: 'member' },
    ],
    clients: [ownClient, otherClient, adminClient],
    body: {
      roles: {
        [ownClient.clientId]: 'member',
        [otherClient.clientId]: 'admin',
        [String(adminClient.id)]: 'admin',
      },
    },
  });

  test('a non-admin client may not write roles for other clients (403)', async () => {
    const err = await run(userMw.saveRoles, req(ownClient));
    expect(err?.status).toBe(403);
    expect(saved).toEqual([]);
  });

  test('a non-admin client writes the role for its own client', async () => {
    const r = req(ownClient);
    r.body.roles = { [ownClient.clientId]: 'member' };
    const err = await run(userMw.saveRoles, r);
    expect(err).toBeUndefined();
    expect(saved).toEqual([{ clientId: 5, roleId: 2, userId: 42 }]);
  });

  test('the admin client writes roles for every client', async () => {
    await run(userMw.saveRoles, req(adminClient));
    expect(saved.map((r) => r.clientId).sort()).toEqual([1, 5, 7]);
  });
});

describe('user.ensureIdentityWriteAllowed', () => {
  const target = (...clientIds) => ({
    id: 42,
    roles: clientIds.map((clientId) => ({ clientId })),
  });
  const req = (user, userObject, body = {}) => ({ user, userObject, body });

  test.each([
    ['email', 'new@example.nl'],
    ['password', 'secret123'],
    ['twoFactorToken', null],
    ['twoFactorConfigured', false],
  ])(
    'non-admin client may not change %s of a user with roles on other clients',
    async (key, value) => {
      const err = await run(
        userMw.ensureIdentityWriteAllowed,
        req(ownClient, target(5, 7), { [key]: value })
      );
      expect(err?.status).toBe(403);
    }
  );

  test('non-admin client may change identity of a user only known to itself', async () => {
    const err = await run(
      userMw.ensureIdentityWriteAllowed,
      req(ownClient, target(5), { email: 'new@example.nl' })
    );
    expect(err).toBeUndefined();
  });

  test('non-identity updates stay allowed for a shared user', async () => {
    const err = await run(
      userMw.ensureIdentityWriteAllowed,
      req(ownClient, target(5, 7), {
        name: 'New name',
        email: '',
        roles: { 'own-client-id': 'member' },
      })
    );
    expect(err).toBeUndefined();
  });

  test('admin client may change identity of any user', async () => {
    const err = await run(
      userMw.ensureIdentityWriteAllowed,
      req(adminClient, target(5, 7), { password: 'secret123' })
    );
    expect(err).toBeUndefined();
  });

  test('delete of a shared user by a non-admin client is rejected', async () => {
    const err = await run(
      userMw.ensureDeleteAllowed,
      req(ownClient, target(5, 1))
    );
    expect(err?.status).toBe(403);
  });

  test('delete of a user only known to the calling client is allowed', async () => {
    expect(
      await run(userMw.ensureDeleteAllowed, req(ownClient, target(5)))
    ).toBeUndefined();
    expect(
      await run(userMw.ensureDeleteAllowed, req(adminClient, target(5, 7)))
    ).toBeUndefined();
  });
});

describe('unique code lookups by id are scoped to the authenticated client', () => {
  let lastWhere;
  beforeEach(() => {
    db.UniqueCode = {
      findOne: async ({ where }) => {
        lastWhere = where;
        return null;
      },
    };
  });

  test('non-admin lookup includes the client id condition', async () => {
    await run(codeMw.withOne, {
      user: ownClient,
      body: {},
      params: { codeId: '3' },
    });
    expect(lastWhere).toEqual({ id: '3', clientId: 5 });
  });

  test('a code of another client is not found (404)', async () => {
    const err = await run(codeMw.withOne, {
      user: ownClient,
      body: {},
      params: { codeId: '3' },
    });
    expect(err?.status).toBe(404);
  });

  test('admin lookup is not restricted to a client', async () => {
    await run(codeMw.withOne, {
      user: adminClient,
      body: {},
      params: { codeId: '3' },
    });
    expect(lastWhere).toEqual({ id: '3' });
  });
});

describe('access code scoping', () => {
  test('deleteOne only finds codes of the authenticated client', async () => {
    let lastWhere;
    db.AccessCode = {
      findOne: async ({ where }) => {
        lastWhere = where;
        return null;
      },
    };
    const err = await run(accessCodeMw.deleteOne, {
      user: ownClient,
      body: {},
      params: { codeId: '3' },
    });
    expect(lastWhere).toEqual({ id: '3', clientId: 5 });
    expect(err?.status).toBe(404);
  });

  test('withAll always filters on the resolved client', async () => {
    let lastWhere;
    db.AccessCode = {
      findAll: async ({ where }) => {
        lastWhere = where;
        return [];
      },
      count: async () => 0,
    };
    await run(accessCodeMw.withAll, { query: {}, client: ownClient });
    expect(lastWhere.clientId).toBe(5);
  });
});
