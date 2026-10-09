// @vitest-environment jsdom
import cloneDeep from 'lodash/cloneDeep';
import { act } from 'react';
import { type Root, createRoot } from 'react-dom/client';
import { type UseFormReturn, useController, useForm } from 'react-hook-form';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { rebaselineAfterSave, useLooseFormDirty } from './save-controller';

vi.mock('next/router', () => ({
  useRouter: () => ({ events: { on() {}, off() {}, emit() {} } }),
}));

(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;

type Values = { limit: number | string; label?: string };

let form: UseFormReturn<Values>;
let dirty = false;
let renders = 0;

function Page({ defaults }: { defaults: Values }) {
  form = useForm<Values>({ defaultValues: defaults });
  dirty = useLooseFormDirty(form);
  renders += 1;
  return null;
}

type ExtraValues = {
  extraData: { a?: number; b?: number; originalId?: number };
};

let extraForm: UseFormReturn<ExtraValues>;
let extraDirty = false;

function OriginalId() {
  useController({ name: 'extraData.originalId', control: extraForm.control });
  return null;
}

// The resource form: a code editor replaces `extraData` as a whole, while
// `extraData.originalId` has its own field.
function ExtraDataPage() {
  extraForm = useForm<ExtraValues>({ defaultValues: { extraData: { a: 1 } } });
  extraDirty = useLooseFormDirty(extraForm);
  return <OriginalId />;
}

describe('useLooseFormDirty', () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
    renders = 0;
  });

  afterEach(() => {
    act(() => root.unmount());
    container.remove();
  });

  const set = (name: keyof Values, value: any) =>
    act(() => form.setValue(name, value, { shouldDirty: true }));

  it('sees a real change and the undo of it', () => {
    act(() => root.render(<Page defaults={{ limit: 30 }} />));
    expect(dirty).toBe(false);

    set('limit', '31');
    expect(dirty).toBe(true);

    set('limit', '30');
    expect(dirty).toBe(false);
  });

  it('treats an unset value and an emptied field as the same', () => {
    act(() => root.render(<Page defaults={{ limit: 1, label: undefined }} />));
    set('label', 'x');
    expect(dirty).toBe(true);
    set('label', '');
    expect(dirty).toBe(false);
  });

  it('stays clean after saving a whole object that has a nested field', () => {
    act(() => root.render(<ExtraDataPage />));
    act(() =>
      extraForm.setValue('extraData', { a: 1, b: 2 }, { shouldDirty: true })
    );
    expect(extraDirty).toBe(true);

    const sent = cloneDeep(extraForm.getValues());
    act(() => rebaselineAfterSave(extraForm, sent));

    expect(extraForm.formState.isDirty).toBe(true);
    expect(extraDirty).toBe(false);
  });

  it('does not re-render the page for every keystroke', () => {
    act(() => root.render(<Page defaults={{ limit: 1, label: '' }} />));
    set('label', 'a');
    const afterFirst = renders;
    for (const text of ['ab', 'abc', 'abcd', 'abcde', 'abcdef']) {
      set('label', text);
    }
    expect(renders - afterFirst).toBeLessThanOrEqual(1);
    expect(dirty).toBe(true);
  });
});
