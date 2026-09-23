import { describe, expect, it } from 'vitest';

import { resolveProxyBodyLimit } from './next.config.js';

describe('resolveProxyBodyLimit', () => {
  it('defaults to 25 + 10 MB headroom when unset', () => {
    expect(resolveProxyBodyLimit(undefined)).toBe('35mb');
  });

  it('adds headroom on top of a valid cap', () => {
    expect(resolveProxyBodyLimit('25')).toBe('35mb');
    expect(resolveProxyBodyLimit('50')).toBe('60mb');
  });

  it.each(['', 'abc', '-5', '0', 'Infinity'])(
    'falls back to the default for invalid input %j',
    (invalid) => {
      expect(resolveProxyBodyLimit(invalid)).toBe('35mb');
    }
  );
});
