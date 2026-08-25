import { describe, expect, test } from 'vitest';

import { resolveFieldInteraction } from './interaction';

describe('resolveFieldInteraction', () => {
  test('counts a regular change as interaction with the fieldKey', () => {
    expect(resolveFieldInteraction({ name: 'age' })).toEqual({
      track: true,
      key: 'age',
    });
  });

  test('suppresses the mount initialisation (isInitial)', () => {
    expect(resolveFieldInteraction({ name: 'age', isInitial: true })).toEqual({
      track: false,
      key: null,
    });
  });

  test('uses interactionKey for explanation fields', () => {
    expect(
      resolveFieldInteraction({
        name: 'age',
        interactionKey: 'age::explanation',
      })
    ).toEqual({ track: true, key: 'age::explanation' });
  });

  test('does not count without a name', () => {
    expect(resolveFieldInteraction({})).toEqual({ track: false, key: null });
  });
});
