import { describe, expect, it } from 'vitest';

import { sentimentList } from './comment-sentiments';

describe('sentimentList', () => {
  it('keeps a stored list', () => {
    expect(sentimentList(['no sentiment'])).toEqual(['no sentiment']);
    expect(sentimentList([])).toEqual([]);
  });

  it('reads a list that was stored as JSON text', () => {
    expect(sentimentList('["for","against"]')).toEqual(['for', 'against']);
    expect(sentimentList('[]')).toEqual([]);
  });

  it('falls back to for and against when nothing usable is stored', () => {
    expect(sentimentList(undefined)).toEqual(['for', 'against']);
    expect(sentimentList('')).toEqual(['for', 'against']);
    expect(sentimentList('voor')).toEqual(['for', 'against']);
  });
});
