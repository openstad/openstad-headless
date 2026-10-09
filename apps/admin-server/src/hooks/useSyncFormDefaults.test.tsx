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
  void form.formState.isDirty;
  const defaults = useCallback(
    () => ({ name: data?.name ?? '', authTypes: data?.authTypes ?? [] }),
    [data]
  );
  useSyncFormDefaults(form, defaults, data);
  return null;
}

type BudgetValues = { budget: number; start: Date };

let budgetForm: UseFormReturn<BudgetValues>;

function Budget({ data }: { data: BudgetValues | undefined }) {
  budgetForm = useForm<BudgetValues>({
    defaultValues: {
      budget: data?.budget ?? 0,
      start: data?.start ?? new Date('2020-01-01'),
    },
  });
  void budgetForm.formState.isDirty;
  const defaults = useCallback(
    () => ({
      budget: data?.budget ?? 0,
      start: data?.start ?? new Date('2020-01-01'),
    }),
    [data]
  );
  useSyncFormDefaults(budgetForm, defaults, data);
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

  it('adds a list item ticked before the stored list arrived', () => {
    act(() => root.render(<Page data={undefined} />));
    act(() => form.setValue('authTypes', ['Local'], { shouldDirty: true }));

    act(() =>
      root.render(
        <Page data={{ name: 'Stored', authTypes: ['UniqueCode', 'Url'] }} />
      )
    );

    expect(form.getValues('authTypes')).toEqual(['UniqueCode', 'Url', 'Local']);
    expect(form.getValues('name')).toBe('Stored');
    expect(form.formState.defaultValues?.authTypes).toEqual([
      'UniqueCode',
      'Url',
    ]);
    expect(form.formState.isDirty).toBe(true);
  });

  it('is clean after the stored values arrive when nothing was edited', () => {
    act(() => root.render(<Page data={undefined} />));

    act(() =>
      root.render(<Page data={{ name: 'Stored', authTypes: ['Url'] }} />)
    );

    expect(form.getValues()).toEqual({ name: 'Stored', authTypes: ['Url'] });
    expect(form.formState.isDirty).toBe(false);
  });

  it('does not count a reset made before the data arrived as an edit', () => {
    act(() => root.render(<Budget data={undefined} />));
    act(() => budgetForm.reset({}));

    act(() =>
      root.render(
        <Budget data={{ budget: 5000, start: new Date('2025-12-01') }} />
      )
    );

    expect(budgetForm.getValues('budget')).toBe(5000);
    expect(budgetForm.getValues('start')).toEqual(new Date('2025-12-01'));
    expect(budgetForm.formState.isDirty).toBe(false);
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
