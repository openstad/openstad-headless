// @vitest-environment jsdom
import { act } from 'react';
import { type Root, createRoot } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { useWidgetDraft } from './useWidgetDraft';

const state = vi.hoisted(() => ({
  saved: { itemsPerPage: 9999, commentsWidget: { itemsPerPage: 20 } } as Record<
    string,
    unknown
  >,
}));

vi.mock('next/router', () => ({
  useRouter: () => ({
    query: { id: '1' },
    events: { on() {}, off() {}, emit() {} },
  }),
}));

vi.mock('@/components/ui/save-controller', () => ({
  useRegisterSave() {},
  useSaveController: () => ({ invalidateInFlightSave() {} }),
}));

vi.mock('./use-widget-config', () => ({
  useWidgetConfig: () => ({
    data: { config: state.saved },
    updateConfig: async (config: unknown) => ({ config }),
  }),
}));

vi.mock('./useWidgetPreview', async () => {
  const { useCallback, useState } = await import('react');
  return {
    useWidgetPreview: () => {
      const [previewConfig, setPreview] = useState(() =>
        structuredClone(state.saved)
      );
      const updatePreview = useCallback(
        (next: any) =>
          setPreview(typeof next === 'function' ? next : () => next),
        []
      );
      return { previewConfig, updatePreview };
    },
  };
});

(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;

let draft: ReturnType<typeof useWidgetDraft>;

function Editor() {
  draft = useWidgetDraft({});
  return null;
}

describe('useWidgetDraft number fields', () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(() => {
    act(() => root.unmount());
    container.remove();
  });

  it('stores a number typed again after emptying the field as a number', () => {
    act(() => root.render(<Editor />));

    act(() => draft.onFieldChanged('itemsPerPage', ''));
    act(() => draft.onFieldChanged('itemsPerPage', '9999'));
    expect((draft.previewConfig as any).itemsPerPage).toBe(9999);

    act(() => draft.onFieldChanged('commentsWidget.itemsPerPage', ''));
    act(() => draft.onFieldChanged('commentsWidget.itemsPerPage', '30'));
    expect((draft.previewConfig as any).commentsWidget.itemsPerPage).toBe(30);
  });
});
