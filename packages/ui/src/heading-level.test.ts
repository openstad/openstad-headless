import { describe, expect, it } from 'vitest';

import { headingLevels } from './heading-level';

describe('headingLevels', () => {
  it('geeft nooit een h1 terug — die hoort bij de pagina, niet bij de widget', () => {
    expect(headingLevels(1)[0]).toBe(2);
    expect(headingLevels(0)[0]).toBe(2);
    expect(headingLevels(undefined)[0]).toBe(2);
  });

  it('laat subkoppen aansluiten zonder een niveau over te slaan', () => {
    expect(headingLevels(2)).toEqual([2, 3, 4]);
    expect(headingLevels(4)).toEqual([4, 5, 6]);
  });

  it('loopt niet voorbij h6', () => {
    expect(headingLevels(6)).toEqual([6, 6, 6]);
  });

  it('accepteert de string die uit de widget-config komt', () => {
    expect(headingLevels('3')).toEqual([3, 4, 5]);
  });
});
