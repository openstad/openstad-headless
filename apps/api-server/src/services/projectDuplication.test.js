import { createRequire } from 'module';
import { afterEach, describe, expect, it, vi } from 'vitest';

// Use createRequire so we get the same CJS module.exports reference (the db
// singleton) that the service holds, then stub methods on it — the pattern used
// across this app's tests (vi.mock does not intercept these internal requires).
const require = createRequire(import.meta.url);
const db = require('../db');
const dup = require('./projectDuplication');

const orig = {
  tagCreate: db.Tag.create,
  tagFindAll: db.Tag.findAll,
  userFindOne: db.User.findOne,
  userCreate: db.User.create,
};

afterEach(() => {
  db.Tag.create = orig.tagCreate;
  db.Tag.findAll = orig.tagFindAll;
  db.User.findOne = orig.userFindOne;
  db.User.create = orig.userCreate;
});

describe('updateWidgetIds (pure id remap)', () => {
  it('remaps projectId, resourceId and choiceguideWidgetId', () => {
    const obj = { projectId: 1, resourceId: 10, choiceguideWidgetId: 100 };
    dup.updateWidgetIds(obj, { 100: 200 }, { 10: 20 }, {}, {}, 5);
    expect(obj).toEqual({
      projectId: 5,
      resourceId: 20,
      choiceguideWidgetId: 200,
    });
  });

  it('remaps comma-separated tag and status id strings', () => {
    const obj = { tags: '1,2', statusId: 3 };
    dup.updateWidgetIds(obj, {}, {}, { 1: 11, 2: 22 }, { 3: 33 }, 9);
    expect(obj.tags).toBe('11,22');
    expect(obj.statusId).toBe('33');
  });

  it('recurses into nested objects', () => {
    const obj = { nested: { projectId: 1 } };
    dup.updateWidgetIds(obj, {}, {}, {}, {}, 7);
    expect(obj.nested.projectId).toBe(7);
  });
});

describe('getValidTags', () => {
  it('dedupes ids and returns only tag ids that belong to the project', async () => {
    db.Tag.findAll = vi.fn().mockResolvedValue([{ id: 11 }, { id: 12 }]);
    const result = await dup.getValidTags(5, [11, 11, 12]);
    expect(result).toEqual([11, 12]);
    expect(db.Tag.findAll).toHaveBeenCalledWith({
      where: { id: [11, 12], projectId: 5 },
    });
  });
});

describe('createTags', () => {
  it('maps originalId → new id on success', async () => {
    db.Tag.create = vi.fn().mockResolvedValue({ id: 99 });
    const tagMap = {};
    const errors = [];
    await dup.createTags([{ originalId: 1, name: 'x' }], 5, tagMap, errors);
    expect(tagMap).toEqual({ 1: 99 });
    expect(errors).toEqual([]);
    expect(db.Tag.create).toHaveBeenCalledWith({
      originalId: 1,
      name: 'x',
      projectId: 5,
    });
  });

  it('collects an error instead of throwing on failure', async () => {
    db.Tag.create = vi.fn().mockRejectedValue(new Error('boom'));
    const errors = [];
    await dup.createTags([{ originalId: 1 }], 5, {}, errors);
    expect(errors).toEqual([{ step: 'Create tags', error: 'boom' }]);
  });
});

describe('getOrCreateUser', () => {
  it('returns the cached id without hitting the db', async () => {
    db.User.findOne = vi.fn();
    const userMap = { 7: 42 };
    const id = await dup.getOrCreateUser(7, userMap, 5, new Set());
    expect(id).toBe(42);
    expect(db.User.findOne).not.toHaveBeenCalled();
  });

  it('clones a found user into the new project and tracks the created id', async () => {
    db.User.findOne = vi
      .fn()
      .mockResolvedValueOnce({
        id: 1,
        idpUser: { identifier: 'a', provider: 'p' },
      }) // lookup by id
      .mockResolvedValueOnce(null); // no existing user in target project
    db.User.create = vi.fn().mockResolvedValue({ id: 500 });
    const createdUserIds = new Set();
    const userMap = {};

    const id = await dup.getOrCreateUser(1, userMap, 5, createdUserIds);

    expect(id).toBe(500);
    expect(userMap).toEqual({ 1: 500 });
    expect(createdUserIds.has(500)).toBe(true);
    // cloned payload must not carry the source id and must target the new project
    const created = db.User.create.mock.calls[0][0];
    expect(created.id).toBeUndefined();
    expect(created.projectId).toBe(5);
  });
});
