import { afterEach, describe, expect, it, vi } from 'vitest';

import {
  resolveMaxUploadSizeMb,
  resolveProxyBodyLimit,
} from './proxy-body-limit.js';

describe('resolveProxyBodyLimit', () => {
  let warnSpy;

  const spyOnWarn = () => {
    warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    return warnSpy;
  };

  afterEach(() => {
    warnSpy?.mockRestore();
  });

  it('defaults to 25 + 10 MB headroom when unset', () => {
    expect(resolveProxyBodyLimit(undefined)).toBe('35mb');
  });

  it('adds headroom on top of a valid cap', () => {
    expect(resolveProxyBodyLimit('25')).toBe('35mb');
    expect(resolveProxyBodyLimit('50')).toBe('60mb');
  });

  it.each(['', '   ', 'abc', '-5', '0', 'Infinity', '1e21', '2.5'])(
    'falls back to the default for invalid input %j',
    (invalid) => {
      spyOnWarn();
      expect(resolveProxyBodyLimit(invalid)).toBe('35mb');
    }
  );

  it('rejects a cap above the sane upper bound', () => {
    spyOnWarn();
    expect(resolveProxyBodyLimit('1001')).toBe('35mb');
    expect(resolveProxyBodyLimit('1000')).toBe('1010mb');
  });

  it('adds headroom on top of a cap below the default', () => {
    expect(resolveProxyBodyLimit('10')).toBe('20mb');
    expect(resolveProxyBodyLimit('1')).toBe('11mb');
  });

  it('accepts scientific notation that resolves to a valid integer', () => {
    expect(resolveProxyBodyLimit('1e2')).toBe('110mb');
  });

  it.each(['5000', 'abc', '1e21', '-5', '0', '2.5', 'Infinity', '1001'])(
    'warns once with the exact message for invalid input %j',
    (invalid) => {
      const warn = spyOnWarn();
      resolveProxyBodyLimit(invalid);
      expect(warn).toHaveBeenCalledTimes(1);
      expect(warn).toHaveBeenCalledWith(
        `MAX_FILE_UPLOAD_SIZE_MB=${invalid} is invalid (allowed 1-1000), using 25`
      );
    }
  );

  it.each([undefined, '', '   ', '25', '50', '1000', '10', '1e2'])(
    'does not warn for %j',
    (value) => {
      const warn = spyOnWarn();
      resolveProxyBodyLimit(value);
      expect(warn).not.toHaveBeenCalled();
    }
  );
});

describe('resolveMaxUploadSizeMb', () => {
  let warnSpy;

  afterEach(() => {
    warnSpy?.mockRestore();
  });

  it('returns the configured cap in MB', () => {
    expect(resolveMaxUploadSizeMb('10')).toBe(10);
    expect(resolveMaxUploadSizeMb('50')).toBe(50);
    expect(resolveMaxUploadSizeMb('1000')).toBe(1000);
  });

  it('returns 25 when unset or blank', () => {
    expect(resolveMaxUploadSizeMb(undefined)).toBe(25);
    expect(resolveMaxUploadSizeMb('')).toBe(25);
  });

  it.each(['abc', '0', '-5', '2.5', '1001', 'Infinity'])(
    'returns 25 and warns for invalid input %j',
    (invalid) => {
      warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      expect(resolveMaxUploadSizeMb(invalid)).toBe(25);
      expect(warnSpy).toHaveBeenCalledTimes(1);
    }
  );
});
