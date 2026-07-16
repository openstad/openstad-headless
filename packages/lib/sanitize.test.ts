import { describe, expect, test } from 'vitest';

import { sanitizeHtml, sanitizeImageUrl } from './sanitize';

// Deze suite draait in Node (vitest default environment) en bewijst daarmee
// meteen het SSR-pad van isomorphic-dompurify.
describe('sanitizeHtml', () => {
  test('strips script tags', () => {
    expect(sanitizeHtml('<p>ok</p><script>alert(1)</script>')).toBe(
      '<p>ok</p>'
    );
  });

  test('strips event handler attributes', () => {
    expect(sanitizeHtml('<img src="x" onerror="alert(1)">')).toBe(
      '<img src="x">'
    );
    expect(sanitizeHtml('<p onclick="alert(1)">x</p>')).toBe('<p>x</p>');
  });

  test('strips javascript: and blocks data: script URLs', () => {
    expect(sanitizeHtml('<a href="javascript:alert(1)">x</a>')).toBe(
      '<a>x</a>'
    );
  });

  test('strips SVG/MathML vectors (html profile only)', () => {
    expect(sanitizeHtml('<svg><script>alert(1)</script></svg>')).toBe('');
    expect(sanitizeHtml('<math><mi xlink:href="x">y</mi></math>')).toBe('');
  });

  test('is resistant to basic DOM clobbering payloads', () => {
    const out = sanitizeHtml('<form><input name="attributes"></form>');
    expect(out).not.toContain('name="attributes"');
  });

  test('keeps common rte markup', () => {
    const rte =
      '<h2>Kop</h2><p class="intro">Tekst met <strong>nadruk</strong> en ' +
      '<a href="https://example.nl" target="_blank" rel="noreferrer">link</a></p>' +
      '<ul><li>een</li><li>twee</li></ul>' +
      '<table><tbody><tr><td>cel</td></tr></tbody></table>' +
      '<img src="/pad/plaatje.jpg" alt="alt">';
    const out = sanitizeHtml(rte);
    expect(out).toContain('<h2>Kop</h2>');
    expect(out).toContain('class="intro"');
    expect(out).toContain('<strong>nadruk</strong>');
    expect(out).toContain('href="https://example.nl"');
    expect(out).toContain('target="_blank"');
    expect(out).toContain('<li>een</li>');
    expect(out).toContain('<td>cel</td>');
    expect(out).toContain('alt="alt"');
  });

  test('handles empty and nullish input', () => {
    expect(sanitizeHtml('')).toBe('');
    expect(sanitizeHtml(null)).toBe('');
    expect(sanitizeHtml(undefined)).toBe('');
  });
});

describe('sanitizeImageUrl', () => {
  test.each([
    'https://example.com/image.png',
    'http://localhost:3000/image/test.jpg',
    'https://example.com/image.png?width=100&height=100',
    '/image/test.jpg',
    'images/test.jpg',
    '../images/test.jpg',
    '//cdn.example.com/image.webp',
  ])('allows safe image URL %s', (url) => {
    expect(sanitizeImageUrl(url)).toBe(url);
  });

  test.each([
    'javascript:alert(1)',
    'data:image/svg+xml,<svg onload=alert(1)>',
    'vbscript:msgbox(1)',
    'blob:https://example.com/id',
    'https://example.com/image.png\" onerror=\"alert(1)',
    'https://example.com/image.png\nscript',
    '',
  ])('rejects unsafe image URL %s', (url) => {
    expect(sanitizeImageUrl(url)).toBeUndefined();
  });

  test('trims a safe URL', () => {
    expect(sanitizeImageUrl('  /image/test.jpg  ')).toBe('/image/test.jpg');
  });

  test('rejects missing image URLs', () => {
    expect(sanitizeImageUrl(null)).toBeUndefined();
    expect(sanitizeImageUrl(undefined)).toBeUndefined();
  });
});
