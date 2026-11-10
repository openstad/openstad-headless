// @vitest-environment jsdom
import { afterEach, describe, expect, test, vi } from 'vitest';

import {
  formatSubmittedAt,
  getSubmittedStorageKey,
  isFormClosed,
  readSubmittedAt,
  readSubmittedFlag,
  writeSubmittedFlag,
} from './submitted-lock';

afterEach(() => {
  vi.restoreAllMocks();
  window.localStorage.clear();
});

describe('getSubmittedStorageKey', () => {
  test('builds a key without pathname', () => {
    expect(getSubmittedStorageKey(2, 5)).toBe('enquete-submitted:2:5');
  });

  test('falls back for missing ids', () => {
    expect(getSubmittedStorageKey(undefined, undefined)).toBe(
      'enquete-submitted:unknown-project:unknown-widget'
    );
  });
});

describe('read/write', () => {
  test('roundtrip', () => {
    const key = getSubmittedStorageKey(2, 5);
    expect(readSubmittedFlag(key)).toBe(false);
    expect(writeSubmittedFlag(key)).toBe(true);
    expect(readSubmittedFlag(key)).toBe(true);
  });

  test('throwing localStorage getter gives false for both', () => {
    vi.spyOn(window, 'localStorage', 'get').mockImplementation(() => {
      throw new Error('SecurityError');
    });
    expect(readSubmittedFlag('k')).toBe(false);
    expect(writeSubmittedFlag('k')).toBe(false);
  });

  test('throwing setItem gives write false', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('QuotaExceeded');
    });
    expect(writeSubmittedFlag('k')).toBe(false);
    expect(readSubmittedFlag('k')).toBe(false);
  });
});

describe('readSubmittedAt', () => {
  test('returns the stored submit time', () => {
    vi.spyOn(Date, 'now').mockReturnValue(1791376141000);
    const key = getSubmittedStorageKey(2, 5);
    writeSubmittedFlag(key);
    expect(readSubmittedAt(key)).toBe(1791376141000);
  });

  test('missing or non-numeric value gives null', () => {
    expect(readSubmittedAt('k')).toBeNull();
    window.localStorage.setItem('k', 'yes');
    expect(readSubmittedAt('k')).toBeNull();
  });

  test('throwing localStorage getter gives null', () => {
    vi.spyOn(window, 'localStorage', 'get').mockImplementation(() => {
      throw new Error('SecurityError');
    });
    expect(readSubmittedAt('k')).toBeNull();
  });
});

describe('formatSubmittedAt', () => {
  test('formats as Dutch date and time', () => {
    const timestamp = new Date(2026, 9, 7, 14, 22).getTime();
    expect(formatSubmittedAt(timestamp)).toBe('7 oktober 2026, 14:22');
  });
});

describe('isFormClosed', () => {
  test('option off => open', () => {
    expect(isFormClosed({ flag: true, closeFormAfterSubmit: false })).toBe(
      false
    );
  });

  test('bypass => open', () => {
    expect(
      isFormClosed({ flag: true, closeFormAfterSubmit: true, canBypass: true })
    ).toBe(false);
  });

  test('no flag => open', () => {
    expect(isFormClosed({ flag: false, closeFormAfterSubmit: true })).toBe(
      false
    );
  });

  test('option on + flag + no bypass => closed', () => {
    expect(isFormClosed({ flag: true, closeFormAfterSubmit: true })).toBe(true);
  });
});
