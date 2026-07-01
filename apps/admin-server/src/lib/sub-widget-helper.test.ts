import { describe, expect, it, vi } from 'vitest';

import { extractConfig } from './sub-widget-helper';

// Models the resourcedetail "Reacties" tab, where a "for" list (commentsWidget)
// and an "against" list (commentsWidget_multiple) are two sub-widgets living
// under the same parent config. Regression coverage for issue #1580.
type ParentConfig = {
  commentsWidget: { title: string; emptyListText?: string };
  commentsWidget_multiple: { title: string; emptyListText?: string };
};
type ChildConfig = ParentConfig['commentsWidget'];

function setup(subWidgetKey: keyof ParentConfig) {
  const updateConfig = vi.fn();
  const updatePreview = vi.fn();
  const previewConfig: ParentConfig = {
    commentsWidget: { title: 'FOR' },
    commentsWidget_multiple: { title: 'AGAINST' },
  };
  const child = extractConfig<ParentConfig, ChildConfig>({
    subWidgetKey,
    previewConfig,
    updateConfig,
    updatePreview,
  });
  return { child, updateConfig, updatePreview };
}

describe('extractConfig', () => {
  it('exposes the current sub-widget config on the returned object', () => {
    const { child } = setup('commentsWidget');
    expect(child.title).toBe('FOR');
    expect(typeof child.updateConfig).toBe('function');
    expect(typeof child.onFieldChanged).toBe('function');
  });

  it('merges the saved fields into only its own sub-widget key', () => {
    const { child, updateConfig } = setup('commentsWidget');

    child.updateConfig({ title: 'FOR-EDITED' });

    expect(updateConfig).toHaveBeenCalledTimes(1);
    const saved = updateConfig.mock.calls[0][0] as ParentConfig;
    expect(saved.commentsWidget.title).toBe('FOR-EDITED');
  });

  it('preserves the sibling sub-widget when saving one column (#1580)', () => {
    // Save the "against" column; the "for" column must remain untouched.
    const { child, updateConfig } = setup('commentsWidget_multiple');

    child.updateConfig({ title: 'AGAINST-EDITED' });

    const saved = updateConfig.mock.calls[0][0] as ParentConfig;
    expect(saved.commentsWidget_multiple.title).toBe('AGAINST-EDITED');
    expect(saved.commentsWidget.title).toBe('FOR'); // sibling not clobbered
  });

  it('syncs preview state on save so the next sibling save is not stale (the fix)', () => {
    const { child, updateConfig, updatePreview } = setup('commentsWidget');

    child.updateConfig({ title: 'FOR-EDITED' });

    // Both the persisted payload and the in-memory preview must receive the
    // exact same merged config, so a subsequent save reads fresh state.
    expect(updatePreview).toHaveBeenCalledTimes(1);
    expect(updatePreview.mock.calls[0][0]).toEqual(
      updateConfig.mock.calls[0][0]
    );
    const preview = updatePreview.mock.calls[0][0] as ParentConfig;
    expect(preview.commentsWidget.title).toBe('FOR-EDITED');
    expect(preview.commentsWidget_multiple.title).toBe('AGAINST');
  });

  it('onFieldChanged updates only preview (never persists) and keeps siblings', () => {
    const { child, updateConfig, updatePreview } = setup('commentsWidget');

    child.onFieldChanged('title', 'FOR-TYPING');

    expect(updateConfig).not.toHaveBeenCalled();
    expect(updatePreview).toHaveBeenCalledTimes(1);
    const preview = updatePreview.mock.calls[0][0] as ParentConfig;
    expect(preview.commentsWidget.title).toBe('FOR-TYPING');
    expect(preview.commentsWidget_multiple.title).toBe('AGAINST');
  });

  it('throws when previewConfig is missing', () => {
    expect(() =>
      extractConfig<ParentConfig, ChildConfig>({
        subWidgetKey: 'commentsWidget',
        previewConfig: null,
        updateConfig: vi.fn(),
        updatePreview: vi.fn(),
      })
    ).toThrow();
  });
});
