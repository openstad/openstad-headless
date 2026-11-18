import { describe, expect, it } from 'vitest';

import { groupTagsByType } from './group-tags-by-type';

const tags = [
  { id: 1, name: 'Zuid', type: 'Stadsdeel' },
  { id: 2, name: 'Groen', type: 'Thema' },
  { id: 3, name: 'Centrum', type: 'Stadsdeel' },
  { id: 4, name: 'Verkeer', type: 'Thema' },
  { id: 5, name: 'Losse tag', type: null },
];

describe('groupTagsByType', () => {
  it('groups tags by type and sorts groups and tags', () => {
    expect(groupTagsByType(tags, '')).toEqual([
      {
        type: 'Stadsdeel',
        tags: [
          { id: 3, name: 'Centrum', type: 'Stadsdeel' },
          { id: 1, name: 'Zuid', type: 'Stadsdeel' },
        ],
      },
      {
        type: 'Thema',
        tags: [
          { id: 2, name: 'Groen', type: 'Thema' },
          { id: 4, name: 'Verkeer', type: 'Thema' },
        ],
      },
      { type: 'Zonder type', tags: [{ id: 5, name: 'Losse tag', type: null }] },
    ]);
  });

  it('matches on the tag name', () => {
    expect(groupTagsByType(tags, 'groen')).toEqual([
      { type: 'Thema', tags: [{ id: 2, name: 'Groen', type: 'Thema' }] },
    ]);
  });

  it('matches on the type and shows the whole group', () => {
    const result = groupTagsByType(tags, 'stadsdeel');
    expect(result).toHaveLength(1);
    expect(result[0].tags.map((tag) => tag.id)).toEqual([3, 1]);
  });

  it('ignores case and surrounding spaces', () => {
    expect(
      groupTagsByType(tags, '  CENTRUM ').map((group) => group.type)
    ).toEqual(['Stadsdeel']);
  });

  it('returns an empty list when nothing matches', () => {
    expect(groupTagsByType(tags, 'bestaat niet')).toEqual([]);
  });
});
