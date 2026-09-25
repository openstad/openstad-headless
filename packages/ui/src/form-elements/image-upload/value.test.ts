import { describe, expect, it } from 'vitest';

import {
  MockImageFile,
  buildImageValue,
  removeDescription,
  toDescriptionEntries,
  toMockImages,
  toUploadedImageName,
} from './value';

function mockImage(
  source: string,
  name: string,
  description?: string
): MockImageFile {
  return {
    source,
    options: { type: 'local', file: { name, size: 1, type: '*' } },
    description,
  };
}

describe('buildImageValue', () => {
  it('emits a new upload without a description key when no remark was typed', () => {
    const result = buildImageValue({
      uploadedImages: [{ name: 'photo_jpg', url: 'https://x/photo.jpg' }],
      mockImages: [],
    });

    expect(result).toEqual([{ name: 'photo_jpg', url: 'https://x/photo.jpg' }]);
    expect(result[0]).not.toHaveProperty('description');
  });

  it('emits a new upload with its description when a remark was typed', () => {
    const result = buildImageValue({
      uploadedImages: [{ name: 'photo_jpg', url: 'https://x/photo.jpg' }],
      mockImages: [],
      descriptions: { 'https://x/photo.jpg': 'AI-generated' },
    });

    expect(result).toEqual([
      {
        name: 'photo_jpg',
        url: 'https://x/photo.jpg',
        description: 'AI-generated',
      },
    ]);
  });

  it('emits an existing description unchanged on a round-trip, even without a session edit', () => {
    const result = buildImageValue({
      uploadedImages: [],
      mockImages: [
        mockImage('https://x/existing.jpg', 'existing_jpg', 'By an admin'),
      ],
    });

    expect(result).toEqual([
      {
        name: 'existing_jpg',
        url: 'https://x/existing.jpg',
        description: 'By an admin',
      },
    ]);
  });

  it('emits an empty description when an existing one was cleared, never the old text', () => {
    const result = buildImageValue({
      uploadedImages: [],
      mockImages: [
        mockImage('https://x/existing.jpg', 'existing_jpg', 'By an admin'),
      ],
      descriptions: { 'https://x/existing.jpg': '' },
    });

    expect(result).toEqual([
      { name: 'existing_jpg', url: 'https://x/existing.jpg', description: '' },
    ]);
  });

  it('keeps two images independent, keyed by url', () => {
    const result = buildImageValue({
      uploadedImages: [
        { name: 'a_jpg', url: 'https://x/a.jpg' },
        { name: 'b_jpg', url: 'https://x/b.jpg' },
      ],
      mockImages: [],
      descriptions: { 'https://x/a.jpg': 'First remark' },
    });

    expect(result).toEqual([
      { name: 'a_jpg', url: 'https://x/a.jpg', description: 'First remark' },
      { name: 'b_jpg', url: 'https://x/b.jpg' },
    ]);
    expect(result[1]).not.toHaveProperty('description');
  });

  it('keeps the saved emit order [new uploads, existing images] with a mixed set', () => {
    const result = buildImageValue({
      uploadedImages: [
        { name: 'first_jpg', url: 'https://x/first.jpg' },
        { name: 'second_jpg', url: 'https://x/second.jpg' },
      ],
      mockImages: [
        mockImage('https://x/existing-a.jpg', 'existing_a_jpg'),
        mockImage('https://x/existing-b.jpg', 'existing_b_jpg'),
      ],
    });

    expect(result.map((image) => image.url)).toEqual([
      'https://x/first.jpg',
      'https://x/second.jpg',
      'https://x/existing-a.jpg',
      'https://x/existing-b.jpg',
    ]);
  });
});

describe('toDescriptionEntries', () => {
  it('puts the newest upload on top, then existing images', () => {
    const result = toDescriptionEntries(
      [mockImage('https://x/existing.jpg', 'existing_jpg')],
      [
        { name: 'first_jpg', url: 'https://x/first.jpg' },
        { name: 'second_jpg', url: 'https://x/second.jpg' },
      ]
    );

    expect(result).toEqual([
      { url: 'https://x/second.jpg', name: 'second_jpg' },
      { url: 'https://x/first.jpg', name: 'first_jpg' },
      { url: 'https://x/existing.jpg', name: 'existing_jpg' },
    ]);
  });

  it('returns just the existing images when nothing new was uploaded', () => {
    const result = toDescriptionEntries(
      [mockImage('https://x/existing.jpg', 'existing_jpg')],
      []
    );

    expect(result).toEqual([
      { url: 'https://x/existing.jpg', name: 'existing_jpg' },
    ]);
  });

  it('returns just the uploads, newest first, when there are no existing images', () => {
    const result = toDescriptionEntries(
      [],
      [
        { name: 'first_jpg', url: 'https://x/first.jpg' },
        { name: 'second_jpg', url: 'https://x/second.jpg' },
      ]
    );

    expect(result).toEqual([
      { url: 'https://x/second.jpg', name: 'second_jpg' },
      { url: 'https://x/first.jpg', name: 'first_jpg' },
    ]);
  });
});

describe('removeDescription', () => {
  it('drops a single image remark without touching another image', () => {
    const descriptions = {
      'https://x/a.jpg': 'First remark',
      'https://x/b.jpg': 'Second remark',
    };

    const result = removeDescription(descriptions, 'https://x/a.jpg');

    expect(result).toEqual({ 'https://x/b.jpg': 'Second remark' });
    expect(descriptions).toEqual({
      'https://x/a.jpg': 'First remark',
      'https://x/b.jpg': 'Second remark',
    });
  });
});

describe('toMockImages', () => {
  it('carries an existing description through from overrideDefaultValue', () => {
    const result = toMockImages([
      { url: 'https://x/a.jpg', name: 'a.jpg', description: 'By an admin' },
    ]);

    expect(result).toEqual([
      {
        source: 'https://x/a.jpg',
        options: {
          type: 'local',
          file: { name: 'a.jpg', size: 1, type: '*' },
        },
        description: 'By an admin',
      },
    ]);
  });

  it('returns an empty array for a non-array value', () => {
    expect(toMockImages(undefined)).toEqual([]);
    expect(toMockImages('not-an-array')).toEqual([]);
  });
});

describe('toUploadedImageName', () => {
  // Mirrors sanitizeFileName in apps/image-server/utils.js, which sets the
  // `name` the upload endpoint returns. A mismatch here means removing a
  // photo in FilePond never finds it in uploadedImages.
  it('replaces dots with underscores', () => {
    expect(toUploadedImageName('a.png')).toBe('a_png');
  });

  it('replaces spaces and collapses repeated underscores', () => {
    expect(toUploadedImageName('Screenshot 2026-09-23 at 13.53.42.png')).toBe(
      'Screenshot_2026-09-23_at_13_53_42_png'
    );
    expect(toUploadedImageName('a  b__c.png')).toBe('a_b_c_png');
  });

  it('keeps letters, digits, dashes and underscores', () => {
    expect(toUploadedImageName('Foto-1_A.JPG')).toBe('Foto-1_A_JPG');
  });

  it('replaces non-ASCII characters like the server does', () => {
    expect(toUploadedImageName('café (1).jpg')).toBe('caf_1_jpg');
  });
});
