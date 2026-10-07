import jwt from 'jsonwebtoken';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  applyClientConsents,
  evaluateClientGates,
  fieldLabelsFor,
  mintJwt,
  pickAllowedFields,
  privacyLinkFor,
  resolveTargetRole,
  shouldForceNewLogin,
  upsertProjectUser,
} from './inline-login.js';

const client = (overrides = {}) => ({
  id: 7,
  authTypes: ['Url'],
  requiredUserFields: [],
  twoFactorRoles: null,
  ...overrides,
});

const gates = (overrides = {}) =>
  evaluateClientGates({
    client: client(),
    user: {},
    role: 'member',
    projectId: 5,
    hasUniqueCode: false,
    ...overrides,
  });

describe('shouldForceNewLogin', () => {
  const force = ({ query = {}, auth = {}, authTypes = ['UniqueCode'] } = {}) => {
    const fetchClient = vi.fn(async () => client({ authTypes }));
    const result = shouldForceNewLogin({
      query,
      project: { config: { auth } },
      fetchClient,
    });
    return { result, fetchClient };
  };

  beforeEach(() => {
    process.env.MULTI_PROJECT_LOGIN = 'true';
  });

  afterEach(() => {
    delete process.env.MULTI_PROJECT_LOGIN;
  });

  it('honours an explicit forceNewLogin query', async () => {
    const { result, fetchClient } = force({
      query: { forceNewLogin: '1' },
      authTypes: ['Url'],
    });
    expect(await result).toBe(true);
    expect(fetchClient).not.toHaveBeenCalled();
  });

  it('forces a new login for a UniqueCode-only client', async () => {
    expect(await force().result).toBe(true);
  });

  it('keeps the shared session for other clients', async () => {
    expect(await force({ authTypes: ['Url'] }).result).toBe(false);
    expect(await force({ authTypes: ['UniqueCode', 'Url'] }).result).toBe(
      false
    );
  });

  it('stops after the forced logout to prevent a redirect loop', async () => {
    const { result, fetchClient } = force({ query: { newLoginDone: '1' } });
    expect(await result).toBe(false);
    expect(fetchClient).not.toHaveBeenCalled();
  });

  it('lets an explicit project setting win', async () => {
    const { result, fetchClient } = force({
      auth: { forceNewLoginOnWidgets: false },
    });
    expect(await result).toBe(false);
    expect(fetchClient).not.toHaveBeenCalled();
  });

  it('does nothing extra without multi-project login', async () => {
    delete process.env.MULTI_PROJECT_LOGIN;
    const { result, fetchClient } = force();
    expect(await result).toBe(false);
    expect(fetchClient).not.toHaveBeenCalled();
  });

  it('keeps the shared session when the client cannot be fetched', async () => {
    const fetchClient = vi.fn(async () => {
      throw new Error('down');
    });
    expect(
      await shouldForceNewLogin({ query: {}, project: {}, fetchClient })
    ).toBe(false);
  });
});

