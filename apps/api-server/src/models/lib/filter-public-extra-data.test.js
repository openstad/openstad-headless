import { describe, expect, it } from 'vitest';

import {
  ALWAYS_PUBLIC_EXTRA_DATA_KEYS,
  EDITOR_PUBLIC_EXTRA_DATA_KEYS,
  filterPublicExtraData,
} from './filter-public-extra-data.js';

describe('filterPublicExtraData', () => {
  it('keeps partnerLogo when the resourceform config has no such field', () => {
    const data = {
      extraData: { partnerLogo: 'https://example.org/logo.png', foo: 'bar' },
    };
    filterPublicExtraData(data, {
      hasResourceFormConfig: true,
      resourceFormFieldKeys: ['foo'],
      moderatorOnlyExtraDataKeys: [],
    });
    expect(data.extraData).toEqual({
      partnerLogo: 'https://example.org/logo.png',
      foo: 'bar',
    });
  });

  it('keeps partnerLogo when the resource has no resourceform at all', () => {
    const data = { extraData: { partnerLogo: 'https://example.org/logo.png' } };
    filterPublicExtraData(data, {
      hasResourceFormConfig: false,
      resourceFormFieldKeys: [],
      moderatorOnlyExtraDataKeys: [],
    });
    expect(data.extraData).toEqual({
      partnerLogo: 'https://example.org/logo.png',
    });
  });

  it('still strips a non-allowlisted key when hasResourceFormConfig is true', () => {
    const data = { extraData: { partnerLogo: 'x', secret: 'y' } };
    filterPublicExtraData(data, {
      hasResourceFormConfig: true,
      resourceFormFieldKeys: [],
      moderatorOnlyExtraDataKeys: [],
    });
    expect(data.extraData).toEqual({ partnerLogo: 'x' });
  });

  it('still strips a non-allowlisted key when hasResourceFormConfig is false', () => {
    const data = { extraData: { partnerLogo: 'x', secret: 'y' } };
    filterPublicExtraData(data, {
      hasResourceFormConfig: false,
      resourceFormFieldKeys: [],
      moderatorOnlyExtraDataKeys: [],
    });
    expect(data.extraData).toEqual({ partnerLogo: 'x' });
  });

  it('leaves originalId and ranking behaviour unchanged', () => {
    const data = { extraData: { originalId: 1, ranking: 2, other: 3 } };
    filterPublicExtraData(data, {
      hasResourceFormConfig: true,
      resourceFormFieldKeys: [],
      moderatorOnlyExtraDataKeys: [],
    });
    expect(data.extraData).toEqual({ originalId: 1, ranking: 2 });
  });

  it('originalId stays public even when marked onlyForModerator', () => {
    const data = { extraData: { originalId: 1 } };
    filterPublicExtraData(data, {
      hasResourceFormConfig: true,
      resourceFormFieldKeys: ['originalId'],
      moderatorOnlyExtraDataKeys: ['originalId'],
    });
    expect(data.extraData).toEqual({ originalId: 1 });
  });

  it('strips partnerLogo when a resourceform field of that name is onlyForModerator', () => {
    const data = { extraData: { partnerLogo: 'confidential-value' } };
    filterPublicExtraData(data, {
      hasResourceFormConfig: true,
      resourceFormFieldKeys: ['partnerLogo'],
      moderatorOnlyExtraDataKeys: ['partnerLogo'],
    });
    expect(data.extraData).toEqual({});
  });

  it('exports partnerLogo in the editor-public key list, not the always-public list', () => {
    expect(EDITOR_PUBLIC_EXTRA_DATA_KEYS).toContain('partnerLogo');
    expect(ALWAYS_PUBLIC_EXTRA_DATA_KEYS).not.toContain('partnerLogo');
  });
});
