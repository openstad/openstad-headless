import { describe, expect, test } from 'vitest';

import {
  collectStreets,
  matchesStreets,
  parseStreetsParam,
} from './resource-streets.js';

const withAddress = (street, city) => ({
  location: { lat: 52.5, lng: 6.09, address: { street, city } },
});

describe('collectStreets', () => {
  test('dedupes street and city pairs and sorts them', () => {
    const result = collectStreets([
      withAddress('Kerkstraat', 'Kootwijkerbroek'),
      withAddress('Dorpsstraat', 'Barneveld'),
      withAddress('Kerkstraat', 'Barneveld'),
      withAddress('Kerkstraat', 'Kootwijkerbroek'),
    ]);

    expect(result).toEqual([
      { street: 'Dorpsstraat', city: 'Barneveld' },
      { street: 'Kerkstraat', city: 'Barneveld' },
      { street: 'Kerkstraat', city: 'Kootwijkerbroek' },
    ]);
  });

  test('skips resources without a location address', () => {
    const result = collectStreets([
      { location: null },
      { location: { lat: 52.5, lng: 6.09 } },
      { location: { lat: 52.5, lng: 6.09, address: { city: 'Zwolle' } } },
      withAddress('Koestraat', 'Zwolle'),
    ]);

    expect(result).toEqual([{ street: 'Koestraat', city: 'Zwolle' }]);
  });

  test('uses an empty city when the address has none', () => {
    const result = collectStreets([
      { location: { address: { street: 'Koestraat' } } },
    ]);

    expect(result).toEqual([{ street: 'Koestraat', city: '' }]);
  });
});

describe('parseStreetsParam', () => {
  test('parses a JSON array of street and city pairs', () => {
    expect(
      parseStreetsParam('[{"street":"Koestraat","city":"Zwolle"}]')
    ).toEqual([{ street: 'Koestraat', city: 'Zwolle' }]);
  });

  test('drops items without a street and fills a missing city', () => {
    expect(
      parseStreetsParam('[{"street":"Koestraat"},{"city":"Zwolle"},null]')
    ).toEqual([{ street: 'Koestraat', city: '' }]);
  });

  test('returns null for invalid JSON or a non-array', () => {
    expect(parseStreetsParam('not json')).toBeNull();
    expect(parseStreetsParam('{"street":"Koestraat"}')).toBeNull();
  });
});

describe('matchesStreets', () => {
  const streets = [{ street: 'Kerkstraat', city: 'Kootwijkerbroek' }];

  test('matches on street and city together', () => {
    expect(
      matchesStreets(withAddress('Kerkstraat', 'Kootwijkerbroek'), streets)
    ).toBe(true);
    expect(
      matchesStreets(withAddress('Kerkstraat', 'Barneveld'), streets)
    ).toBe(false);
  });

  test('does not match resources without an address', () => {
    expect(matchesStreets({ location: { lat: 1, lng: 2 } }, streets)).toBe(
      false
    );
    expect(matchesStreets({ location: null }, streets)).toBe(false);
  });
});
