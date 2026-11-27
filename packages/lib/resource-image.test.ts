import { describe, expect, test } from 'vitest';

import { getResourceImage, getResourceImageUrl } from './resource-image';

describe('getResourceImageUrl', () => {
  test('uses the first own image of the resource', () => {
    expect(
      getResourceImageUrl({
        images: [{ url: 'https://img/a.jpg' }, { url: 'https://img/b.jpg' }],
        tags: [{ name: 'Groen', defaultResourceImage: 'https://img/tag.jpg' }],
      })
    ).toBe('https://img/a.jpg');
  });

  test('skips own images without a url', () => {
    expect(
      getResourceImageUrl({
        images: [{ url: '' }, { url: 'https://img/b.jpg' }],
      })
    ).toBe('https://img/b.jpg');
  });

  test('falls back to the default image of a tag', () => {
    expect(
      getResourceImageUrl({
        images: [],
        tags: [{ name: 'Groen', defaultResourceImage: 'https://img/tag.jpg' }],
      })
    ).toBe('https://img/tag.jpg');
  });

  test('picks the tag image by tag name order, regardless of input order', () => {
    expect(
      getResourceImageUrl({
        tags: [
          { name: 'Zuid', defaultResourceImage: 'https://img/zuid.jpg' },
          { name: 'Centrum', defaultResourceImage: 'https://img/centrum.jpg' },
        ],
      })
    ).toBe('https://img/centrum.jpg');
  });

  test('does not reorder the tags of the resource', () => {
    const tags = [
      { name: 'Zuid', defaultResourceImage: 'https://img/zuid.jpg' },
      { name: 'Centrum' },
    ];
    getResourceImageUrl({ tags });
    expect(tags.map((tag) => tag.name)).toEqual(['Zuid', 'Centrum']);
  });

  test('returns an empty string when there is no image at all', () => {
    expect(getResourceImageUrl({ images: [], tags: [{ name: 'Groen' }] })).toBe(
      ''
    );
    expect(getResourceImageUrl(undefined)).toBe('');
  });
});

describe('getResourceImage', () => {
  test('returns url and focal point of the first own image', () => {
    expect(
      getResourceImage({
        images: [
          { url: '' },
          { url: 'https://img/b.jpg', focalPoint: { x: 20, y: 80 } },
        ],
      })
    ).toEqual({ url: 'https://img/b.jpg', focalPoint: { x: 20, y: 80 } });
  });

  test('has no focal point when the image has none', () => {
    expect(
      getResourceImage({ images: [{ url: 'https://img/a.jpg' }] }).focalPoint
    ).toBeUndefined();
  });

  test('tag default image has no focal point', () => {
    expect(
      getResourceImage({
        images: [],
        tags: [{ name: 'Groen', defaultResourceImage: 'https://img/tag.jpg' }],
      })
    ).toEqual({ url: 'https://img/tag.jpg' });
  });

  test('returns an empty url when nothing is available', () => {
    expect(getResourceImage(undefined)).toEqual({ url: '' });
  });
});
