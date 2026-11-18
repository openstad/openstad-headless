import { describe, expect, it } from 'vitest';

import {
  MAX_IMAGE_DESCRIPTION_LENGTH,
  assertImageDescriptionsWithinLimit,
} from './image-description.js';

describe('assertImageDescriptionsWithinLimit', () => {
  it('accepts images without a description', () => {
    expect(() =>
      assertImageDescriptionsWithinLimit([{ url: 'https://example.org/a.png' }])
    ).not.toThrow();
  });

  it('accepts a description of exactly the maximum length', () => {
    expect(() =>
      assertImageDescriptionsWithinLimit([
        {
          url: 'https://example.org/a.png',
          description: 'a'.repeat(MAX_IMAGE_DESCRIPTION_LENGTH),
        },
      ])
    ).not.toThrow();
  });

  it('rejects a description above the maximum length', () => {
    expect(() =>
      assertImageDescriptionsWithinLimit([
        { url: 'https://example.org/a.png', description: 'ok' },
        {
          url: 'https://example.org/b.png',
          description: 'a'.repeat(MAX_IMAGE_DESCRIPTION_LENGTH + 1),
        },
      ])
    ).toThrow('Opmerking bij een afbeelding mag maximaal 500 tekens zijn');
  });

  it.each([undefined, null, 'https://example.org/a.png', {}])(
    'ignores a non-array value %j',
    (value) => {
      expect(() => assertImageDescriptionsWithinLimit(value)).not.toThrow();
    }
  );
});
