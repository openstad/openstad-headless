import { describe, expect, test } from 'vitest';

import { filterStreetOptions, streetOptionId } from './street-filter';

const options = [
  { street: 'Grote Kerkplein', city: 'Zwolle' },
  { street: 'Kerkstraat', city: 'Barneveld' },
  { street: 'Kerkstraat', city: 'Kootwijkerbroek' },
  { street: 'Koestraat', city: 'Zwolle' },
];

describe('filterStreetOptions', () => {
  test('returns all options for an empty query', () => {
    expect(filterStreetOptions(options, '')).toEqual(options);
    expect(filterStreetOptions(options, '   ')).toEqual(options);
  });

  test('matches part of the street name', () => {
    expect(filterStreetOptions(options, 'kerk')).toEqual([
      { street: 'Grote Kerkplein', city: 'Zwolle' },
      { street: 'Kerkstraat', city: 'Barneveld' },
      { street: 'Kerkstraat', city: 'Kootwijkerbroek' },
    ]);
  });

  test('matches on the city as well', () => {
    expect(filterStreetOptions(options, 'kootwijk')).toEqual([
      { street: 'Kerkstraat', city: 'Kootwijkerbroek' },
    ]);
  });

  test('ignores case', () => {
    expect(filterStreetOptions(options, 'KOESTRAAT')).toEqual([
      { street: 'Koestraat', city: 'Zwolle' },
    ]);
  });
});

describe('streetOptionId', () => {
  test('keeps the same street in different cities apart', () => {
    expect(streetOptionId(options[1])).not.toBe(streetOptionId(options[2]));
  });
});
