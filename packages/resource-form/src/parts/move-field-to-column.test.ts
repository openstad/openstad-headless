import { describe, expect, test, vi } from 'vitest';

import { moveFieldToColumn } from './move-field-to-column';

describe('moveFieldToColumn: timeline (regression)', () => {
  test('moves the timeline field value from extraData to configuredFormData.timeline', () => {
    const extraData: Record<string, any> = { timeline: [{ trigger: '0' }] };
    const configuredFormData: Record<string, any> = {};
    const items = [{ type: 'timeline', fieldKey: 'timeline' }];

    moveFieldToColumn(
      extraData,
      configuredFormData,
      items,
      'timeline',
      'timeline'
    );

    expect(configuredFormData.timeline).toEqual([{ trigger: '0' }]);
    expect(extraData.timeline).toBeUndefined();
  });

  test('uses the configured fieldKey, not a hardcoded name', () => {
    const extraData: Record<string, any> = {
      myCustomTimelineKey: [{ trigger: '0' }],
    };
    const configuredFormData: Record<string, any> = {};
    const items = [{ type: 'timeline', fieldKey: 'myCustomTimelineKey' }];

    moveFieldToColumn(
      extraData,
      configuredFormData,
      items,
      'timeline',
      'timeline'
    );

    expect(configuredFormData.timeline).toEqual([{ trigger: '0' }]);
    expect(extraData.myCustomTimelineKey).toBeUndefined();
  });
});

describe('moveFieldToColumn: modbreak', () => {
  test('moves the modbreak field value from extraData to configuredFormData.modBreaks', () => {
    const extraData: Record<string, any> = {
      modBreaks: [{ id: '1', description: 'x' }],
    };
    const configuredFormData: Record<string, any> = {};
    const items = [{ type: 'modbreak', fieldKey: 'modBreaks' }];

    moveFieldToColumn(
      extraData,
      configuredFormData,
      items,
      'modbreak',
      'modBreaks'
    );

    expect(configuredFormData.modBreaks).toEqual([
      { id: '1', description: 'x' },
    ]);
    expect(extraData.modBreaks).toBeUndefined();
  });
});

describe('moveFieldToColumn: field missing or absent', () => {
  test('no field of this type configured: nothing is moved, no key added', () => {
    const extraData: Record<string, any> = { other: 'value' };
    const configuredFormData: Record<string, any> = {};

    moveFieldToColumn(
      extraData,
      configuredFormData,
      [],
      'modbreak',
      'modBreaks'
    );

    expect(configuredFormData.modBreaks).toBeUndefined();
    expect(extraData).toEqual({ other: 'value' });
  });

  test('field configured but its key never made it into extraData: nothing is moved', () => {
    const extraData: Record<string, any> = {};
    const configuredFormData: Record<string, any> = {};
    const items = [{ type: 'modbreak', fieldKey: 'modBreaks' }];

    moveFieldToColumn(
      extraData,
      configuredFormData,
      items,
      'modbreak',
      'modBreaks'
    );

    expect(configuredFormData.modBreaks).toBeUndefined();
  });
});

describe('moveFieldToColumn: multiple fields of the same type', () => {
  test('only the first fieldKey is moved, a warning is logged, the rest stays in extraData', () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const extraData: Record<string, any> = {
      modBreaks: [{ id: '1' }],
      modBreaksTwo: [{ id: '2' }],
    };
    const configuredFormData: Record<string, any> = {};
    const items = [
      { type: 'modbreak', fieldKey: 'modBreaks' },
      { type: 'modbreak', fieldKey: 'modBreaksTwo' },
    ];

    moveFieldToColumn(
      extraData,
      configuredFormData,
      items,
      'modbreak',
      'modBreaks'
    );

    expect(configuredFormData.modBreaks).toEqual([{ id: '1' }]);
    expect(extraData.modBreaks).toBeUndefined();
    expect(extraData.modBreaksTwo).toEqual([{ id: '2' }]);
    expect(errorSpy).toHaveBeenCalledOnce();

    errorSpy.mockRestore();
  });
});
