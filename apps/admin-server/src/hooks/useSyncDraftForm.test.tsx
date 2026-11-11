// @vitest-environment jsdom
import { YesNoSelect } from '@/lib/form-widget-helpers';
import { act } from 'react';
import { type Root, createRoot } from 'react-dom/client';
import { Controller, type UseFormReturn, useForm } from 'react-hook-form';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { useSyncDraftForm } from './useWidgetDraft';

vi.mock('next/router', () => ({
  useRouter: () => ({ query: {}, events: { on() {}, off() {}, emit() {} } }),
}));

(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;

type Values = { title: string; extra?: boolean };

let form: UseFormReturn<Values>;
const pushed: Array<[string, unknown]> = [];
const push = (name: string, value: unknown) => pushed.push([name, value]);

function Tab({ showExtra }: { showExtra: boolean }) {
  form = useForm<Values>({ defaultValues: { title: 'x' } });
  useSyncDraftForm(form, push);
  return showExtra ? (
    <Controller
      control={form.control}
      name="extra"
      render={({ field }) => YesNoSelect(field, {})}
    />
  ) : null;
}

const wait = () =>
  act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 350));
  });

describe('useSyncDraftForm and a yes/no switch', () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
    pushed.length = 0;
  });

  afterEach(() => {
    act(() => root.unmount());
    container.remove();
  });

  it('does not push the "off" a switch shows for a value that was never set', async () => {
    act(() => root.render(<Tab showExtra />));
    await wait();
    expect(form.getValues('extra')).toBe(false);
    expect(pushed).toEqual([]);

    act(() => root.render(<Tab showExtra={false} />));
    act(() => root.unmount());
    root = createRoot(container);
    act(() => root.render(<Tab showExtra={false} />));
    act(() => root.render(<Tab showExtra />));
    await wait();
    expect(pushed).toEqual([]);
  });

  it('still pushes a real switch change', async () => {
    act(() => root.render(<Tab showExtra />));
    await wait();
    act(() => container.querySelector('button')!.click());
    await wait();
    expect(pushed).toEqual([['extra', true]]);
  });
});
