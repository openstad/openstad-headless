// @vitest-environment jsdom
import { describe, expect, it } from 'vitest';

import { stripTrailingBreaks } from './strip-trailing-breaks';

describe('stripTrailingBreaks', () => {
  it('removes trailing breaks inside and after inline wrappers', () => {
    expect(
      stripTrailingBreaks('<p><strong>Titel plan<br><br></strong><br></p>')
    ).toBe('<p><strong>Titel plan</strong></p>');
  });

  it('removes a single serialization break pair in div blocks', () => {
    expect(
      stripTrailingBreaks('<div><strong>Titel plan<br></strong><br></div>')
    ).toBe('<div><strong>Titel plan</strong></div>');
  });

  it('keeps an intentional empty line block', () => {
    expect(stripTrailingBreaks('<p><br></p>')).toBe('<p><br></p>');
  });

  it('keeps breaks in the middle of a block', () => {
    expect(stripTrailingBreaks('<p>regel een<br>regel twee</p>')).toBe(
      '<p>regel een<br>regel twee</p>'
    );
  });

  it('removes trailing breaks inside links', () => {
    expect(
      stripTrailingBreaks('<p><a href="https://x.nl">link<br><br></a><br></p>')
    ).toBe('<p><a href="https://x.nl">link</a></p>');
  });

  it('returns an empty string unchanged', () => {
    expect(stripTrailingBreaks('')).toBe('');
  });
});
