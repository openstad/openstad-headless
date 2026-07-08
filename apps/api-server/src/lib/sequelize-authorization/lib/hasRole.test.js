import { createRequire } from 'module';
import { describe, expect, it } from 'vitest';

const require = createRequire(import.meta.url);
const hasRole = require('./hasRole');

describe('hasRole — role hierarchy', () => {
  it('superuser satisfies every role', () => {
    const user = { id: 1, role: 'superuser' };
    expect(hasRole(user, 'superuser')).toBeTruthy();
    expect(hasRole(user, 'admin')).toBeTruthy();
    expect(hasRole(user, 'editor')).toBeTruthy();
    expect(hasRole(user, 'moderator')).toBeTruthy();
    expect(hasRole(user, 'member')).toBeTruthy();
    expect(hasRole(user, 'anonymous')).toBeTruthy();
  });

  it('admin satisfies admin and below but not superuser', () => {
    const user = { id: 1, role: 'admin' };
    expect(hasRole(user, 'admin')).toBeTruthy();
    expect(hasRole(user, 'member')).toBeTruthy();
    expect(hasRole(user, 'superuser')).toBeFalsy();
  });

  it('editor satisfies editor and below but not admin', () => {
    const user = { id: 1, role: 'editor' };
    expect(hasRole(user, 'editor')).toBeTruthy();
    expect(hasRole(user, 'member')).toBeTruthy();
    expect(hasRole(user, 'admin')).toBeFalsy();
  });

  it('moderator satisfies moderator and below but not editor', () => {
    const user = { id: 1, role: 'moderator' };
    expect(hasRole(user, 'moderator')).toBeTruthy();
    expect(hasRole(user, 'anonymous')).toBeTruthy();
    expect(hasRole(user, 'editor')).toBeFalsy();
  });

  it('member satisfies member and anonymous but not moderator', () => {
    const user = { id: 1, role: 'member' };
    expect(hasRole(user, 'member')).toBeTruthy();
    expect(hasRole(user, 'anonymous')).toBeTruthy();
    expect(hasRole(user, 'moderator')).toBeFalsy();
  });

  it('anonymous only satisfies anonymous', () => {
    const user = { id: 1, role: 'anonymous' };
    expect(hasRole(user, 'anonymous')).toBeTruthy();
    expect(hasRole(user, 'member')).toBeFalsy();
  });
});

describe('hasRole — default minRole', () => {
  it('defaults to requiring admin when minRole is omitted', () => {
    expect(hasRole({ id: 1, role: 'admin' })).toBeTruthy();
    expect(hasRole({ id: 1, role: 'superuser' })).toBeTruthy();
    expect(hasRole({ id: 1, role: 'editor' })).toBeFalsy();
    expect(hasRole({ id: 1, role: 'member' })).toBeFalsy();
  });
});

describe('hasRole — owner special role', () => {
  it('grants access when minRole is "owner" and ownerId matches user.id', () => {
    const user = { id: 5, role: 'member' };
    expect(hasRole(user, 'owner', 5)).toBeTruthy();
  });

  it('denies access when minRole is "owner" and ownerId does not match', () => {
    const user = { id: 5, role: 'member' };
    expect(hasRole(user, 'owner', 99)).toBeFalsy();
  });

  it('denies access when minRole is "owner" but ownerId is not provided', () => {
    const user = { id: 5, role: 'member' };
    expect(hasRole(user, 'owner')).toBeFalsy();
  });

  it('denies even admin when minRole is "owner" and id does not match — owner is purely id-based', () => {
    const user = { id: 5, role: 'admin' };
    expect(hasRole(user, 'owner', 99)).toBeFalsy();
  });
});

describe('hasRole — array of minRoles', () => {
  it('grants access when user satisfies any role in the array', () => {
    const user = { id: 1, role: 'moderator' };
    expect(hasRole(user, ['admin', 'moderator'])).toBeTruthy();
    expect(hasRole(user, ['editor', 'moderator'])).toBeTruthy();
  });

  it('denies access when user satisfies none of the roles', () => {
    const user = { id: 1, role: 'member' };
    expect(hasRole(user, ['admin', 'editor'])).toBeFalsy();
  });
});

describe('hasRole — null / undefined user', () => {
  it('returns falsy for null user', () => {
    expect(hasRole(null, 'member')).toBeFalsy();
  });

  it('returns falsy for undefined user', () => {
    expect(hasRole(undefined, 'member')).toBeFalsy();
  });

  it('returns falsy for user with unknown role', () => {
    expect(hasRole({ id: 1, role: 'ghost' }, 'member')).toBeFalsy();
  });
});
