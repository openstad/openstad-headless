import { describe, expect, it } from 'vitest';

import {
  normalizeDocuments,
  normalizeImages,
  stripFocalPoints,
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

describe('normalizeImages focalPoint', () => {
  const fp = (x, y) => ({ x, y });

  it('keeps a valid focal point', () => {
    expect(normalizeImages([{ url: 'a.jpg', focalPoint: fp(30, 70) }])).toEqual(
      [{ url: 'a.jpg', focalPoint: fp(30, 70) }]
    );
  });

  it('clamps to 0-100 and rounds to 1 decimal', () => {
    expect(
      normalizeImages([{ url: 'a.jpg', focalPoint: fp(150, -5) }])[0].focalPoint
    ).toEqual(fp(100, 0));
    expect(
      normalizeImages([{ url: 'a.jpg', focalPoint: fp(33.349, '66.66') }])[0]
        .focalPoint
    ).toEqual(fp(33.3, 66.7));
  });

  it('drops invalid focal points', () => {
    for (const bad of [
      fp(NaN, 1),
      fp('abc', 1),
      { x: 1 },
      'x',
      5,
      fp(null, 1),
    ]) {
      expect(normalizeImages([{ url: 'a.jpg', focalPoint: bad }])).toEqual([
        { url: 'a.jpg' },
      ]);
    }
  });

  it('clears the point when focalPoint is null', () => {
    const prev = [{ url: 'a.jpg', focalPoint: fp(10, 10) }];
    expect(normalizeImages([{ url: 'a.jpg', focalPoint: null }], prev)).toEqual(
      [{ url: 'a.jpg' }]
    );
  });

  it('carries the point over on the same url when the key is absent', () => {
    const prev = [{ url: 'a.jpg', focalPoint: fp(10, 20) }];
    expect(normalizeImages([{ url: 'a.jpg' }], prev)).toEqual([
      { url: 'a.jpg', focalPoint: fp(10, 20) },
    ]);
  });

  it('does not carry the point over when the url changed', () => {
    const prev = [{ url: 'a.jpg', focalPoint: fp(10, 20) }];
    expect(normalizeImages([{ url: 'b.jpg' }], prev)).toEqual([
      { url: 'b.jpg' },
    ]);
  });

  it('keeps the point for the resident-form shape {name,url,description}', () => {
    const prev = [{ url: 'a.jpg', focalPoint: fp(10, 20) }];
    expect(
      normalizeImages([{ name: 'n', url: 'a.jpg', description: 'd' }], prev)
    ).toEqual([
      { url: 'a.jpg', name: 'n', description: 'd', focalPoint: fp(10, 20) },
    ]);
  });
});

describe('stripFocalPoints', () => {
  it('removes every focalPoint key', () => {
    expect(
      stripFocalPoints([
        { url: 'a.jpg', focalPoint: { x: 1, y: 2 } },
        { url: 'b.jpg', focalPoint: null },
      ])
    ).toEqual([{ url: 'a.jpg' }, { url: 'b.jpg' }]);
  });
});
