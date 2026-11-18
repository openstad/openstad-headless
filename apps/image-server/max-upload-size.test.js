import { afterEach, describe, expect, it, vi } from 'vitest';

import { resolveMaxUploadSizeMb } from './max-upload-size.js';

describe('resolveMaxUploadSizeMb', () => {
  let warnSpy;

  const spyOnWarn = () => {
    warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    return warnSpy;
  };

  afterEach(() => {
    warnSpy?.mockRestore();
  });

  it('returns the configured cap in MB', () => {
    expect(resolveMaxUploadSizeMb('10')).toBe(10);
    expect(resolveMaxUploadSizeMb('50')).toBe(50);
    expect(resolveMaxUploadSizeMb('1000')).toBe(1000);
    expect(resolveMaxUploadSizeMb('1e2')).toBe(100);
  });

  it.each([undefined, '', '   '])(
    'returns 25 without warning for %j',
    (value) => {
      const warn = spyOnWarn();
      expect(resolveMaxUploadSizeMb(value)).toBe(25);
      expect(warn).not.toHaveBeenCalled();
    }
  );

  it.each(['abc', '0', '-5', '2.5', '1001', '1e21', 'Infinity'])(
    'returns 25 and warns once for invalid input %j',
    (invalid) => {
      const warn = spyOnWarn();
      expect(resolveMaxUploadSizeMb(invalid)).toBe(25);
      expect(warn).toHaveBeenCalledTimes(1);
      expect(warn).toHaveBeenCalledWith(
        `MAX_FILE_UPLOAD_SIZE_MB=${invalid} is invalid (allowed 1-1000), using 25`
      );
    }
  );
});
