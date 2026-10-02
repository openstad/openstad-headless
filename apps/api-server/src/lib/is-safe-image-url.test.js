import { describe, expect, it } from 'vitest';

import isSafeImageUrl from './is-safe-image-url.js';

describe('isSafeImageUrl', () => {
  it.each([
    'https://example.org/logo.png',
    'http://localhost:31450/image/051fbe14c63d89753ad0ea77ae76c141',
    '/image/051fbe14c63d89753ad0ea77ae76c141',
    '  https://example.org/logo.png  ',
  ])('accepts %s', (url) => {
    expect(isSafeImageUrl(url)).toBe(true);
  });

  it.each([
    'javascript:alert(1)',
    'JavaScript:alert(1)',
    'data:image/svg+xml;base64,PHN2Zz48L3N2Zz4=',
    'vbscript:msgbox(1)',
    'https://example.org/logo.png" onerror="alert(1)',
    'https://example.org/<script>',
    'java\tscript:alert(1)',
    '',
    '   ',
  ])('rejects %j', (url) => {
    expect(isSafeImageUrl(url)).toBe(false);
  });

  it.each([undefined, null, 42, {}, ['https://example.org/logo.png']])(
    'rejects non-string %j',
    (url) => {
      expect(isSafeImageUrl(url)).toBe(false);
    }
  );
});
