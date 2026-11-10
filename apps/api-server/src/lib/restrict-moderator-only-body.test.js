import { describe, expect, test } from 'vitest';

import {
  restrictBodyForModeratorOnly,
  restrictModeratorOnlyBody,
} from './restrict-moderator-only-body.js';

const user = (role) => ({ id: 1, role });
const fullBody = () => ({
  title: 'Hacked title',
  tags: [1, 2],
  statuses: [3],
  publishDate: '2026-01-01T00:00:00.000Z',
  modBreaks: [{ description: 'official response' }],
});

describe('restrictBodyForModeratorOnly', () => {
  test('editor: body passes through unchanged', () => {
    const body = fullBody();
    expect(restrictBodyForModeratorOnly(body, user('editor'))).toBe(body);
  });

  test('admin: body passes through unchanged', () => {
    const body = fullBody();
    expect(restrictBodyForModeratorOnly(body, user('admin'))).toBe(body);
  });

  test('moderator: reduced to only modBreaks, everything else dropped', () => {
    const body = fullBody();
    expect(restrictBodyForModeratorOnly(body, user('moderator'))).toEqual({
      modBreaks: body.modBreaks,
    });
  });

  test('member: body passes through unchanged (modBreaks stripped elsewhere)', () => {
    const body = fullBody();
    expect(restrictBodyForModeratorOnly(body, user('member'))).toBe(body);
  });

  test('no user: body passes through unchanged', () => {
    const body = fullBody();
    expect(restrictBodyForModeratorOnly(body, null)).toBe(body);
  });

  test('moderator with no modBreaks in body: reduced body has modBreaks undefined', () => {
    const body = { title: 'Hacked title', tags: [1] };
    expect(restrictBodyForModeratorOnly(body, user('moderator'))).toEqual({
      modBreaks: undefined,
    });
  });

  test('moderator on their own resource: body passes through unchanged', () => {
    const body = fullBody();
    expect(restrictBodyForModeratorOnly(body, user('moderator'), 1)).toBe(body);
  });

  test("moderator on someone else's resource: reduced to modBreaks", () => {
    const body = fullBody();
    expect(restrictBodyForModeratorOnly(body, user('moderator'), 2)).toEqual({
      modBreaks: body.modBreaks,
    });
  });
});

describe('restrictModeratorOnlyBody middleware', () => {
  const run = (role, ownerId) => {
    const req = {
      body: fullBody(),
      user: user(role),
      results: { userId: ownerId },
    };
    let called = false;
    restrictModeratorOnlyBody(req, {}, () => {
      called = true;
    });
    return { req, called };
  };

  test("moderator on someone else's resource: req.body reduced, next called", () => {
    const { req, called } = run('moderator', 2);
    expect(req.body).toEqual({ modBreaks: fullBody().modBreaks });
    expect(called).toBe(true);
  });

  test('moderator owner: req.body untouched', () => {
    const { req } = run('moderator', 1);
    expect(req.body.title).toBe('Hacked title');
  });

  test('editor: req.body untouched', () => {
    const { req } = run('editor', 2);
    expect(req.body.tags).toEqual([1, 2]);
  });

  test('no loaded resource: moderator still reduced to modBreaks', () => {
    const req = { body: fullBody(), user: user('moderator') };
    restrictModeratorOnlyBody(req, {}, () => {});
    expect(req.body).toEqual({ modBreaks: fullBody().modBreaks });
  });
});
