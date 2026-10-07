import { describe, expect, it } from 'vitest';

import { getCommentPage } from './comment-page';

const comments = Array.from({ length: 25 }, (_, i) => ({ id: 100 + i }));

describe('getCommentPage', () => {
  it('rekent de positie om naar een paginanummer', () => {
    expect(getCommentPage(comments, 100, 10)).toBe(0);
    expect(getCommentPage(comments, 109, 10)).toBe(0);
    expect(getCommentPage(comments, 110, 10)).toBe(1);
    expect(getCommentPage(comments, 124, 10)).toBe(2);
  });

  it('geeft undefined als de reactie niet in de lijst staat, zoals bij een lijst van vóór het aanmaken', () => {
    expect(getCommentPage(comments, 999, 10)).toBeUndefined();
  });

  it('vindt een reactie ook als het id als tekst binnenkomt', () => {
    expect(getCommentPage([{ id: '42' }, { id: 43 }], 43, 10)).toBe(0);
    expect(getCommentPage([{ id: '42' }, { id: 43 }], '42', 10)).toBe(0);
  });

  it('geeft undefined bij onbruikbare invoer', () => {
    expect(getCommentPage(undefined, 1, 10)).toBeUndefined();
    expect(getCommentPage([], 1, 10)).toBeUndefined();
    expect(getCommentPage(comments, 'geen getal', 10)).toBeUndefined();
    expect(getCommentPage(comments, 100, 0)).toBeUndefined();
  });

  it('geeft undefined als itemsPerPage geen bruikbaar getal is, zoals bij vervuilde widgetconfig', () => {
    expect(
      getCommentPage(comments, 110, 'E2E test waarde' as unknown as number)
    ).toBeUndefined();
    expect(
      getCommentPage(comments, 110, NaN as unknown as number)
    ).toBeUndefined();
  });
});
