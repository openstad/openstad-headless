import { describe, expect, test } from 'vitest';

import normalizeUrl from './normalize-url.js';

const { normalizeContributedUrl } = normalizeUrl;

describe('normalizeContributedUrl', () => {
  test('passes through an absent value unchanged', () => {
    expect(normalizeContributedUrl(undefined)).toEqual({
      ok: true,
      value: undefined,
    });
    expect(normalizeContributedUrl(null)).toEqual({ ok: true, value: null });
  });

  test('rejects non-string values instead of storing them unchecked', () => {
    // Regression: these used to be passed through as valid, so a payload sent
    // straight to the API could store any value without validation.
    expect(normalizeContributedUrl(['javascript:alert(1)'])).toEqual({
      ok: false,
    });
    expect(normalizeContributedUrl({ url: 'https://example.com' })).toEqual({
      ok: false,
    });
    expect(normalizeContributedUrl(42)).toEqual({ ok: false });
    expect(normalizeContributedUrl(true)).toEqual({ ok: false });
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

  test('replaces smart quotes inside the URL with straight quotes', () => {
    const result = normalizeContributedUrl('https://example.com/“path”/x');
    expect(result.ok).toBe(true);
    expect(result.value).toBe('https://example.com/%22path%22/x');
    expect(result.value).not.toMatch(/[“”]/);
  });

  test('strips a trailing quote even when it is part of the path', () => {
    // Known trade-off of stripping wrapping quotes: a quote at the very end
    // cannot be told apart from a Word-style wrapping quote, so it is dropped.
    // A URL ending in a quote is far rarer than a quoted paste from Word.
    expect(normalizeContributedUrl('https://example.com/“path”')).toEqual({
      ok: true,
      value: 'https://example.com/%22path',
    });
  });

  test('strips quotes wrapped around the whole URL', () => {
    // Regression: copying a link from Word wraps it in typographic quotes,
    // which used to end up as https://"https://example.com" — a URL that
    // passes validation but is dead.
    expect(normalizeContributedUrl('“https://example.com”')).toEqual({
      ok: true,
      value: 'https://example.com/',
    });
    expect(normalizeContributedUrl('"https://example.com"')).toEqual({
      ok: true,
      value: 'https://example.com/',
    });
    expect(normalizeContributedUrl(' “https://example.com” ')).toEqual({
      ok: true,
      value: 'https://example.com/',
    });
  });

  test('strips quotes in linear time on a long input', () => {
    // Regression: an anchored /["']+$/ backtracks quadratically, so with the
    // 10mb body limit a long run of quotes blocked the event loop for minutes.
    const hostile = 'a' + '"'.repeat(200000) + 'b';
    const started = Date.now();
    normalizeContributedUrl(hostile);
    expect(Date.now() - started).toBeLessThan(1000);
  });

  test('replaces en/em dashes with a hyphen', () => {
    const result = normalizeContributedUrl('https://example.com/a–b—c');
    expect(result).toEqual({ ok: true, value: 'https://example.com/a-b-c' });
  });

  test('replaces non-breaking spaces with a regular space and trims', () => {
    const result = normalizeContributedUrl(' https://example.com ');
    expect(result).toEqual({ ok: true, value: 'https://example.com/' });
  });

  test('stores the parsed URL, not the raw input', () => {
    // Regression: new URL() drops tabs and newlines before parsing, so the
    // validated URL and the stored one used to differ.
    expect(normalizeContributedUrl('https://exam\nple.com/x')).toEqual({
      ok: true,
      value: 'https://example.com/x',
    });
    expect(normalizeContributedUrl('https://exam\tple.com/x')).toEqual({
      ok: true,
      value: 'https://example.com/x',
    });
    expect(normalizeContributedUrl('https://example.com/<script>')).toEqual({
      ok: true,
      value: 'https://example.com/%3Cscript%3E',
    });
  });

  test('is idempotent, so re-submitting a stored URL does not change it', () => {
    const once = normalizeContributedUrl('“https://example.com/<a>”');
    expect(once.ok).toBe(true);
    expect(normalizeContributedUrl(once.value)).toEqual(once);
  });

  test('prepends https:// when no scheme is present', () => {
    expect(normalizeContributedUrl('www.example.com')).toEqual({
      ok: true,
      value: 'https://www.example.com/',
    });
    expect(normalizeContributedUrl('example.com/path')).toEqual({
      ok: true,
      value: 'https://example.com/path',
    });
  });

  test('keeps an existing http/https scheme intact', () => {
    expect(normalizeContributedUrl('http://example.com')).toEqual({
      ok: true,
      value: 'http://example.com/',
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
    expect(result.value).toBe('http://example.com/');
    expect(result.value).not.toContain('https://HTTP');
  });

  test('rejects non-http(s) schemes instead of silently mangling them', () => {
    expect(normalizeContributedUrl('mailto:foo@bar.nl')).toEqual({ ok: false });
    expect(normalizeContributedUrl('ftp://example.com')).toEqual({
      ok: false,
    });
    expect(normalizeContributedUrl('javascript:alert(1)')).toEqual({
      ok: false,
    });
  });

  test('rejects values that cannot be parsed as a URL', () => {
    expect(normalizeContributedUrl('https://')).toEqual({ ok: false });
  });
  // Word/Excel emit these instead of a normal space. The replacement that was
  // meant to map them used a plain space on both sides, so a separator inside
  // the path was stored percent-encoded as-is (e.g. '%C2%A0') and the link was
  // dead. Escapes rather than literals: a literal one is unreviewable here.
  test.each([
    ['\u00A0', 'no-break space'],
    ['\u202F', 'narrow no-break space'],
    ['\u2009', 'thin space'],
    ['\u3000', 'ideographic space'],
    ['\u2002', 'en space'],
  ])('normalizes a %s (%s) in the path to a regular space', (sep) => {
    expect(normalizeContributedUrl(`https://example.org/a${sep}b`)).toEqual({
      ok: true,
      value: 'https://example.org/a%20b',
    });
  });

  test('a value of only typographic spaces is treated as blank, not a URL', () => {
    for (const blank of ['\u00A0', '\u3000', '\u00A0 \u2009']) {
      expect(normalizeContributedUrl(blank)).toEqual({
        ok: true,
        value: blank,
      });
    }
  });
});
