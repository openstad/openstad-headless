import { describe, expect, it, vi } from 'vitest';

import { extractConfig } from './sub-widget-helper';

type Parent = {
  left: { placeholder: string };
  right: { placeholder: string };
};

describe('extractConfig', () => {
  it('keeps a saved sub-widget value when another sub-widget saves afterwards', () => {
    let previewConfig: Parent = {
      left: { placeholder: 'old-left' },
      right: { placeholder: 'old-right' },
    };
    const updateConfig = vi.fn();
    const updatePreview = vi.fn((next: Parent) => {
      previewConfig = next;
    });

    const build = (key: 'left' | 'right') =>
      extractConfig<Parent, { placeholder: string }>({
        subWidgetKey: key,
        previewConfig,
        updateConfig,
        updatePreview,
      });

    build('right').updateConfig({ placeholder: 'new-right' });
    build('left').updateConfig({ placeholder: 'new-left' });

    const secondPut = updateConfig.mock.calls[1][0];
    expect(secondPut.left.placeholder).toBe('new-left');
    expect(secondPut.right.placeholder).toBe('new-right');
  });
});
