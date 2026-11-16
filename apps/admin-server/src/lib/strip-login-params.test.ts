import { describe, expect, it } from 'vitest';

import { queryWithoutLoginParams } from './strip-login-params';

describe('queryWithoutLoginParams', () => {
  it('removes the login token and its project id', () => {
    const params = new URLSearchParams(
      'openstadlogintoken=jwt&openstadprojectid=1'
    );
    expect(queryWithoutLoginParams(params)).toBe('');
  });

  it('keeps other parameters', () => {
    const params = new URLSearchParams(
      'tab=users&openstadlogintoken=jwt&openstadprojectid=1&page=2'
    );
    expect(queryWithoutLoginParams(params)).toBe('?tab=users&page=2');
  });

  it('returns an empty query without parameters', () => {
    expect(queryWithoutLoginParams(new URLSearchParams())).toBe('');
    expect(queryWithoutLoginParams(undefined)).toBe('');
  });
});
