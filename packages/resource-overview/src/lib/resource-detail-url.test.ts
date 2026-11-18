import { describe, expect, test } from 'vitest';

import { buildResourceDetailUrl } from './resource-detail-url';

const location = {
  pathname: '/mijnbuurtidee',
  protocol: 'https:',
  host: 'www.zwolle.nl',
};

describe('buildResourceDetailUrl', () => {
  test('replaces [id] in an absolute item link', () => {
    expect(
      buildResourceDetailUrl(
        'https://www.zwolle.nl/idee?openstadResourceId=[id]',
        { id: 105 },
        [],
        location
      )
    ).toBe('https://www.zwolle.nl/idee?openstadResourceId=105');
  });

  test('makes a root-relative link absolute', () => {
    expect(
      buildResourceDetailUrl(
        '/mijnbuurtidee/buurtidee?openstadResourceId=[id]',
        { id: 105 },
        undefined,
        location
      )
    ).toBe(
      'https://www.zwolle.nl/mijnbuurtidee/buurtidee?openstadResourceId=105'
    );
  });

  test('resolves a relative link against the current path', () => {
    expect(
      buildResourceDetailUrl('buurtidee/[id]', { id: 7 }, [], location)
    ).toBe('https://www.zwolle.nl/mijnbuurtidee/buurtidee/7');
  });

  test('uses the detail page of the selected project of the resource', () => {
    expect(
      buildResourceDetailUrl(
        '/fallback/[id]',
        { id: 7, projectId: 2 },
        [{ id: 2, detailPageLink: 'https://other.nl/plan/[id]' }],
        location
      )
    ).toBe('https://other.nl/plan/7');
  });
});
