import { describe, expect, it } from 'vitest';

import { polygonUrlDefaults } from './polygon-urls';

describe('polygonUrlDefaults', () => {
  it('shows the URL the save bar stored inside the polygon', () => {
    const urls = polygonUrlDefaults([{ id: 3, url: '/wijk' }], undefined);
    expect(urls[3]).toBe('/wijk');
  });

  it('prefers the polygon URL over an older one from the old button', () => {
    const old: string[] = [];
    old[3] = '/oud';
    expect(polygonUrlDefaults([{ id: 3, url: '/nieuw' }], old)[3]).toBe(
      '/nieuw'
    );
  });

  it('keeps an old URL when the polygon has none, and a cleared one as empty', () => {
    const old: string[] = [];
    old[3] = '/oud';
    old[4] = '/weg';
    const urls = polygonUrlDefaults([{ id: 3 }, { id: 4, url: '' }], old);
    expect(urls[3]).toBe('/oud');
    expect(urls[4]).toBe('');
  });

  it('accepts an object keyed by id', () => {
    expect(polygonUrlDefaults([{ id: 5, url: '/x' }], { 2: '/y' })).toEqual({
      2: '/y',
      5: '/x',
    });
  });
});
