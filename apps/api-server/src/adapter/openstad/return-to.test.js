import { describe, expect, it } from 'vitest';

import { setQueryParam } from './return-to.js';

describe('setQueryParam', () => {
  it('appends the param to a url without a query string', () => {
    expect(setQueryParam('https://site/page', 'openstadprojectid', 1)).toBe(
      'https://site/page?openstadprojectid=1'
    );
  });

  it('appends the param to a url that already has a query string', () => {
    expect(
      setQueryParam(
        'https://site/page?openstadlogintoken=[[jwt]]',
        'openstadprojectid',
        1
      )
    ).toBe('https://site/page?openstadlogintoken=[[jwt]]&openstadprojectid=1');
  });

  it('replaces a stale value instead of letting it win', () => {
    expect(
      setQueryParam(
        'https://site/page?openstadprojectid=2',
        'openstadprojectid',
        1
      )
    ).toBe('https://site/page?openstadprojectid=1');
  });

  it('replaces a stale value in the middle and keeps the other params', () => {
    expect(
      setQueryParam(
        'https://site/page?a=1&openstadprojectid=2&b=3',
        'openstadprojectid',
        1
      )
    ).toBe('https://site/page?a=1&b=3&openstadprojectid=1');
  });

  it('replaces a stale value at the start and keeps the other params', () => {
    expect(
      setQueryParam(
        'https://site/page?openstadprojectid=2&a=1',
        'openstadprojectid',
        1
      )
    ).toBe('https://site/page?a=1&openstadprojectid=1');
  });

  it('removes every duplicate of the param', () => {
    expect(
      setQueryParam(
        'https://site/page?openstadprojectid=2&a=1&openstadprojectid=3',
        'openstadprojectid',
        1
      )
    ).toBe('https://site/page?a=1&openstadprojectid=1');
  });

  it('leaves the jwt placeholder untouched', () => {
    const result = setQueryParam(
      'https://site/page?openstadlogintoken=[[jwt]]&openstadprojectid=9',
      'openstadprojectid',
      2
    );

    expect(result).toContain('openstadlogintoken=[[jwt]]');
    expect(result).toContain('openstadprojectid=2');
    expect(result).not.toContain('openstadprojectid=9');
  });

  it('works on a relative return url', () => {
    expect(
      setQueryParam('/?openstadlogintoken=[[jwt]]', 'openstadprojectid', 3)
    ).toBe('/?openstadlogintoken=[[jwt]]&openstadprojectid=3');
  });
});
