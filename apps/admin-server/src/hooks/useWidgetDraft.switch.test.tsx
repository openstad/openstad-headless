// @vitest-environment jsdom
import { YesNoSelect } from '@/lib/form-widget-helpers';
import { act } from 'react';
import { type Root, createRoot } from 'react-dom/client';
import { Controller, type UseFormReturn, useForm } from 'react-hook-form';
import { SWRConfig } from 'swr';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { useSyncDraftForm, useWidgetDraft } from './useWidgetDraft';

vi.mock('next/router', () => ({
  useRouter: () => ({
    query: { id: '6', project: '2' },
    isReady: true,
    events: { on() {}, off() {}, emit() {} },
  }),
}));

vi.mock('@/components/ui/save-controller', () => ({
  useRegisterSave() {},
  useSaveController: () => ({ invalidateInFlightSave() {} }),
}));

(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;

let stored: any;
let puts: any[];
let api: ReturnType<typeof useWidgetDraft<any>>;
let form: UseFormReturn<{
  displayVote: boolean;
  intro: string;
  ctaButton: { show: boolean };
}>;

function Tab({
  config,
  onFieldChanged,
}: {
  config: any;
  onFieldChanged: (key: string, value: any) => void;
}) {
  form = useForm({
    defaultValues: {
      displayVote: config.displayVote || false,
      intro: config.intro || '',
      ctaButton: config.ctaButton || { show: false },
    },
  });
  useSyncDraftForm(form, onFieldChanged);
  return (
    <>
      <Controller
        control={form.control}
        name="displayVote"
        render={({ field }) => YesNoSelect(field, {})}
      />
      <Controller
        control={form.control}
        name="intro"
        render={({ field }) => <input {...field} />}
      />
      <Controller
        control={form.control}
        name="ctaButton.show"
        render={({ field }) => YesNoSelect(field, {})}
      />
    </>
  );
}

function Editor() {
  api = useWidgetDraft<any>({});
  if (!api.previewConfig) return null;
  return <Tab config={api.previewConfig} onFieldChanged={api.onFieldChanged} />;
}

const wait = (ms = 350) =>
  act(async () => {
    await new Promise((resolve) => setTimeout(resolve, ms));
  });

describe('useWidgetDraft: a switch the widget never stored', () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(async () => {
    stored = { title: 'A' };
    puts = [];
    vi.stubGlobal('fetch', async (_url: string, init?: any) => {
      if (init?.method === 'PUT') {
        const body = JSON.parse(init.body);
        puts.push(body.config);
        stored = { ...stored, ...body.config };
      }
      return {
        ok: true,
        status: 200,
        statusText: 'OK',
        json: async () => ({ id: 6, config: stored }),
      };
    });
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
    act(() =>
      root.render(
        <SWRConfig
          value={{
            provider: () => new Map(),
            dedupingInterval: 0,
            fetcher: (url: string) => fetch(url).then((res: any) => res.json()),
          }}>
          <Editor />
        </SWRConfig>
      )
    );
    await wait(30);
    await wait(30);
  });

  afterEach(() => {
    act(() => root.unmount());
    container.remove();
    vi.unstubAllGlobals();
  });

  const toggle = (index = 0) =>
    act(() =>
      (
        container.querySelectorAll('[role="switch"]')[index] as HTMLElement
      ).click()
    );

  it('saves "off" after the user switched it on and off again', async () => {
    toggle();
    await wait();
    expect(api.isDirty).toBe(true);
    toggle();
    await wait();

    expect(api.isDirty).toBe(true);
    await act(async () => {
      await api.save();
    });
    expect(puts[0]).toEqual({ displayVote: false });
  });

  it('saves "off" for a switch inside a group that was never stored', async () => {
    toggle(1);
    await wait();
    toggle(1);
    await wait();

    expect(api.isDirty).toBe(true);
    await act(async () => {
      await api.save();
    });
    expect(puts[0]).toEqual({ ctaButton: { show: false } });
  });

  it('is clean when code sets the switch on and off again', async () => {
    act(() => form.setValue('displayVote', true));
    await wait();
    act(() => form.setValue('displayVote', false));
    await wait();

    expect(api.isDirty).toBe(false);
  });

  it('is clean after typing a text and removing it again', async () => {
    const input = container.querySelector('input') as HTMLInputElement;
    const setValue = Object.getOwnPropertyDescriptor(
      HTMLInputElement.prototype,
      'value'
    )!.set!;
    act(() => {
      setValue.call(input, 'Hallo');
      input.dispatchEvent(new Event('input', { bubbles: true }));
    });
    await wait();
    expect(api.isDirty).toBe(true);
    act(() => {
      setValue.call(input, '');
      input.dispatchEvent(new Event('input', { bubbles: true }));
    });
    await wait();

    expect(api.isDirty).toBe(false);
  });
});