describe('evaluateClientGates', () => {
  it('passes a plain member on a plain project', () => {
    expect(gates()).toEqual({ ok: true });
  });

  it('forbids non-privileged users on the admin environment', () => {
    expect(gates({ projectId: 1 })).toEqual({
      ok: false,
      status: 'environment_forbidden',
    });
    expect(gates({ projectId: 1, role: 'editor' })).toEqual({ ok: true });
  });

  it('requires 2FA for roles under twoFactorRoles, before anything else the dialog could solve', () => {
    const result = gates({
      client: client({
        twoFactorRoles: ['member'],
        requiredUserFields: ['name'],
      }),
    });
    expect(result).toEqual({ ok: false, status: 'two_factor_required' });
  });

  it('uses the default member role for 2FA when no role is known', () => {
    const result = gates({
      client: client({ twoFactorRoles: ['member'] }),
      role: undefined,
    });
    expect(result.status).toBe('two_factor_required');
  });

  it('requires a confirmed phone number for Phonenumber clients unless privileged', () => {
    const phone = client({ authTypes: ['Phonenumber'] });
    expect(gates({ client: phone }).status).toBe('phonenumber_required');
    expect(
      gates({ client: phone, user: { phoneNumberConfirmed: true } })
    ).toEqual({ ok: true });
    expect(gates({ client: phone, role: 'admin' })).toEqual({ ok: true });
  });

  it('requires a unique code only when UniqueCode is the only auth type', () => {
    const onlyCode = client({ authTypes: ['UniqueCode'] });
    expect(gates({ client: onlyCode }).status).toBe('uniquecode_required');
    expect(gates({ client: onlyCode, hasUniqueCode: true })).toEqual({
      ok: true,
    });
    expect(gates({ client: onlyCode, role: 'moderator' })).toEqual({
      ok: true,
    });
    expect(
      gates({ client: client({ authTypes: ['UniqueCode', 'Url'] }) })
    ).toEqual({ ok: true });
  });

  it('lists missing fields including per-client consent', () => {
    const result = gates({
      client: client({
        requiredUserFields: [
          'name',
          'emailNotificationConsent',
          'privacyConsent',
        ],
      }),
      user: {
        name: 'Jan',
        emailNotificationConsent: { 8: true },
        privacyConsentAt: { 7: '2026-09-01' },
      },
    });
    expect(result).toEqual({
      ok: false,
      status: 'fields_required',
      missingFields: ['emailNotificationConsent'],
    });
  });
});

describe('mintJwt', () => {
  const authConfig = { provider: 'openstad', jwtSecret: 'test-secret' };

  it('signs the same claims as digest-login with the role based expiry', async () => {
    const token = await mintJwt({
      authConfig,
      userId: 3,
      role: 'member',
      projectId: 5,
    });
    const claims = jwt.verify(token, 'test-secret');

    expect(claims).toMatchObject({
      userId: 3,
      authProvider: 'openstad',
      projectId: 5,
    });
    expect(claims.pending).toBeUndefined();
    expect(claims.exp - claims.iat).toBe(7 * 24 * 60 * 60);
  });

  it('marks pending tokens and gives them a 15 minute expiry', async () => {
    const token = await mintJwt({
      authConfig,
      userId: 3,
      role: 'admin',
      projectId: 5,
      pending: true,
    });
    const claims = jwt.verify(token, 'test-secret');

    expect(claims.pending).toBe(true);
    expect(claims.exp - claims.iat).toBe(15 * 60);
  });
});

const userData = {
  idpUser: { identifier: 'abc', provider: 'openstad' },
  projectId: 5,
};
const project = (canCreateNewUsers = true) => ({
  id: 5,
  config: { users: { canCreateNewUsers } },
});
const userModel = ({ found = [], created = { id: 99 } } = {}) => ({
  findAll: vi.fn().mockResolvedValue(found),
  create: vi.fn().mockResolvedValue(created),
});

describe('upsertProjectUser', () => {
  it('updates and returns the single matching user', async () => {
    const existing = { id: 4, update: vi.fn().mockResolvedValue({}) };
    const User = userModel({ found: [existing] });

    expect(
      await upsertProjectUser({ User, project: project(), userData })
    ).toBe(4);
    expect(existing.update).toHaveBeenCalledWith(userData);
    expect(User.create).not.toHaveBeenCalled();
  });

  it('still returns the user when the update fails, like digest-login did', async () => {
    const existing = {
      id: 4,
      update: vi.fn().mockRejectedValue(new Error('nope')),
    };

    expect(
      await upsertProjectUser({
        User: userModel({ found: [existing] }),
        project: project(),
        userData,
      })
    ).toBe(4);
  });

  it('refuses when more than one user matches', async () => {
    const User = userModel({ found: [{ id: 1 }, { id: 2 }] });

    await expect(
      upsertProjectUser({ User, project: project(), userData })
    ).rejects.toMatchObject({
      status: 403,
      message: 'Meerdere users gevonden',
    });
  });

  it('creates a complete user when none exists and creation is allowed', async () => {
    const User = userModel();

    expect(
      await upsertProjectUser({ User, project: project(), userData })
    ).toBe(99);
    expect(User.create).toHaveBeenCalledWith({ ...userData, complete: true });
  });

  it('refuses to create a user when the project does not allow it', async () => {
    const User = userModel();

    await expect(
      upsertProjectUser({ User, project: project(false), userData })
    ).rejects.toMatchObject({ status: 403 });
    expect(User.create).not.toHaveBeenCalled();
  });
});

