import { describe, expect, test } from 'vitest';

import canBypassEditLock from './can-bypass-edit-lock.js';

const user = (role) => ({ id: 1, role });

describe('canBypassEditLock', () => {
  test('editor: bypasses for any change', () => {
    expect(canBypassEditLock(user('editor'), ['title'])).toBe(true);
  });

  test('admin: bypasses for any change', () => {
    expect(canBypassEditLock(user('admin'), ['title', 'modBreaks'])).toBe(true);
  });

  test('moderator changing only modBreaks: bypasses', () => {
    expect(canBypassEditLock(user('moderator'), ['modBreaks'])).toBe(true);
  });

  test('moderator changing modBreaks and title: locked', () => {
    expect(canBypassEditLock(user('moderator'), ['modBreaks', 'title'])).toBe(
      false
    );
  });

  test('moderator on destroy (changed() is false): locked', () => {
    expect(canBypassEditLock(user('moderator'), false)).toBe(false);
  });

  test('moderator with nothing changed: locked', () => {
    expect(canBypassEditLock(user('moderator'), [])).toBe(false);
  });

  test('member changing only modBreaks: locked', () => {
    expect(canBypassEditLock(user('member'), ['modBreaks'])).toBe(false);
  });

  test('no user: locked', () => {
    expect(canBypassEditLock(undefined, ['modBreaks'])).toBe(false);
  });
});
