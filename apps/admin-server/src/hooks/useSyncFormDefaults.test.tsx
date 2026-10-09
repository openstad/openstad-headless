// @vitest-environment jsdom
import { act, useCallback } from 'react';
import { type Root, createRoot } from 'react-dom/client';
import { type UseFormReturn, useForm } from 'react-hook-form';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { useSyncFormDefaults } from './useSyncFormDefaults';

(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;

type Values = { name: string; authTypes: string[] };
type Stored = { name: string; authTypes: string[] } | undefined;

let form: UseFormReturn<Values>;

function Page({ data }: { data: Stored }) {
  form = useForm<Values>({
    defaultValues: { name: data?.name ?? '', authTypes: data?.authTypes ?? [] },
  });
  // Subscribes to isDirty, like the pages do through the save bar.
  void form.formState.isDirty;
  const defaults = useCallback(
    () => ({ name: data?.name ?? '', authTypes: data?.authTypes ?? [] }),
    [data]
  );
  useSyncFormDefaults(form, defaults, data);
  return null;
}

describe('useSyncFormDefaults', () => {
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

  it('takes in the stored values when they arrive, keeping an edit made before', () => {
    act(() => root.render(<Page data={undefined} />));
    act(() => form.setValue('name', 'Typed early', { shouldDirty: true }));

    act(() =>
      root.render(
        <Page data={{ name: 'Stored', authTypes: ['UniqueCode', 'Url'] }} />
      )
    );

    expect(form.getValues('authTypes')).toEqual(['UniqueCode', 'Url']);
    expect(form.getValues('name')).toBe('Typed early');
    expect(form.formState.isDirty).toBe(true);
  });

  it('does not reset over an edit when the data changes later', () => {
    act(() =>
      root.render(<Page data={{ name: 'Stored', authTypes: ['Url'] }} />)
    );
    act(() => form.setValue('name', 'Typing', { shouldDirty: true }));

    act(() =>
      root.render(<Page data={{ name: 'Refetched', authTypes: ['Url'] }} />)
    );

    expect(form.getValues('name')).toBe('Typing');
  });
});
