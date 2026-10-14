// @vitest-environment jsdom
import {
  SaveControllerProvider,
  useSaveController,
} from '@/components/ui/save-controller';
import { useWidgetDraft } from '@/hooks/useWidgetDraft';
import { extractConfig } from '@/lib/sub-widget-helper';
import ArgumentsGeneral from '@/pages/projects/[project]/widgets/comments/[id]/general';
import { act } from 'react';
import { type Root, createRoot } from 'react-dom/client';
import { afterEach, describe, expect, it, vi } from 'vitest';

const widget = vi.hoisted(() => ({ saved: {} as any, puts: [] as any[] }));

vi.mock('next/router', () => ({
  useRouter: () => ({
    query: { id: '7', project: '2' },
    pathname: '/projects/[project]/widgets/resourcedetail/[id]',
    events: { on() {}, off() {}, emit() {} },
  }),
}));

vi.mock('@/hooks/use-widget-config', async () => {
  const { useCallback, useState } = await import('react');
  return {
    useWidgetConfig: () => {
      const [saved, setSaved] = useState(() => widget.saved);
      const updateConfig = useCallback(
        async (config: any) => {
          widget.puts.push(config);
          const next = { ...saved, ...config };
          setSaved(next);
          return { config: next };
        },
        [saved]
      );
      return { data: { config: saved }, isLoading: false, updateConfig };
    },
  };
});

vi.mock('@/hooks/use-resources', () => ({ default: () => ({ data: [] }) }));

vi.mock('@/components/ui/select', async () => {
  const React = await import('react');
  const Choice = React.createContext<any>(null);
  return {
    Select: ({ value, onValueChange, children }: any) => (
      <Choice.Provider value={{ value, onValueChange }}>
        {children}
      </Choice.Provider>
    ),
    SelectTrigger: ({ children }: any) => <>{children}</>,
    SelectValue: () => null,
    SelectContent: ({ children }: any) => {
      const choice = React.useContext(Choice);
      return (
        <select
          value={choice.value ?? ''}
          onChange={(event) => choice.onValueChange(event.target.value)}>
          {children}
        </select>
      );
    },
    SelectItem: ({ value, children }: any) => (
      <option value={value}>{children}</option>
    ),
  };
});

(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;
(globalThis as any).ResizeObserver ??= class {
  observe() {}
  unobserve() {}
  disconnect() {}
};

let controller: ReturnType<typeof useSaveController>;

function Bar() {
  controller = useSaveController();
  return null;
}

function Editor() {
  const { previewConfig, updatePreview } = useWidgetDraft<any>({
    projectId: '2',
  });
  if (!previewConfig) return null;
  return (
    <ArgumentsGeneral
      omitSchemaKeys={['resourceId', 'sentiment']}
      {...(extractConfig<any, any>({
        subWidgetKey: 'commentsWidget',
        previewConfig,
        updatePreview,
      }) as any)}
    />
  );
}

const settle = (ms = 400) =>
  act(async () => {
    await new Promise((resolve) => setTimeout(resolve, ms));
  });

describe('Tonen van reacties on the Reacties widget tab', () => {
  let container: HTMLDivElement;
  let root: Root;

  async function open(commentsWidget: Record<string, unknown>) {
    widget.saved = { commentsWidget };
    widget.puts = [];
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
    act(() =>
      root.render(
        <SaveControllerProvider>
          <Bar />
          <Editor />
        </SaveControllerProvider>
      )
    );
    await settle();
  }

  afterEach(() => {
    act(() => root.unmount());
    container.remove();
  });

  function sentiments() {
    return Array.from(container.querySelectorAll('select')).find((select) =>
      Array.from(select.options).some(
        (option) => option.value === '["no sentiment"]'
      )
    ) as HTMLSelectElement;
  }

  it.each([
    ['a list', ['no sentiment']],
    ['a list stored as text', '["no sentiment"]'],
  ])('shows the choice stored as %s, and opens clean', async (_, stored) => {
    await open({ useSentiments: stored });

    expect(sentiments().value).toBe('["no sentiment"]');
    expect(controller.isDirty).toBe(false);
  });

  it('stores the choice as a list', async () => {
    await open({ useSentiments: ['for', 'against'] });
    act(() => {
      sentiments().value = '["no sentiment"]';
      sentiments().dispatchEvent(new Event('change', { bubbles: true }));
    });
    await settle();
    expect(controller.isDirty).toBe(true);

    act(() => controller.triggerSave());
    await settle(100);

    expect(controller.errorMessage).toBeNull();
    expect(widget.puts[0].commentsWidget.useSentiments).toEqual([
      'no sentiment',
    ]);
  });
});