describe('applyClientConsents', () => {
  it('picks the consent values for the given client', () => {
    expect(
      applyClientConsents({
        clientId: 7,
        emailNotificationConsent: { 7: true, 8: false },
        privacyConsentAt: { 7: '2026-09-01' },
      })
    ).toEqual({
      clientId: 7,
      emailNotificationConsent: true,
      privacyConsentAt: '2026-09-01',
    });
  });

  it('drops consent fields that have no value for the client', () => {
    expect(
      applyClientConsents({
        clientId: 7,
        emailNotificationConsent: { 8: true },
      })
    ).toEqual({ clientId: 7 });
  });

  it('leaves the data alone without a clientId', () => {
    const data = { emailNotificationConsent: { 7: true } };
    expect(applyClientConsents(data)).toEqual(data);
  });
});

describe('resolveTargetRole', () => {
  it('uses the role when the user has a role row for the target client', () => {
    expect(
      resolveTargetRole({
        rawUser: { role: 'editor', roles: [{ clientId: 'target', roleId: 4 }] },
        clientId: 'target',
      })
    ).toBe('editor');
  });

  it('never takes over a role that belongs to another client', () => {
    expect(
      resolveTargetRole({
        rawUser: { role: 'admin', roles: [{ clientId: 'other', roleId: 1 }] },
        clientId: 'target',
      })
    ).toBe('member');
  });
});

describe('pickAllowedFields', () => {
  it('keeps only missing fields and drops everything else', () => {
    expect(
      pickAllowedFields({
        fields: {
          name: ' Jan ',
          role: 'admin',
          password: 'x',
          postcode: '1234AB',
        },
        missingFields: ['name'],
      })
    ).toEqual({ name: 'Jan' });
  });

  it('accepts privacy consent only as true', () => {
    const missingFields = ['privacyConsent'];
    expect(
      pickAllowedFields({ fields: { privacyConsent: true }, missingFields })
    ).toEqual({ privacyConsent: true });
    expect(
      pickAllowedFields({ fields: { privacyConsent: 'on' }, missingFields })
    ).toEqual({});
  });

  it('stores email notification consent as a boolean', () => {
    expect(
      pickAllowedFields({
        fields: { emailNotificationConsent: 'yes' },
        missingFields: ['emailNotificationConsent'],
      })
    ).toEqual({ emailNotificationConsent: false });
  });
});

describe('fieldLabelsFor', () => {
  it('returns only non-empty label overrides of the client', () => {
    expect(
      fieldLabelsFor({
        config: {
          requiredFields: {
            requiredUserFieldsLabels: { name: 'Je naam', postcode: '' },
          },
        },
      })
    ).toEqual({ name: 'Je naam' });
    expect(fieldLabelsFor({})).toEqual({});
  });
});

describe('privacyLinkFor', () => {
  it('returns the disclaimer link with a lower-case text', () => {
    expect(
      privacyLinkFor({
        config: {
          clientDisclaimerUrl: 'https://example.com/privacy',
          clientDisclaimerText: 'Privacyverklaring',
        },
      })
    ).toEqual({
      url: 'https://example.com/privacy',
      text: 'privacyverklaring',
    });
  });

  it('refuses anything that is not an http(s) url', () => {
    expect(
      privacyLinkFor({ clientDisclaimerUrl: 'javascript:alert(1)' })
    ).toBeNull();
    expect(privacyLinkFor({})).toBeNull();
  });
});
