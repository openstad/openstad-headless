import { describe, expect, test } from 'vitest';

import { buildTagGroups } from './tag-groups';

const allTags = [
  { id: 1, type: 'thema' },
  { id: 2, type: 'thema' },
  { id: 3, type: 'gebied' },
  { id: 4, type: 'gebied' },
];

describe('buildTagGroups', () => {
  test('groups selected tags per type for the and filter', () => {
    expect(
      buildTagGroups({
        allTags,
        selectedTagIds: [1, 3],
        filterBehavior: 'and',
        perTagTabActive: false,
      })
    ).toEqual([[1], [3]]);
  });

  test('keeps tags of the same type in one group', () => {
    expect(
      buildTagGroups({
        allTags,
        selectedTagIds: [1, 2, 4],
        filterBehavior: 'and',
        perTagTabActive: false,
      })
    ).toEqual([[1, 2], [4]]);
  });

  test('returns no groups for the or filter', () => {
    expect(
      buildTagGroups({
        allTags,
        selectedTagIds: [1, 3],
        filterBehavior: 'or',
        perTagTabActive: false,
      })
    ).toEqual([]);
  });

  test('returns no groups without a filter behavior', () => {
    expect(
      buildTagGroups({
        allTags,
        selectedTagIds: [1, 3],
        perTagTabActive: false,
      })
    ).toEqual([]);
  });

  test('returns no groups without selected tags', () => {
    expect(
      buildTagGroups({
        allTags,
        selectedTagIds: [],
        filterBehavior: 'and',
        perTagTabActive: false,
      })
    ).toEqual([]);
  });

  test('returns no groups while a per tag voting tab is active', () => {
    expect(
      buildTagGroups({
        allTags,
        selectedTagIds: [1, 3],
        filterBehavior: 'and',
        perTagTabActive: true,
      })
    ).toEqual([]);
  });

  test('ignores selected tags that are not known', () => {
    expect(
      buildTagGroups({
        allTags,
        selectedTagIds: [1, 99],
        filterBehavior: 'and',
        perTagTabActive: false,
      })
    ).toEqual([[1]]);
  });

  test('returns no groups while the tags are still loading', () => {
    expect(
      buildTagGroups({
        allTags: [],
        selectedTagIds: [1, 3],
        filterBehavior: 'and',
        perTagTabActive: false,
      })
    ).toEqual([]);
  });
});
