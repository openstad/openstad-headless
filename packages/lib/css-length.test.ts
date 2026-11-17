import { describe, expect, it } from 'vitest';

import { toCssLength } from './css-length';

describe('toCssLength', () => {
  it('returns null for empty or nullish input', () => {
    expect(toCssLength('')).toBe(null);
    expect(toCssLength('   ')).toBe(null);
    expect(toCssLength(undefined)).toBe(null);
    expect(toCssLength(null)).toBe(null);
  });

  it('appends px to a bare number', () => {
    expect(toCssLength('350')).toBe('350px');
    expect(toCssLength('0')).toBe('0px');
    expect(toCssLength('12.5')).toBe('12.5px');
    expect(toCssLength('  420  ')).toBe('420px');
  });

  it('keeps a number that already carries a unit', () => {
    const units = [
      'px',
      '%',
      'vh',
      'vw',
      'em',
      'rem',
      'ex',
      'ch',
      'vmin',
      'vmax',
      'cm',
      'mm',
      'in',
      'pt',
      'pc',
    ];
    for (const unit of units) {
      expect(toCssLength(`100${unit}`)).toBe(`100${unit}`);
    }
    expect(toCssLength('12.5rem')).toBe('12.5rem');
  });

  it('rejects free text so the caller can fall back to its default', () => {
    expect(toCssLength('E2E test waarde')).toBe(null);
    expect(toCssLength('E2E test waarde (check)')).toBe(null);
    expect(toCssLength('hoog')).toBe(null);
  });

  it('rejects a valid length hidden inside other text', () => {
    expect(toCssLength('ongeveer 100px')).toBe(null);
    expect(toCssLength('100px graag')).toBe(null);
  });

  it('rejects units it cannot verify', () => {
    expect(toCssLength('calc(100% - 20px)')).toBe(null);
    expect(toCssLength('100pxx')).toBe(null);
    expect(toCssLength('-50px')).toBe(null);
  });
});
