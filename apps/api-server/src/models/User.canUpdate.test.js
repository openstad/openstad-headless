import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

// The model is plain CommonJS and pulls in config at require time.
process.env.NODE_CONFIG_DIR = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '../../config'
);
process.env.SUPPRESS_NO_CONFIG_WARNING = '1';

const require = createRequire(import.meta.url);
const db = require('../db');
const can = require('../lib/sequelize-authorization/mixins/can');

// User.can('update', actor) guards the user update, anonymize and two-factor
// routes, so every caller depends on this matrix.
function user(role, id, identifier) {
  return {
    id,
    role,
    idpUser: identifier ? { identifier, provider: 'openstad' } : undefined,
    auth: Object.create(db.User.auth),
    can,
    toString: () => 'SequelizeInstance:user',
  };
}

const target = (role, id = 93) => user(role, id, 'idp-93');

describe('User.can("update")', () => {
  it('denies an anonymous request', () => {
    expect(
      !!target('admin').can('update', { role: 'anonymous', id: null })
    ).toBe(false);
  });

  it('denies a request with no user at all', () => {
    expect(!!target('admin').can('update', undefined)).toBe(false);
  });

  it('denies a member acting on someone else', () => {
    expect(!!target('member', 93).can('update', user('member', 7))).toBe(false);
  });

  it('denies a moderator acting on an admin', () => {
    expect(!!target('admin').can('update', user('moderator', 8))).toBe(false);
  });

  it('allows a moderator acting on a member', () => {
    expect(!!target('member').can('update', user('moderator', 8))).toBe(true);
  });

  it('allows an admin acting on an admin', () => {
    expect(!!target('admin').can('update', user('admin', 1))).toBe(true);
  });

  it('allows a member acting on their own record', () => {
    expect(!!target('member', 93).can('update', user('member', 93))).toBe(true);
  });

  it('allows the same person through their idp identity on another project', () => {
    const other = user('member', 500, 'idp-93');
    expect(!!target('member', 93).can('update', other)).toBe(true);
  });

  it('denies a user of another auth provider with the same identifier', () => {
    const lookalike = user('member', 500);
    lookalike.idpUser = { identifier: 'idp-93', provider: 'oidc' };
    expect(!!target('member', 93).can('update', lookalike)).toBe(false);
  });

  it('falls back to the user attached by auth.useReqUser', () => {
    const self = target('admin');
    self.auth.user = { role: 'anonymous', id: null };
    expect(!!self.can('update')).toBe(false);

    self.auth.user = user('admin', 1);
    expect(!!self.can('update')).toBe(true);
  });
});

describe('User.can("update"/"delete") across projects', () => {
  const inProject = (u, projectId) => Object.assign(u, { projectId });

  it('denies a moderator of project A acting on a member row in project B', () => {
    const victim = inProject(target('member'), 2);
    expect(!!victim.can('update', inProject(user('moderator', 8), 1))).toBe(
      false
    );
  });

  it('denies an admin of project A deleting a member row in project B', () => {
    const victim = inProject(target('member'), 2);
    expect(!!victim.can('delete', inProject(user('admin', 8), 1))).toBe(false);
  });

  it('still allows a moderator acting on a member in their own project', () => {
    const member = inProject(target('member'), 1);
    expect(!!member.can('update', inProject(user('moderator', 8), 1))).toBe(
      true
    );
  });

  it('still allows a superuser acting on another project', () => {
    const member = inProject(target('member'), 2);
    expect(!!member.can('update', inProject(user('superuser', 1), 1))).toBe(
      true
    );
    expect(!!member.can('delete', inProject(user('superuser', 1), 1))).toBe(
      true
    );
  });

  it('still allows the same person through their idp identity on another project', () => {
    const own = inProject(target('member'), 2);
    expect(
      !!own.can('update', inProject(user('member', 500, 'idp-93'), 1))
    ).toBe(true);
  });
});
