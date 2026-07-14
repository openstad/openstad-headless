import { describe, expect, it } from 'vitest';

import userRoles from './userRoles.js';

const { isUnknown, isAnonymous, isMember, isAdmin } = userRoles;

describe('userRoles', () => {
  it('isUnknown only for the unknown role', () => {
    expect(isUnknown('unknown')).toBe(true);
    expect(isUnknown('member')).toBe(false);
  });

  it('isAnonymous only for the anonymous role', () => {
    expect(isAnonymous('anonymous')).toBe(true);
    expect(isAnonymous('member')).toBe(false);
  });

  it('isMember for any role other than unknown/anonymous', () => {
    expect(isMember('member')).toBe(true);
    expect(isMember('admin')).toBe(true);
    expect(isMember('unknown')).toBe(false);
    expect(isMember('anonymous')).toBe(false);
  });

  it('isAdmin for admin and su', () => {
    expect(isAdmin('admin')).toBe(true);
    expect(isAdmin('su')).toBe(true);
    expect(isAdmin('editor')).toBe(false);
  });
});
