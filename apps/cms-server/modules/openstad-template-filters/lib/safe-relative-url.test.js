import { describe, expect, test } from 'vitest';

const { safeRelativeUrl } = require('./safe-relative-url');

describe('safeRelativeUrl', () => {
  test('allows relative paths, anchors and query strings', () => {
    expect(safeRelativeUrl('/pagina/sub')).toBe('/pagina/sub');
    expect(safeRelativeUrl('#sectie')).toBe('#sectie');
    expect(safeRelativeUrl('?taal=en')).toBe('?taal=en');
  });

  test('allows http(s), mailto and tel URLs', () => {
    expect(safeRelativeUrl('https://example.nl/x')).toBe(
      'https://example.nl/x'
    );
    expect(safeRelativeUrl('http://example.nl')).toBe('http://example.nl');
    expect(safeRelativeUrl('mailto:info@example.nl')).toBe(
      'mailto:info@example.nl'
    );
    expect(safeRelativeUrl('tel:+31201234567')).toBe('tel:+31201234567');
  });

  test('blocks javascript:, data: and vbscript: URLs', () => {
    expect(safeRelativeUrl('javascript:alert(1)')).toBe('');
    expect(safeRelativeUrl('JaVaScRiPt:alert(1)')).toBe('');
    expect(safeRelativeUrl('data:text/html,<script>alert(1)</script>')).toBe(
      ''
    );
    expect(safeRelativeUrl('vbscript:msgbox(1)')).toBe('');
  });

  test('blocks protocol-relative URLs', () => {
    expect(safeRelativeUrl('//evil.example/pad')).toBe('');
  });

  test('passes quote-laden but scheme-valid input through unchanged (escaping is autoescape terrein)', () => {
    expect(safeRelativeUrl('/pad?x="onmouseover="alert(1)')).toBe(
      '/pad?x="onmouseover="alert(1)'
    );
  });

  test('handles junk input', () => {
    expect(safeRelativeUrl('')).toBe('');
    expect(safeRelativeUrl('   ')).toBe('');
    expect(safeRelativeUrl(null)).toBe('');
    expect(safeRelativeUrl(undefined)).toBe('');
    expect(safeRelativeUrl(42)).toBe('');
    expect(safeRelativeUrl('geen url en geen pad')).toBe('');
  });
});
