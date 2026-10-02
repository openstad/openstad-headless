import { describe, expect, test } from 'vitest';

import hasModBreakContent from './has-mod-break-content.js';

describe('hasModBreakContent', () => {
  test('rejects missing or non-string descriptions', () => {
    expect(hasModBreakContent(undefined)).toBe(false);
    expect(hasModBreakContent(null)).toBe(false);
    expect(hasModBreakContent(42)).toBe(false);
    expect(hasModBreakContent('')).toBe(false);
  });

  test('rejects markup without visible text', () => {
    expect(hasModBreakContent('<div><br></div>')).toBe(false);
    expect(hasModBreakContent('<div>&nbsp;</div>')).toBe(false);
    expect(hasModBreakContent('<p>   </p>')).toBe(false);
    expect(hasModBreakContent('<ul><li><br /></li></ul>')).toBe(false);
    expect(hasModBreakContent('<ol><li><br /></li></ol>')).toBe(false);
    expect(hasModBreakContent('<blockquote><br /></blockquote>')).toBe(false);
    expect(hasModBreakContent('<div>&#160;</div>')).toBe(false);
    expect(hasModBreakContent('<div>\u200B</div>')).toBe(false);
  });

  test('accepts markup with visible text', () => {
    expect(hasModBreakContent('<div>Let op</div>')).toBe(true);
    expect(hasModBreakContent('Plain text')).toBe(true);
  });
});
