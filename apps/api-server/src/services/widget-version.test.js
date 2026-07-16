import { describe, expect, it, vi } from 'vitest';

import widgetVersionService from './widget-version.js';

vi.mock('../db', () => ({ default: {} }));

const { resolveUserName, isSameConfig, selectPruneIds, MAX_VERSIONS } =
  widgetVersionService;

describe('widget-version service', () => {
  describe('resolveUserName', () => {
    it('prefers displayName, then name, then email', () => {
      expect(
        resolveUserName({ displayName: 'Ada', name: 'A', email: 'a@x.nl' })
      ).toBe('Ada');
      expect(resolveUserName({ name: 'A', email: 'a@x.nl' })).toBe('A');
      expect(resolveUserName({ email: 'a@x.nl' })).toBe('a@x.nl');
    });

    it('returns null when the user is missing or has no name fields', () => {
      expect(resolveUserName(null)).toBeNull();
      expect(resolveUserName(undefined)).toBeNull();
      expect(resolveUserName({})).toBeNull();
    });
  });

  describe('isSameConfig', () => {
    it('treats identical configs as equal', () => {
      expect(isSameConfig({ a: 1, b: 2 }, { a: 1, b: 2 })).toBe(true);
    });

    it('treats differing configs as not equal', () => {
      expect(isSameConfig({ a: 1 }, { a: 2 })).toBe(false);
      expect(isSameConfig({ a: 1 }, { a: 1, b: 2 })).toBe(false);
    });

    it('ignores object key order (MySQL JSON normalizes keys)', () => {
      expect(isSameConfig({ a: 1, b: 2 }, { b: 2, a: 1 })).toBe(true);
      expect(
        isSameConfig(
          { outer: { y: 1, x: 2 }, list: [{ q: 1, p: 2 }] },
          { list: [{ p: 2, q: 1 }], outer: { x: 2, y: 1 } }
        )
      ).toBe(true);
    });
  });

  describe('selectPruneIds', () => {
    it('returns no ids when at or below the cap', () => {
      const versions = Array.from({ length: MAX_VERSIONS }, (_, i) => ({
        id: i + 1,
      }));
      expect(selectPruneIds(versions, MAX_VERSIONS)).toEqual([]);
    });

    it('returns the oldest ids beyond the cap (list is newest first)', () => {
      const versions = Array.from({ length: MAX_VERSIONS + 3 }, (_, i) => ({
        id: i + 1,
      }));
      const pruned = selectPruneIds(versions, MAX_VERSIONS);
      expect(pruned).toHaveLength(3);
      expect(pruned).toEqual([
        MAX_VERSIONS + 1,
        MAX_VERSIONS + 2,
        MAX_VERSIONS + 3,
      ]);
    });
  });
});
