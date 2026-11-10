import { createRequire } from 'node:module';
import { afterEach, describe, expect, it, vi } from 'vitest';

const require = createRequire(import.meta.url);
const {
  absoluteUrl,
  detailUrlFromTags,
  resolvedDetailUrl,
} = require('./resource-detail-urls');

describe('detailUrlFromTags', () => {
  it('uses the first tag with a detail page in the tag order', () => {
    expect(
      detailUrlFromTags(12, [
        {
          id: 3,
          seqnr: 20,
          detailPageUrl: '/initiatief?openstadResourceId=[id]',
        },
        {
          id: 4,
          seqnr: 10,
          detailPageUrl: '/stadmaker?openstadResourceId=[id]',
        },
        { id: 5, seqnr: 5, detailPageUrl: null },
      ])
    ).toBe('/stadmaker?openstadResourceId=12');
  });

  it('falls back to the tag id when the order is equal', () => {
    expect(
      detailUrlFromTags(12, [
        { id: 9, seqnr: 10, detailPageUrl: '/b/[id]' },
        { id: 2, seqnr: 10, detailPageUrl: '/a/[id]' },
      ])
    ).toBe('/a/12');
  });

  it('accepts a full url and ignores unsafe values', () => {
    expect(
      detailUrlFromTags(7, [
        { id: 1, seqnr: 1, detailPageUrl: 'javascript:alert(1)' },
        { id: 2, seqnr: 2, detailPageUrl: 'https://voorbeeld.nl/s/[id]' },
      ])
    ).toBe('https://voorbeeld.nl/s/7');
  });

  it('returns nothing without a tag with a detail page', () => {
    expect(detailUrlFromTags(7, [{ id: 1, seqnr: 1 }])).toBeNull();
    expect(detailUrlFromTags(7, undefined)).toBeNull();
  });
});

describe('absoluteUrl', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('keeps a full url', () => {
    expect(absoluteUrl('https://voorbeeld.nl/s/7', {})).toBe(
      'https://voorbeeld.nl/s/7'
    );
  });

  it('puts the project url in front of a path', () => {
    expect(absoluteUrl('/s/7', { url: 'stad.example.nl/' })).toBe(
      'https://stad.example.nl/s/7'
    );
    vi.stubEnv('FORCE_HTTP', 'yes');
    expect(absoluteUrl('/s/7', { url: 'localhost:31490/koppelingen' })).toBe(
      'http://localhost:31490/koppelingen/s/7'
    );
  });

  it('gives no url for a path without a project url', () => {
    expect(absoluteUrl('/s/7', {})).toBeNull();
    expect(absoluteUrl(null, { url: 'x.nl' })).toBeNull();
  });
});

describe('resolvedDetailUrl', () => {
  const tags = [{ id: 1, seqnr: 1, detailPageUrl: '/stadmaker/[id]' }];

  it('places a path within the project url', () => {
    expect(
      resolvedDetailUrl(5, tags, { url: 'https://stad.nl/koppelingen' })
    ).toBe('https://stad.nl/koppelingen/stadmaker/5');
  });

  it('keeps the path for a project without url', () => {
    expect(resolvedDetailUrl(5, tags, {})).toBe('/stadmaker/5');
  });
});
