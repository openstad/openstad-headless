// @vitest-environment jsdom
import { Component, type ReactNode, act, useState } from 'react';
import { type Root, createRoot } from 'react-dom/client';
import { type UseFormReturn, useForm } from 'react-hook-form';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import * as z from 'zod';

import { useSyncDraftForm, useWidgetDraft } from './useWidgetDraft';

const state = vi.hoisted(() => ({
  widgetId: '1',
  saved: { title: 'Goede titel' } as Record<string, unknown>,
}));

vi.mock('next/router', () => ({
  useRouter: () => ({
    query: { id: state.widgetId },
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
      const [previewConfig, setPreview] = useState(() => ({ ...state.saved }));
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

const schema = z.object({ title: z.string().min(3, 'Titel is te kort') });
type Values = { title: string };

let form: UseFormReturn<Values>;
let save: () => Promise<void>;

function Tab({
  label,
  onFieldChanged,
}: {
  label: string;
  onFieldChanged: (key: string, value: unknown) => void;
}) {
  form = useForm<Values>({ defaultValues: { title: 'Goede titel' } });
  useSyncDraftForm(form, onFieldChanged, { schema, label });
  return null;
}

function Editor({
  label,
  showTab = true,
}: {
  label: string;
  showTab?: boolean;
}) {
  const draft = useWidgetDraft({});
  save = draft.save;
  return showTab ? (
    <Tab label={label} onFieldChanged={draft.onFieldChanged} />
  ) : null;
}

let showLateTab: (show: boolean) => void;

function LateTab({
  onFieldChanged,
}: {
  onFieldChanged: (key: string, value: unknown) => void;
}) {
  const [show, setShow] = useState(false);
  showLateTab = setShow;
  return show ? <Tab label="Weergave" onFieldChanged={onFieldChanged} /> : null;
}

function EditorWithLateTab() {
  const draft = useWidgetDraft({});
  save = draft.save;
  return <LateTab onFieldChanged={draft.onFieldChanged} />;
}

function DiscardedEditor(): ReactNode {
  useWidgetDraft({});
  throw new Error('render discarded');
}

class Boundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? null : this.props.children;
  }
}

const wait = () =>
  act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 350));
  });

async function leaveTitleInvalid() {
  act(() => form.setValue('title', 'x', { shouldDirty: true }));
  await wait();
}

describe('a draft check left behind by another widget', () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
    state.widgetId = '1';
  });

  afterEach(() => {
    act(() => root.unmount());
    container.remove();
  });

  it('does not block the save of the widget opened right after it', async () => {
    act(() => root.render(<Editor key="1" label="Algemeen" />));
    await leaveTitleInvalid();
    await expect(save()).rejects.toThrow('Algemeen: Titel is te kort');

    state.widgetId = '2';
    act(() => root.render(<Editor key="2" label="Algemeen" />));
    await expect(save()).resolves.toBeUndefined();
  });

  it('does not block it either when the next widget has no tab with that name', async () => {
    act(() => root.render(<Editor key="1" label="Algemeen" />));
    await leaveTitleInvalid();

    state.widgetId = '2';
    act(() => root.render(<Editor key="2" label="Weergave" />));
    await expect(save()).resolves.toBeUndefined();
  });

  it('still blocks the save of the same widget after its invalid tab was closed', async () => {
    act(() => root.render(<Editor label="Algemeen" />));
    await leaveTitleInvalid();

    act(() => root.render(<Editor label="Algemeen" showTab={false} />));
    await expect(save()).rejects.toThrow('Algemeen: Titel is te kort');
  });

  it('checks a tab opened right after another editor rendered without being shown', async () => {
    const errors = vi.spyOn(console, 'error').mockImplementation(() => {});
    const other = createRoot(document.createElement('div'));
    act(() => root.render(<EditorWithLateTab />));
    act(() =>
      other.render(
        <Boundary>
          <DiscardedEditor />
        </Boundary>
      )
    );
    act(() => showLateTab(true));
    await leaveTitleInvalid();

    await expect(save()).rejects.toThrow('Weergave: Titel is te kort');
    act(() => other.unmount());
    errors.mockRestore();
  });
});
