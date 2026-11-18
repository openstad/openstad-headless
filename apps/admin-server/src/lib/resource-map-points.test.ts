import { describe, expect, it } from 'vitest';

import { getPointsBounds, toMapPoints } from './resource-map-points';

describe('toMapPoints', () => {
  it('keeps resources with valid coordinates', () => {
    expect(
      toMapPoints([
        { id: 1, title: 'Bankje', location: { lat: 52.5, lng: 6.1 } },
      ])
    ).toEqual([{ id: 1, title: 'Bankje', lat: 52.5, lng: 6.1 }]);
  });

  it('drops resources without a usable location', () => {
    expect(
      toMapPoints([
        { id: 1, title: 'Geen locatie' },
        { id: 2, title: 'Leeg', location: null },
        { id: 3, title: 'Null', location: { lat: null, lng: null } },
        { id: 4, title: 'Tekst', location: { lat: 'abc', lng: 6 } },
        { id: 5, title: 'Leeg veld', location: { lat: '', lng: '' } },
      ])
    ).toEqual([]);
  });

  it('converts numeric strings to numbers', () => {
    expect(
      toMapPoints([
        { id: 1, title: 'A', location: { lat: '52.5', lng: '6.1' } },
      ])
    ).toEqual([{ id: 1, title: 'A', lat: 52.5, lng: 6.1 }]);
  });

  it('uses the id when a resource has no title', () => {
    expect(
      toMapPoints([{ id: 7, location: { lat: 1, lng: 2 } }])[0].title
    ).toBe('Inzending 7');
  });
});

describe('getPointsBounds', () => {
  it('returns the south-west and north-east corners', () => {
    expect(
      getPointsBounds([
        { id: 1, title: 'A', lat: 52.5, lng: 6.2 },
        { id: 2, title: 'B', lat: 52.4, lng: 6.0 },
      ])
    ).toEqual([
      [52.4, 6.0],
      [52.5, 6.2],
    ]);
  });

  it('handles a single point', () => {
    expect(
      getPointsBounds([{ id: 1, title: 'A', lat: 52.5, lng: 6.1 }])
    ).toEqual([
      [52.5, 6.1],
      [52.5, 6.1],
    ]);
  });

  it('returns null for no points', () => {
    expect(getPointsBounds([])).toBeNull();
  });
});
