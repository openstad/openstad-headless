import { describe, expect, it } from 'vitest';

import { hashWidgetUrl, normalizeWidgetUrl } from './normalize-widget-url.js';

describe('normalizeWidgetUrl', () => {
  it('strips query string and fragment', () => {
    expect(normalizeWidgetUrl('https://openstad.org/test?p=4#section')).toBe(
      'https://openstad.org/test'
    );
  });

  it('keeps origin + path for a plain url', () => {
    expect(normalizeWidgetUrl('https://openstad.org/test/pagina')).toBe(
      'https://openstad.org/test/pagina'
    );
  });

  it('lowercases scheme and host but preserves path case', () => {
    expect(normalizeWidgetUrl('HTTPS://OpenStad.ORG/Test/Pagina')).toBe(
      'https://openstad.org/Test/Pagina'
    );
  });

  it('strips trailing slashes except for the root path', () => {
    expect(normalizeWidgetUrl('https://openstad.org/test/')).toBe(
      'https://openstad.org/test'
    );
    expect(normalizeWidgetUrl('https://openstad.org/test///')).toBe(
      'https://openstad.org/test'
    );
    expect(normalizeWidgetUrl('https://openstad.org/')).toBe(
      'https://openstad.org/'
    );
    expect(normalizeWidgetUrl('https://openstad.org')).toBe(
      'https://openstad.org/'
    );
  });

  it('drops default ports but keeps custom ports', () => {
    expect(normalizeWidgetUrl('https://openstad.org:443/test')).toBe(
      'https://openstad.org/test'
    );
    expect(normalizeWidgetUrl('http://localhost:3000/test')).toBe(
      'http://localhost:3000/test'
    );
  });

  it('returns null for unparseable input', () => {
    expect(normalizeWidgetUrl('not a url')).toBeNull();
    expect(normalizeWidgetUrl('')).toBeNull();
    expect(normalizeWidgetUrl(null)).toBeNull();
    expect(normalizeWidgetUrl(undefined)).toBeNull();
    expect(normalizeWidgetUrl(42)).toBeNull();
  });

  it('returns null for non-http(s) schemes', () => {
    expect(normalizeWidgetUrl('ftp://openstad.org/test')).toBeNull();
    expect(normalizeWidgetUrl('file:///etc/passwd')).toBeNull();
    expect(normalizeWidgetUrl('javascript:alert(1)')).toBeNull();
    expect(normalizeWidgetUrl('about:blank')).toBeNull();
  });

  it('truncates to 2048 characters', () => {
    const longPath = '/' + 'a'.repeat(3000);
    const result = normalizeWidgetUrl(`https://openstad.org${longPath}`);
    expect(result.length).toBe(2048);
    expect(result.startsWith('https://openstad.org/aaa')).toBe(true);
  });
});

describe('hashWidgetUrl', () => {
  it('returns a deterministic 64 character hex string', () => {
    const hash = hashWidgetUrl('https://openstad.org/test');
    expect(hash).toMatch(/^[a-f0-9]{64}$/);
    expect(hashWidgetUrl('https://openstad.org/test')).toBe(hash);
  });

  it('differs per input', () => {
    expect(hashWidgetUrl('https://openstad.org/test')).not.toBe(
      hashWidgetUrl('https://openstad.org/anders')
    );
  });
});
