import { describe, expect, it, vi } from 'vitest';

import { extractConfig } from './sub-widget-helper';

// Models the resourcedetail "Reacties" tab, where a "for" list (commentsWidget)
// and an "against" list (commentsWidget_multiple) are two sub-widgets living
// under the same parent config. Regression coverage for issue #1580.
type ParentConfig = {
  commentsWidget: { title: string; emptyListText?: string };
  commentsWidget_multiple: { title: string; emptyListText?: string };
  buttonsWidget?: { ctaButton?: { show?: boolean; href?: string } };
};
type ChildConfig = ParentConfig['commentsWidget'];

function setup(subWidgetKey: keyof ParentConfig) {
  const updatePreview = vi.fn();
  const previewConfig: ParentConfig = {
    commentsWidget: { title: 'FOR' },
    commentsWidget_multiple: { title: 'AGAINST' },
  };
  const child = extractConfig<ParentConfig, ChildConfig>({
    subWidgetKey,
    previewConfig,
    updatePreview,
  });
  return { child, updatePreview };
}

describe('extractConfig', () => {
  it('exposes the current sub-widget config on the returned object', () => {
    const { child } = setup('commentsWidget');
    expect(child.title).toBe('FOR');
    expect(typeof child.updateConfig).toBe('function');
    expect(typeof child.onFieldChanged).toBe('function');
  });

  it('a tab submit (Enter) neither saves nor changes the draft', () => {
    const { child, updatePreview } = setup('commentsWidget');

    child.updateConfig({ title: 'FOR-EDITED' });

    expect(updatePreview).not.toHaveBeenCalled();
  });

  it('onFieldChanged updates only the draft and keeps siblings (#1580)', () => {
    const { child, updatePreview } = setup('commentsWidget');

    child.onFieldChanged('title', 'FOR-TYPING');

    expect(updatePreview).toHaveBeenCalledTimes(1);
    const updater = updatePreview.mock.calls[0][0] as (
      prev: ParentConfig | undefined
    ) => ParentConfig;
    const preview = updater(undefined);
    expect(preview.commentsWidget.title).toBe('FOR-TYPING');
    expect(preview.commentsWidget_multiple.title).toBe('AGAINST');
  });

  it('onFieldChanged writes a dotted key as a nested value, not a literal key', () => {
    const updatePreview = vi.fn();
    const previewConfig: ParentConfig = {
      commentsWidget: { title: 'FOR' },
      commentsWidget_multiple: { title: 'AGAINST' },
      buttonsWidget: { ctaButton: { show: false, href: '' } },
    };
    const child = extractConfig<
      ParentConfig,
      NonNullable<ParentConfig['buttonsWidget']>
    >({
      subWidgetKey: 'buttonsWidget',
      previewConfig,
      updatePreview,
    });

    child.onFieldChanged('ctaButton.show', true);

    const updater = updatePreview.mock.calls[0][0] as (
      prev: ParentConfig | undefined
    ) => ParentConfig;
    const preview = updater(undefined);
    expect(preview.buttonsWidget?.ctaButton?.show).toBe(true);
    expect((preview.buttonsWidget as any)['ctaButton.show']).toBeUndefined();
  });

  it('onFieldChanged does not throw when the sub-widget config is undefined', () => {
    const updatePreview = vi.fn();
    const previewConfig: ParentConfig = {
      commentsWidget: { title: 'FOR' },
      commentsWidget_multiple: { title: 'AGAINST' },
      buttonsWidget: undefined,
    };
    const child = extractConfig<
      ParentConfig,
      NonNullable<ParentConfig['buttonsWidget']>
    >({
      subWidgetKey: 'buttonsWidget',
      previewConfig,
      updatePreview,
    });

    expect(() => child.onFieldChanged('ctaButton.show', true)).not.toThrow();

    const updater = updatePreview.mock.calls[0][0] as (
      prev: ParentConfig | undefined
    ) => ParentConfig;
    const preview = updater(undefined);
    expect(preview.buttonsWidget?.ctaButton?.show).toBe(true);
  });

  it('throws when previewConfig is missing', () => {
    expect(() =>
      extractConfig<ParentConfig, ChildConfig>({
        subWidgetKey: 'commentsWidget',
        previewConfig: null,
        updatePreview: vi.fn(),
      })
    ).toThrow();
  });

  it('tells the form sync which draft key the sub-widget fields live under', () => {
    const { child } = setup('commentsWidget');
    expect((child.onFieldChanged as any).draftPrefix).toBe('commentsWidget');
  });
});
