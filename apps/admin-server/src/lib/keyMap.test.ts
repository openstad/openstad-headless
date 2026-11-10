import { describe, expect, it } from 'vitest';

import { keyMap, reverseKeyMap } from './keyMap';

describe('reverseKeyMap for official responses', () => {
  it('maps the current header to modBreaks', () => {
    expect(keyMap.modBreaks).toBe('Officiële reacties');
    expect(reverseKeyMap['Officiële reacties']).toBe('modBreaks');
  });

  it('still maps the legacy header of old exports to modBreaks', () => {
    expect(reverseKeyMap['Moderatie berichten']).toBe('modBreaks');
  });
});
