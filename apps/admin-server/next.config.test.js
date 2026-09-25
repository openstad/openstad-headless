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

  it.each(['', 'abc', '-5', '0', 'Infinity', '1e21', '2.5'])(
    'falls back to the default for invalid input %j',
    (invalid) => {
      expect(resolveProxyBodyLimit(invalid)).toBe('35mb');
    }
  );

  it('rejects a cap above the sane upper bound', () => {
    expect(resolveProxyBodyLimit('1001')).toBe('35mb');
    expect(resolveProxyBodyLimit('1000')).toBe('1010mb');
  });

  it('never lets the proxy limit drop below the client-assumed 25MB + headroom, even when the configured cap is lower', () => {
    // The client-side pre-check in upload-limits.ts always assumes a 25MB max
    // (it cannot read this env var). A lower configured cap must not shrink
    // the proxy limit below what the client already lets through, or an
    // allowed-by-client file would be silently truncated by Next again.
    expect(resolveProxyBodyLimit('10')).toBe('35mb');
    expect(resolveProxyBodyLimit('1')).toBe('35mb');
  });
});
