import { describe, expect, it } from 'vitest';

import { buildPageTitle } from './page-title';

describe('buildPageTitle', () => {
  it('vervangt de paginanaam maar behoudt de sitenaam', () => {
    expect(
      buildPageTitle(
        'Meer fietsenstallingen',
        'Inzending detailpagina - Audit OpenStad 2026'
      )
    ).toBe('Meer fietsenstallingen - Audit OpenStad 2026');
  });

  it('pakt het laatste segment als de sitenaam, ook bij een streepje in de paginanaam', () => {
    expect(buildPageTitle('Plan X', 'Wonen - werken - Gemeente Duiven')).toBe(
      'Plan X - Gemeente Duiven'
    );
  });

  it('geeft alleen de inzendingstitel als er geen sitenaam in de titel staat', () => {
    expect(buildPageTitle('Plan X', 'Homepagina')).toBe('Plan X');
    expect(buildPageTitle('Plan X', '')).toBe('Plan X');
  });

  it('stapelt niet bij herhaald aanroepen op de eigen uitvoer', () => {
    const eerste = buildPageTitle('Plan X', 'Detailpagina - Sitenaam');
    expect(buildPageTitle('Plan X', eerste)).toBe(eerste);
  });
});
