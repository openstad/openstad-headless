import { describe, expect, test } from 'vitest';

import { tagIcon } from './tag-icon';

describe('tagIcon', () => {
  test('prefers the list icon', () => {
    expect(tagIcon({ listIcon: 'list.svg', mapIcon: 'map.svg' })).toBe(
      'list.svg'
    );
  });

  test('falls back to the map icon', () => {
    expect(tagIcon({ mapIcon: 'map.svg' })).toBe('map.svg');
    expect(tagIcon({ listIcon: '', mapIcon: 'map.svg' })).toBe('map.svg');
  });

  test('returns false when the tag has no icon', () => {
    expect(tagIcon({})).toBe(false);
  });

  test('returns false without a tag', () => {
    expect(tagIcon(null)).toBe(false);
    expect(tagIcon(undefined)).toBe(false);
  });
});
