import { describe, expect, it } from 'vitest';

import { headingLevels } from './heading-level';

describe('headingLevels', () => {
  it('valt terug op h2 als er niets of onzin is ingesteld', () => {
    expect(headingLevels(0)[0]).toBe(2);
    expect(headingLevels(undefined)[0]).toBe(2);
    expect(headingLevels('')[0]).toBe(2);
  });

  // Alleen als de redacteur er expliciet om vraagt: de widget is dan zelf de
  // hoofdinhoud van de pagina (resource-detail met de titel als paginatitel).
  it('geeft h1 alleen als die expliciet gekozen is, en nestelt daaronder door', () => {
    expect(headingLevels(1)).toEqual([1, 2, 3]);
    expect(headingLevels('1')).toEqual([1, 2, 3]);
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
