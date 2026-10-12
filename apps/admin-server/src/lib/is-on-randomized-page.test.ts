import { describe, expect, it } from 'vitest';

import { isOnRandomizedPage } from './is-on-randomized-page';

const items = [
  { id: 'a', questionType: 'open' },
  { id: 'p2', questionType: 'pagination', randomizeQuestions: true },
  { id: 'b', questionType: 'open' },
  { id: 'p3', questionType: 'pagination', randomizeQuestions: false },
  { id: 'c', questionType: 'open' },
];

describe('isOnRandomizedPage', () => {
  it('is false for a question on the first page', () => {
    expect(isOnRandomizedPage(items, 'a')).toBe(false);
  });

  it('is true for a question after a randomized page break', () => {
    expect(isOnRandomizedPage(items, 'b')).toBe(true);
  });

  it('only looks at the page the question is on', () => {
    expect(isOnRandomizedPage(items, 'c')).toBe(false);
  });

  it('uses the last page for a question that is not added yet', () => {
    expect(
      isOnRandomizedPage(
        [
          ...items,
          { id: 'p4', questionType: 'pagination', randomizeQuestions: true },
        ],
        null
      )
    ).toBe(true);
    expect(isOnRandomizedPage(items, null)).toBe(false);
  });
});
