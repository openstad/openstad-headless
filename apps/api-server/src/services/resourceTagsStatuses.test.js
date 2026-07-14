import { createRequire } from 'module';
import { afterEach, describe, expect, it, vi } from 'vitest';

const require = createRequire(import.meta.url);
const db = require('../db');
const {
  getValidTags,
  getValidStatuses,
  getOnlyIds,
} = require('./resourceTagsStatuses');

const orig = { tagFindAll: db.Tag.findAll, statusFindAll: db.Status.findAll };

afterEach(() => {
  db.Tag.findAll = orig.tagFindAll;
  db.Status.findAll = orig.statusFindAll;
});

describe('getValidTags', () => {
  it('scopes to the project and dedupes ids when not global', async () => {
    db.Tag.findAll = vi.fn().mockResolvedValue([{ id: 1 }]);
    await getValidTags(5, [1, 1, 2], false);
    const where = db.Tag.findAll.mock.calls[0][0].where;
    expect(where.projectId).toBe(5);
    expect(where.id).toBeDefined();
  });

  it('allows global tags (projectId 0) when canBeGlobal is true', async () => {
    db.Tag.findAll = vi.fn().mockResolvedValue([]);
    await getValidTags(5, [1], true);
    const where = db.Tag.findAll.mock.calls[0][0].where;
    // projectId becomes an Op.or over [projectId, 0]
    expect(typeof where.projectId).toBe('object');
  });

  it('returns the rows from the query', async () => {
    const rows = [{ id: 1 }, { id: 2 }];
    db.Tag.findAll = vi.fn().mockResolvedValue(rows);
    expect(await getValidTags(5, [1, 2], false)).toBe(rows);
  });
});

describe('getValidStatuses', () => {
  it('scopes to the project and dedupes ids', async () => {
    db.Status.findAll = vi.fn().mockResolvedValue([{ id: 3 }]);
    const result = await getValidStatuses(5, [3, 3]);
    const where = db.Status.findAll.mock.calls[0][0].where;
    expect(where.projectId).toBe(5);
    expect(result).toEqual([{ id: 3 }]);
  });
});

describe('getOnlyIds', () => {
  it('extracts ids from objects and parses string ids', () => {
    expect(getOnlyIds([{ id: 1 }, { id: '2' }])).toEqual([1, 2]);
  });

  it('drops entries without an id and non-objects', () => {
    expect(getOnlyIds([{ id: 1 }, { name: 'x' }, 5, null])).toEqual([1]);
  });
});
