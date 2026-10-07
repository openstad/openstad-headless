import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

process.env.NODE_CONFIG_DIR = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '../../config'
);
process.env.SUPPRESS_NO_CONFIG_WARNING = '1';

const require = createRequire(import.meta.url);
const db = require('../db');

const storedConfig = () => ({
  auth: {
    provider: {
      openstad: {
        clientId: 'client-a',
        clientSecret: 'secret-a',
        authTypes: ['Url'],
      },
    },
  },
});

function buildProject(viewer) {
  const p = db.Project.build({ id: 1, name: 'A', config: storedConfig() });
  p.auth = Object.create(db.Project.auth);
  p.auth.user = viewer;
  return p;
}

const attackBody = () => ({
  config: {
    project: { projectHasEnded: true },
    auth: {
      jwtSecret: 'x',
      adapter: { openstad: { modulePath: 'evil' } },
      provider: {
        openstad: {
          clientSecret: 'stolen',
          serverUrlInternal: 'https://evil.example',
          userMapping: '{"identifier":"user => 1"}',
          modulePath: 'evil',
          adapter: 'evil',
          authTypes: ['Url', 'Local'],
          requiredUserFields: ['name'],
          twoFactorRoles: [],
          config: { fromEmail: 'a@b.nl' },
        },
      },
    },
  },
});

const authorize = (role) => {
  const body = attackBody();
  buildProject({ role, id: 1 }).authorizeData(body, 'update', { role, id: 1 });
  return body.config;
};

describe('Project.config auth write protection', () => {
  it('editor can only write the auth settings exposed in the admin UI', () => {
    const cfg = authorize('editor');
    const openstad = cfg.auth.provider.openstad;
    expect(cfg.project).toEqual({ projectHasEnded: true });
    expect(cfg.auth.jwtSecret).toBeUndefined();
    expect(cfg.auth.adapter).toBeUndefined();
    expect(openstad.clientSecret).toBeUndefined();
    expect(openstad.serverUrlInternal).toBeUndefined();
    expect(openstad.userMapping).toBeUndefined();
    expect(openstad.modulePath).toBeUndefined();
    expect(openstad.adapter).toBeUndefined();
    expect(openstad.twoFactorRoles).toBeUndefined();
    expect(openstad.authTypes).toEqual(['Url', 'Local']);
    expect(openstad.requiredUserFields).toEqual(['name']);
    expect(openstad.config).toEqual({ fromEmail: 'a@b.nl' });
  });

  it('project admin may also set twoFactorRoles but not adapter internals', () => {
    const openstad = authorize('admin').auth.provider.openstad;
    expect(openstad.twoFactorRoles).toEqual([]);
    expect(openstad.userMapping).toBeUndefined();
    expect(openstad.serverUrlInternal).toBeUndefined();
  });

  it('superuser keeps full control over auth config', () => {
    const cfg = authorize('superuser');
    expect(cfg.auth.provider.openstad.userMapping).toBeDefined();
    expect(cfg.auth.adapter.openstad.modulePath).toBe('evil');
  });

  it('member cannot write config at all', () => {
    expect(authorize('member')).toBeUndefined();
  });
});

describe('Project.config auth secrets on view', () => {
  it('hides client secrets from editors and admins', () => {
    for (const role of ['editor', 'admin']) {
      const json = buildProject({ role, id: 1 }).toJSON();
      expect(json.config.auth.provider.openstad.clientSecret).toBeUndefined();
      expect(json.config.auth.provider.openstad.clientId).toBe('client-a');
    }
  });

  it('hides the secret of a client fetched through includeAuthConfig', () => {
    const project = buildProject({ role: 'admin', id: 1 });
    const config = project.config;
    config.auth.provider.openstad.client = { clientSecret: 'secret-a' };
    project.setDataValue('config', config);

    const json = project.toJSON();
    expect(
      json.config.auth.provider.openstad.client.clientSecret
    ).toBeUndefined();
  });

  it('shows client secrets to a superuser', () => {
    const json = buildProject({ role: 'superuser', id: 1 }).toJSON();
    expect(json.config.auth.provider.openstad.clientSecret).toBe('secret-a');
  });

  it('hides config from members', () => {
    expect(
      buildProject({ role: 'member', id: 1 }).toJSON().config
    ).toBeUndefined();
  });
});
