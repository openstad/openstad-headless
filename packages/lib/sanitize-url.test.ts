import { describe, expect, it } from 'vitest';

import { sanitizeUrl } from './sanitize-url';

describe('sanitizeUrl', () => {
  it('returns an empty string for empty or nullish input', () => {
    expect(sanitizeUrl('')).toBe('');
    expect(sanitizeUrl('   ')).toBe('');
    expect(sanitizeUrl(undefined)).toBe('');
    expect(sanitizeUrl(null)).toBe('');
  });

  it('blocks the javascript: protocol', () => {
    expect(sanitizeUrl('javascript:alert(1)')).toBe('');
    expect(sanitizeUrl('  JavaScript:alert(1)  ')).toBe('');
    expect(sanitizeUrl('java\tscript:alert(1)')).toBe('');
  });

  it('blocks protocol-relative urls', () => {
    const protocolRelative = '/'.repeat(2) + 'evil.example.com';
    expect(sanitizeUrl(protocolRelative)).toBe('');
  });

  it('blocks unknown schemes', () => {
    expect(sanitizeUrl('data:text/html,<script>')).toBe('');
    expect(sanitizeUrl('ftp://example.com')).toBe('');
  });

  it('allows relative urls and fragments', () => {
    expect(sanitizeUrl('/path')).toBe('/path');
    expect(sanitizeUrl('./path')).toBe('./path');
    expect(sanitizeUrl('../path')).toBe('../path');
    expect(sanitizeUrl('#anchor')).toBe('#anchor');
    expect(sanitizeUrl('?query=1')).toBe('?query=1');
  });

  it('allows http, https, mailto and tel urls', () => {
    expect(sanitizeUrl('https://example.com')).toBe('https://example.com');
    expect(sanitizeUrl('http://example.com')).toBe('http://example.com');
    expect(sanitizeUrl('mailto:a@example.com')).toBe('mailto:a@example.com');
    expect(sanitizeUrl('tel:+31612345678')).toBe('tel:+31612345678');
  });

  it('allows bare domains without a scheme', () => {
    expect(sanitizeUrl('example.com/path')).toBe('example.com/path');
  });
});
