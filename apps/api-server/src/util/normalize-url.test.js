import { describe, expect, test } from 'vitest';

import normalizeUrl from './normalize-url.js';

const { normalizeContributedUrl } = normalizeUrl;

describe('normalizeContributedUrl', () => {
  test('passes through non-string values unchanged', () => {
    expect(normalizeContributedUrl(undefined)).toEqual({
      ok: true,
      value: undefined,
    });
    expect(normalizeContributedUrl(null)).toEqual({ ok: true, value: null });
  });

  test('treats empty / whitespace-only input as valid and unchanged', () => {
    expect(normalizeContributedUrl('')).toEqual({ ok: true, value: '' });
    expect(normalizeContributedUrl('   ')).toEqual({ ok: true, value: '   ' });
    // non-breaking space only
    expect(normalizeContributedUrl(' ')).toEqual({
      ok: true,
      value: ' ',
    });
  });

  test('replaces smart quotes with straight quotes', () => {
    const result = normalizeContributedUrl('https://example.com/“path”');
    expect(result.ok).toBe(true);
    expect(result.value).toBe('https://example.com/"path"');
    expect(result.value).not.toMatch(/[“”]/);
  });

  test('replaces en/em dashes with a hyphen', () => {
    const result = normalizeContributedUrl('https://example.com/a–b—c');
    expect(result).toEqual({ ok: true, value: 'https://example.com/a-b-c' });
  });

  test('replaces non-breaking spaces with a regular space and trims', () => {
    const result = normalizeContributedUrl(' https://example.com ');
    expect(result).toEqual({ ok: true, value: 'https://example.com' });
  });

  test('prepends https:// when no scheme is present', () => {
    expect(normalizeContributedUrl('www.example.com')).toEqual({
      ok: true,
      value: 'https://www.example.com',
    });
    expect(normalizeContributedUrl('example.com/path')).toEqual({
      ok: true,
      value: 'https://example.com/path',
    });
  });

  test('keeps an existing http/https scheme intact', () => {
    expect(normalizeContributedUrl('http://example.com')).toEqual({
      ok: true,
      value: 'http://example.com',
    });
    expect(normalizeContributedUrl('https://example.com/path')).toEqual({
      ok: true,
      value: 'https://example.com/path',
    });
  });

  test('handles an uppercase scheme without mangling it', () => {
    // Regression: a case-sensitive check used to turn "HTTP://" into
    // "https://HTTP://..."; the scheme detection is now case-insensitive.
    const result = normalizeContributedUrl('HTTP://example.com');
    expect(result.ok).toBe(true);
    expect(result.value).toBe('HTTP://example.com');
    expect(result.value).not.toContain('https://HTTP');
  });

  test('rejects non-http(s) schemes instead of silently mangling them', () => {
    expect(normalizeContributedUrl('mailto:foo@bar.nl')).toEqual({ ok: false });
    expect(normalizeContributedUrl('ftp://example.com')).toEqual({
      ok: false,
    });
  });

  test('rejects values that cannot be parsed as a URL', () => {
    expect(normalizeContributedUrl('https://')).toEqual({ ok: false });
  });
});
