import { createRequire } from 'module';
import { afterEach, describe, expect, it, vi } from 'vitest';

// Same CJS singleton the service holds; stub db methods on it. hasRole is a pure
// function captured at module load, so we exercise it with crafted user roles
// rather than mocking it.
const require = createRequire(import.meta.url);
const db = require('../db');
const authClientSync = require('./authClientSync');

const origUserFindOne = db.User.findOne;

afterEach(() => {
  db.User.findOne = origUserFindOne;
});

describe('sanitizeAuthConfigForDuplication', () => {
  it('strips credentials and provider ids from every provider', () => {
    const input = {
      auth: {
        provider: {
          openstad: {
            clientId: 'a',
            clientSecret: 'b',
            client: {},
            authProviderId: 1,
            config: {
              clientId: 'c',
              clientSecret: 'd',
              authProviderId: 2,
              keep: 1,
            },
          },
        },
      },
    };
    const out = authClientSync.sanitizeAuthConfigForDuplication(input);
    const p = out.auth.provider.openstad;
    expect(p.clientId).toBeUndefined();
    expect(p.clientSecret).toBeUndefined();
    expect(p.client).toBeUndefined();
    expect(p.authProviderId).toBeUndefined();
    expect(p.config).toEqual({ keep: 1 });
  });
});

describe('stripAuthClientManagedFieldsFromProjectConfig', () => {
  it('removes managed fields and strips config only for sync-capable providers', () => {
    const config = {
      _providersForConfigStrip: { openstad: true, oidc: false },
      auth: {
        provider: {
          openstad: {
            name: 'n',
            description: 'd',
            siteUrl: 's',
            allowedDomains: [],
            config: { x: 1 },
          },
          oidc: { name: 'n2', config: { y: 2 } },
        },
      },
    };
    const out =
      authClientSync.stripAuthClientManagedFieldsFromProjectConfig(config);
    expect(out.auth.provider.openstad.name).toBeUndefined();
    expect(out.auth.provider.openstad.config).toBeUndefined(); // sync-capable → stripped
    expect(out.auth.provider.oidc.config).toEqual({ y: 2 }); // not sync-capable → preserved
    expect(out._providersForConfigStrip).toBeUndefined();
  });

  it('returns config untouched when there is no auth provider', () => {
    const config = { foo: 'bar' };
    expect(
      authClientSync.stripAuthClientManagedFieldsFromProjectConfig(config)
    ).toBe(config);
  });
});

describe('canUserUseSourceProjectForDuplication', () => {
  it('allows when no source project is given', async () => {
    expect(
      await authClientSync.canUserUseSourceProjectForDuplication({
        user: { role: 'member' },
        sourceProjectId: null,
      })
    ).toBe(true);
  });

  it('allows superusers', async () => {
    expect(
      await authClientSync.canUserUseSourceProjectForDuplication({
        user: { role: 'superuser' },
        sourceProjectId: 5,
      })
    ).toBeTruthy();
  });

  it('denies when the user has no idpUser identity', async () => {
    db.User.findOne = vi.fn();
    expect(
      await authClientSync.canUserUseSourceProjectForDuplication({
        user: { role: 'member' },
        sourceProjectId: 5,
      })
    ).toBe(false);
    expect(db.User.findOne).not.toHaveBeenCalled();
  });

  it('allows when the user is admin/editor on the source project', async () => {
    db.User.findOne = vi.fn().mockResolvedValue({ id: 1 });
    const result = await authClientSync.canUserUseSourceProjectForDuplication({
      user: { role: 'member', idpUser: { identifier: 'a', provider: 'p' } },
      sourceProjectId: 5,
    });
    expect(result).toBe(true);
  });
});

describe('buildAuthProviderSyncConfig', () => {
  it('returns a clone of the fallback config when no source project', async () => {
    const fallback = { openstad: { config: { a: 1 } } };
    const out = await authClientSync.buildAuthProviderSyncConfig({
      sourceProject: null,
      fallbackProviderConfig: fallback,
    });
    expect(out).toEqual(fallback);
    expect(out).not.toBe(fallback);
  });
});
