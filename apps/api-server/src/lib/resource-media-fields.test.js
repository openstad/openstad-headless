import { describe, expect, it } from 'vitest';

import {
  normalizeDocuments,
  normalizeImages,
} from './resource-media-fields.js';

describe('normalizeImages', () => {
  it('keeps an already correct array of image objects', () => {
    const value = [
      { url: 'https://a.jpg', name: 'a.jpg' },
      { url: 'https://b.jpg' },
    ];
    expect(normalizeImages(value)).toEqual(value);
  });

  it('wraps a single image object into an array', () => {
    expect(normalizeImages({ url: 'https://a.jpg', name: 'a.jpg' })).toEqual([
      { url: 'https://a.jpg', name: 'a.jpg' },
    ]);
  });

  it('parses a valid JSON array string', () => {
    const input = '[{"url":"https://a.jpg"},{"url":"https://b.jpg"}]';
    expect(normalizeImages(input)).toEqual([
      { url: 'https://a.jpg' },
      { url: 'https://b.jpg' },
    ]);
  });

  it('recovers the pre-fix export format (objects joined without brackets)', () => {
    const input = '{"url":"https://a.jpg"},{"url":"https://b.jpg"}';
    expect(normalizeImages(input)).toEqual([
      { url: 'https://a.jpg' },
      { url: 'https://b.jpg' },
    ]);
  });

  it('wraps a bare URL string', () => {
    expect(normalizeImages('https://example.com/foo.jpg')).toEqual([
      { url: 'https://example.com/foo.jpg' },
    ]);
  });

  it('wraps a quoted URL string', () => {
    expect(normalizeImages('"https://example.com/foo.jpg"')).toEqual([
      { url: 'https://example.com/foo.jpg' },
    ]);
  });

  it('splits multiple quoted URLs joined by a comma', () => {
    expect(normalizeImages('"https://a.jpg", "https://b.jpg"')).toEqual([
      { url: 'https://a.jpg' },
      { url: 'https://b.jpg' },
    ]);
  });

  it('splits multiple bare URLs separated by | (the convention this import tool already uses for statuses/tags)', () => {
    expect(
      normalizeImages('https://a.jpg | https://b.jpg | https://c.jpg')
    ).toEqual([
      { url: 'https://a.jpg' },
      { url: 'https://b.jpg' },
      { url: 'https://c.jpg' },
    ]);
  });

  it('does not split a single bare URL that happens to contain a comma', () => {
    expect(normalizeImages('https://example.com/foo.jpg?a=1,2')).toEqual([
      { url: 'https://example.com/foo.jpg?a=1,2' },
    ]);
  });

  it('splits the "url (description)" shorthand the resources export produces', () => {
    expect(
      normalizeImages(
        'http://localhost:31450/image/a.jpg (a nice sunset) | http://localhost:31450/image/b.jpg'
      )
    ).toEqual([
      {
        url: 'http://localhost:31450/image/a.jpg',
        description: 'a nice sunset',
      },
      { url: 'http://localhost:31450/image/b.jpg' },
    ]);
  });

  it('drops entries without a url', () => {
    expect(normalizeImages([{ name: 'no url here' }])).toEqual([]);
  });

  it('returns an empty array for null, empty string or empty array', () => {
    expect(normalizeImages(null)).toEqual([]);
    expect(normalizeImages('')).toEqual([]);
    expect(normalizeImages([])).toEqual([]);
  });
});

describe('normalizeDocuments', () => {
  it('keeps a size only when it is a valid number', () => {
    expect(
      normalizeDocuments([
        {
          url: 'https://a.pdf',
          name: 'a.pdf',
          size: '12345',
          mimeType: 'application/pdf',
        },
      ])
    ).toEqual([
      {
        url: 'https://a.pdf',
        name: 'a.pdf',
        mimeType: 'application/pdf',
        size: 12345,
      },
    ]);
  });

  it('omits size when it is not a valid number', () => {
    expect(normalizeDocuments([{ url: 'https://a.pdf', size: 'n/a' }])).toEqual(
      [{ url: 'https://a.pdf' }]
    );
  });

  it('recovers the pre-fix export format the same way as images', () => {
    const input = '{"url":"https://a.pdf"},{"url":"https://b.pdf"}';
    expect(normalizeDocuments(input)).toEqual([
      { url: 'https://a.pdf' },
      { url: 'https://b.pdf' },
    ]);
  });

  it('splits the "url (name)" shorthand the resources export produces', () => {
    const input =
      'http://localhost:31450/document/GEHA027-ffeb9d1b.pdf (GEHA027_Website_Gemeente-Hardenberg_LR_V2_pdf) | http://localhost:31450/document/visje.pdf (visje_pdf)';
    expect(normalizeDocuments(input)).toEqual([
      {
        url: 'http://localhost:31450/document/GEHA027-ffeb9d1b.pdf',
        name: 'GEHA027_Website_Gemeente-Hardenberg_LR_V2_pdf',
      },
      { url: 'http://localhost:31450/document/visje.pdf', name: 'visje_pdf' },
    ]);
  });

  it('keeps a bare document URL without a name when there is no annotation', () => {
    expect(normalizeDocuments('http://localhost:31450/document/a.pdf')).toEqual(
      [{ url: 'http://localhost:31450/document/a.pdf' }]
    );
  });
});
