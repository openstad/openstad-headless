import { describe, expect, test } from 'vitest';

import { stripHtmlTags } from './strip-html-tags';

// Deze suite draait in Node (vitest default environment), dus zonder DOM. De
// helper mag daarom geen DOMParser gebruiken.
describe('stripHtmlTags', () => {
  test('strips tags', () => {
    expect(stripHtmlTags('<div>Hoe heet jouw idee?</div>')).toBe(
      'Hoe heet jouw idee?'
    );
  });

  test('strips nested tags', () => {
    expect(stripHtmlTags('<p><em>Matrix</em> radio</p>')).toBe('Matrix radio');
  });

  test('decodes named entities so the text matches what is shown on screen', () => {
    expect(stripHtmlTags('<div>Groen &amp; water</div>')).toBe('Groen & water');
    expect(stripHtmlTags('5 &lt; 10 &gt; 3')).toBe('5 < 10 > 3');
    expect(stripHtmlTags('&quot;citaat&quot; en &apos;quote&apos;')).toBe(
      '"citaat" en \'quote\''
    );
  });

  test('decodes a non-breaking space to a normal space', () => {
    expect(stripHtmlTags('<div>Hoe heet jouw idee?&nbsp;</div>')).toBe(
      'Hoe heet jouw idee? '
    );
  });

  test('decodes numeric and hexadecimal entities', () => {
    expect(stripHtmlTags('caf&#233;')).toBe('café');
    expect(stripHtmlTags('caf&#xE9;')).toBe('café');
  });

  test('strips before decoding, so escaped markup stays literal text', () => {
    expect(stripHtmlTags('<p>&lt;script&gt;alert(1)&lt;/script&gt;</p>')).toBe(
      '<script>alert(1)</script>'
    );
  });

  test('leaves an out of range code point alone instead of throwing', () => {
    expect(() => stripHtmlTags('kapot &#999999999; einde')).not.toThrow();
    expect(stripHtmlTags('kapot &#999999999; einde')).toBe(
      'kapot &#999999999; einde'
    );
    expect(stripHtmlTags('kapot &#xFFFFFFF; einde')).toBe(
      'kapot &#xFFFFFFF; einde'
    );
  });

  test('leaves an unknown named entity alone', () => {
    expect(stripHtmlTags('merk &bedrijf; naam')).toBe('merk &bedrijf; naam');
  });

  test('leaves text without tags or entities untouched', () => {
    expect(stripHtmlTags('Welke voorzieningen mist u?')).toBe(
      'Welke voorzieningen mist u?'
    );
  });

  test('handles an empty string', () => {
    expect(stripHtmlTags('')).toBe('');
  });
});
