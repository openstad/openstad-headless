import { describe, expect, it } from 'vitest';

import {
  fromCsvIds,
  mergeNotificationTypes,
  toCsvIds,
  toggleCsvId,
} from './link-settings';

describe('csv ids', () => {
  it('parses and trims comma separated ids', () => {
    expect(fromCsvIds(' 1, 2,,3 ')).toEqual(['1', '2', '3']);
    expect(fromCsvIds(undefined)).toEqual([]);
  });

  it('joins unique ids', () => {
    expect(toCsvIds([1, '2', 1])).toBe('1,2');
  });

  it('toggles an id', () => {
    expect(toggleCsvId('1,2', 3, true)).toBe('1,2,3');
    expect(toggleCsvId('1,2,3', '2', false)).toBe('1,3');
    expect(toggleCsvId('1', 1, true)).toBe('1');
  });
});

describe('mergeNotificationTypes', () => {
  it('adds plugin types after the core types and skips duplicates', () => {
    expect(
      mergeNotificationTypes(
        [{ type: 'login email', label: 'Inloggen via e-mail' }],
        [
          { type: 'login email', label: 'Overschrijven' },
          { type: 'link invitation - user', label: 'Uitnodiging ontvangen' },
        ]
      )
    ).toEqual([
      { type: 'login email', label: 'Inloggen via e-mail' },
      { type: 'link invitation - user', label: 'Uitnodiging ontvangen' },
    ]);
  });
});
