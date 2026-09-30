import { describe, expect, it } from 'vitest';

import { stripVisibilityScope } from './resource-create-scope.js';

describe('stripVisibilityScope', () => {
  it('removes the onlyVisible scope and keeps the rest', () => {
    const scope = [
      'defaultScope',
      'api',
      { method: ['onlyVisible', null, 'anonymous'] },
      { method: ['includeTags'] },
    ];
    const result = stripVisibilityScope(scope);
    expect(result).toEqual([
      'defaultScope',
      'api',
      { method: ['includeTags'] },
    ]);
  });

  it('returns an equivalent scope when onlyVisible is absent', () => {
    const scope = ['defaultScope', 'api', { method: ['includeStatuses'] }];
    expect(stripVisibilityScope(scope)).toEqual(scope);
  });

  it('does not mutate the input array', () => {
    const scope = ['defaultScope', { method: ['onlyVisible', 1, 'admin'] }];
    const copy = [...scope];
    stripVisibilityScope(scope);
    expect(scope).toEqual(copy);
  });

  it('handles non-array input gracefully', () => {
    expect(stripVisibilityScope(undefined)).toBeUndefined();
    expect(stripVisibilityScope(null)).toBeNull();
  });

  it('keeps string scopes untouched even if named alike', () => {
    const scope = ['defaultScope', 'api'];
    expect(stripVisibilityScope(scope)).toEqual(['defaultScope', 'api']);
  });
});
