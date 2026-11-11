// @vitest-environment jsdom
import { act } from 'react';
import { type Root, createRoot } from 'react-dom/client';
import { type UseFormReturn, useForm } from 'react-hook-form';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import type { ItemsUpdater } from './useDraftItems';
import { flushAllFields } from './useFieldDebounce';
import { useOpenItemDraft } from './useOpenItemDraft';

type DraftValidator = () => { ok: boolean; label?: string; message?: string };

const draft = vi.hoisted(() => ({
  edits: new Map<string, boolean>(),
  validators: new Set<
    () => { ok: boolean; label?: string; message?: string }
  >(),
}));

vi.mock('./useWidgetDraft', () => ({
  reportOpenItemEdit: (key: string, dirty: boolean | null) => {
    if (dirty === null) draft.edits.delete(key);
    else draft.edits.set(key, dirty);
  },
  registerDraftValidator: (validate: DraftValidator) => {
    draft.validators.add(validate);
    return () => {
      draft.validators.delete(validate);
    };
  },
}));

(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;

type TestItem = { id: string; title: string; fieldKey: string };
type TestValues = { title: string; fieldKey: string };

const mergeItem = (items: TestItem[], openId: string, values: TestValues) =>
  items.map((item) => (item.id === openId ? { ...item, ...values } : item));

const validateItem = (
  _items: TestItem[],
  _openId: string,
  values: TestValues
) => (values.fieldKey ? undefined : 'Vul een sleutel in.');

const storedItem: TestItem = { id: 'q1', title: 'Vraag', fieldKey: 'vraag' };

function mountHook(initialItems: TestItem[], openId: string | null) {
  const container = document.createElement('div');
  document.body.appendChild(container);
  let root: Root;
  let items = initialItems;
  let form: UseFormReturn<TestValues>;
  let releaseOpenItem: () => boolean;

  const commitItems = vi.fn((updater: ItemsUpdater<TestItem>) => {
    items = typeof updater === 'function' ? updater(items) : updater;
  });

  const open = initialItems.find((item) => item.id === openId);

  function Probe() {
    form = useForm<TestValues>({
      defaultValues: {
        title: open?.title ?? '',
        fieldKey: open?.fieldKey ?? '',
      },
    });
    ({ releaseOpenItem } = useOpenItemDraft<TestItem, TestValues, null>({
      form,
      openId,
      state: null,
      items,
      commitItems,
      merge: mergeItem,
      validate: validateItem,
      label: 'Items',
    }));
    return null;
  }

  act(() => {
    root = createRoot(container);
    root.render(<Probe />);
  });

  let mounted = true;

  return {
    items: () => items,
    commitItems,
    edit: (field: keyof TestValues, value: string) =>
      act(() => {
        form.setValue(field, value);
      }),
    release: () => {
      let released = false;
      act(() => {
        released = releaseOpenItem();
      });
      return released;
    },
    unmount: () => {
      if (!mounted) return;
      mounted = false;
      act(() => {
        root.unmount();
        container.remove();
      });
    },
  };
}

const isDirty = () => Array.from(draft.edits.values()).some(Boolean);
const validationResults = () =>
  Array.from(draft.validators).map((validate) => validate());

describe('useOpenItemDraft', () => {
  let harness: ReturnType<typeof mountHook> | undefined;

  beforeEach(() => {
    draft.edits.clear();
    draft.validators.clear();
    harness = undefined;
  });

  afterEach(() => {
    harness?.unmount();
  });

  it('reports the open item as dirty once a field changes', () => {
    harness = mountHook([storedItem], 'q1');
    expect(isDirty()).toBe(false);

    harness.edit('title', 'Nieuwe vraag');

    expect(isDirty()).toBe(true);
  });

  it('commits the open item into the items when the fields are flushed', () => {
    harness = mountHook([storedItem], 'q1');
    harness.edit('title', 'Nieuwe vraag');

    act(() => flushAllFields());

    expect(harness.commitItems).toHaveBeenCalledTimes(1);
    expect(harness.items()).toEqual([{ ...storedItem, title: 'Nieuwe vraag' }]);
    expect(isDirty()).toBe(false);
  });

  it('commits a valid open edit when the item screen unmounts', () => {
    harness = mountHook([storedItem], 'q1');
    harness.edit('title', 'Nieuwe vraag');

    harness.unmount();

    expect(harness.commitItems).toHaveBeenCalledTimes(1);
    expect(harness.items()).toEqual([{ ...storedItem, title: 'Nieuwe vraag' }]);
    expect(draft.edits.size).toBe(0);
  });

  it('does not commit an invalid open edit on unmount', () => {
    harness = mountHook([storedItem], 'q1');
    harness.edit('fieldKey', '');

    expect(validationResults()).toEqual([
      { ok: false, label: 'Items', message: 'Vul een sleutel in.' },
    ]);

    harness.unmount();

    expect(harness.commitItems).not.toHaveBeenCalled();
    expect(harness.items()).toEqual([storedItem]);
  });

  it('does not commit on unmount when nothing was edited', () => {
    harness = mountHook([storedItem], 'q1');

    harness.unmount();

    expect(harness.commitItems).not.toHaveBeenCalled();
  });

  it('does not commit on unmount when no item is open', () => {
    harness = mountHook([storedItem], null);
    harness.edit('title', 'Nieuwe vraag');

    harness.unmount();

    expect(harness.commitItems).not.toHaveBeenCalled();
  });

  it('commits the open item when it is released for another item', () => {
    harness = mountHook([storedItem], 'q1');
    harness.edit('title', 'Nieuwe vraag');

    expect(harness.release()).toBe(true);

    expect(harness.commitItems).toHaveBeenCalledTimes(1);
    expect(harness.items()).toEqual([{ ...storedItem, title: 'Nieuwe vraag' }]);
    expect(isDirty()).toBe(false);
  });

  it('keeps an invalid open item instead of releasing it', () => {
    harness = mountHook([storedItem], 'q1');
    harness.edit('fieldKey', '');

    expect(harness.release()).toBe(false);

    expect(harness.commitItems).not.toHaveBeenCalled();
    expect(harness.items()).toEqual([storedItem]);
  });

  it('releases an unedited open item without committing it', () => {
    harness = mountHook([storedItem], 'q1');

    expect(harness.release()).toBe(true);

    expect(harness.commitItems).not.toHaveBeenCalled();
  });

  it('releases when no item is open', () => {
    harness = mountHook([storedItem], null);
    harness.edit('title', 'Nieuwe vraag');

    expect(harness.release()).toBe(true);

    expect(harness.commitItems).not.toHaveBeenCalled();
  });
});
