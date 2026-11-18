import { describe, expect, it } from 'vitest';

import {
  filterStaleTagGroups,
  handleTagCheckboxGroupChange,
} from './TagGroupHelper';

describe('handleTagCheckboxGroupChange', () => {
  it('adds a new group when a type is checked on', () => {
    const result = handleTagCheckboxGroupChange('theme', true, [], 'type', 7);
    expect(result).toEqual([
      {
        type: 'theme',
        multiple: false,
        label: '',
        projectId: '7',
        inlineOptions: false,
      },
    ]);
  });

  it('removes the group when a type is checked off', () => {
    const groups = [{ type: 'theme' }, { type: 'area' }];
    const result = handleTagCheckboxGroupChange('theme', false, groups, 'type');
    expect(result).toEqual([{ type: 'area' }]);
  });

  it('toggles the multiple flag on the matching group', () => {
    const groups = [{ type: 'theme', multiple: false }];
    const result = handleTagCheckboxGroupChange(
      'theme',
      true,
      groups,
      'multiple'
    );
    expect(result[0].multiple).toBe(true);
  });

  it('toggles the inlineOptions flag on the matching group', () => {
    const groups = [{ type: 'theme', inlineOptions: false }];
    const result = handleTagCheckboxGroupChange(
      'theme',
      true,
      groups,
      'inlineOptions'
    );
    expect(result[0].inlineOptions).toBe(true);
  });

  it('leaves groups unchanged when no group matches a flag change', () => {
    const groups = [{ type: 'area' }];
    const result = handleTagCheckboxGroupChange(
      'theme',
      true,
      groups,
      'multiple'
    );
    expect(result).toEqual([{ type: 'area' }]);
  });
});

describe('filterStaleTagGroups', () => {
  it('keeps only groups whose type is still valid', () => {
    const groups = [{ type: 'theme' }, { type: 'area' }, { type: 'stale' }];
    expect(filterStaleTagGroups(groups, ['theme', 'area'])).toEqual([
      { type: 'theme' },
      { type: 'area' },
    ]);
  });

  it('returns an empty array when nothing is valid', () => {
    expect(filterStaleTagGroups([{ type: 'x' }], [])).toEqual([]);
  });

  it('preserves object identity of kept groups', () => {
    const group = { type: 'theme' };
    const result = filterStaleTagGroups([group], ['theme']);
    expect(result[0]).toBe(group);
  });
});
