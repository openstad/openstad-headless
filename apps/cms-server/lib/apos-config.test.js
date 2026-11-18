import { describe, expect, it } from 'vitest';

const aposConfig = require('./apos-config');

describe('apos-config', () => {
  it('disables oembed lookups by emptying the oembed allowlist', () => {
    expect(
      aposConfig.modules['@apostrophecms/oembed']?.options?.minimumAllowlist
    ).toEqual([]);
  });
});
