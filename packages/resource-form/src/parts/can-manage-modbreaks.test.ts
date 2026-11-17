import { describe, expect, test } from 'vitest';

import {
  canManageModBreaks,
  isRestrictedToModBreaks,
} from './can-manage-modbreaks';

const user = (role: string) => ({ id: 1, role });

describe('canManageModBreaks', () => {
  test('editor, editing an existing resource: true', () => {
    expect(canManageModBreaks(user('editor'), true, 42)).toBe(true);
  });

  test('admin, editing an existing resource: true', () => {
    expect(canManageModBreaks(user('admin'), true, 42)).toBe(true);
  });

  test('member: false', () => {
    expect(canManageModBreaks(user('member'), true, 42)).toBe(false);
  });

  test("role 'moderator', editing an existing resource: true", () => {
    expect(canManageModBreaks(user('moderator'), true, 42)).toBe(true);
  });

  test('editor without edit permission: false', () => {
    expect(canManageModBreaks(user('editor'), false, 42)).toBe(false);
  });

  test('editor creating a new resource (no id yet): false', () => {
    expect(canManageModBreaks(user('editor'), true, undefined)).toBe(false);
  });

  test('no user: false', () => {
    expect(canManageModBreaks(null, true, 42)).toBe(false);
  });
});

describe('isRestrictedToModBreaks', () => {
  test("moderator on someone else's resource: true", () => {
    expect(isRestrictedToModBreaks(user('moderator'), 2)).toBe(true);
  });

  test('moderator on their own resource: false', () => {
    expect(isRestrictedToModBreaks(user('moderator'), 1)).toBe(false);
  });

  test('moderator, resource without owner: true', () => {
    expect(isRestrictedToModBreaks(user('moderator'), null)).toBe(true);
  });

  test('editor: false', () => {
    expect(isRestrictedToModBreaks(user('editor'), 2)).toBe(false);
  });

  test('member: false', () => {
    expect(isRestrictedToModBreaks(user('member'), 2)).toBe(false);
  });
});
