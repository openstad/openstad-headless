import { openItemChanged } from '@/lib/open-item-merge';
import cloneDeep from 'lodash/cloneDeep';
import { useEffect, useLayoutEffect, useRef } from 'react';
import type { FieldValues, UseFormReturn } from 'react-hook-form';

import type { ItemsUpdater } from './useDraftItems';
import { registerFieldFlusher } from './useFieldDebounce';
import { registerDraftValidator, reportOpenItemEdit } from './useWidgetDraft';

let openItemSeq = 0;

type OpenItemDraftOptions<T extends { id?: string }, V, S> = {
  form: UseFormReturn<V & FieldValues>;
  openId: string | null;
  state: S;
  items: T[];
  commitItems: (updater: ItemsUpdater<T>) => void;
  merge: (items: T[], openId: string, values: V, state: S) => T[];
  validate?: (
    items: T[],
    openId: string,
    values: V,
    state: S
  ) => string | undefined;
  label?: string;
};

export function useOpenItemDraft<T extends { id?: string }, V, S>({
  form,
  openId,
  state,
  items,
  commitItems,
  merge,
  validate,
  label,
}: OpenItemDraftOptions<T, V, S>) {
  const keyRef = useRef('');
  if (!keyRef.current) keyRef.current = `open-item:${(openItemSeq += 1)}`;

  const latestRef = useRef({
    openId,
    state,
    items,
    commitItems,
    merge,
    validate,
    label,
  });
  latestRef.current = {
    openId,
    state,
    items,
    commitItems,
    merge,
    validate,
    label,
  };

  const baselineRef = useRef<{ values: V; state: S } | null>(null);

  useLayoutEffect(() => {
    baselineRef.current = openId
      ? {
          values: cloneDeep(form.getValues() as V),
          state: cloneDeep(latestRef.current.state),
        }
      : null;
  }, [openId, form]);

  const isOpenItemDirty = () => {
    const latest = latestRef.current;
    const baseline = baselineRef.current;
    if (!baseline) return false;
    return openItemChanged(
      latest.items,
      latest.openId,
      { values: form.getValues() as V, state: latest.state },
      baseline,
      latest.merge
    );
  };

  const validationMessage = () => {
    const latest = latestRef.current;
    if (!latest.openId || !latest.validate) return undefined;
    return latest.validate(
      latest.items,
      latest.openId,
      form.getValues() as V,
      latest.state
    );
  };

  const commitOpenItem = () => {
    const latest = latestRef.current;
    const currentOpenId = latest.openId;
    if (!currentOpenId || !isOpenItemDirty() || validationMessage()) {
      return false;
    }
    const values = cloneDeep(form.getValues() as V);
    const currentState = latest.state;
    latest.commitItems((currentItems) =>
      latest.merge(currentItems, currentOpenId, values, currentState)
    );
    baselineRef.current = {
      values: cloneDeep(values),
      state: cloneDeep(currentState),
    };
    return true;
  };

  useEffect(() => {
    reportOpenItemEdit(keyRef.current, isOpenItemDirty());
  });

  useEffect(() => {
    const key = keyRef.current;
    const subscription = form.watch(() => {
      reportOpenItemEdit(key, isOpenItemDirty());
    });

    const unregisterFlush = registerFieldFlusher(() => {
      if (commitOpenItem()) reportOpenItemEdit(key, false);
    });

    const unregisterValidator = registerDraftValidator(() => {
      if (!isOpenItemDirty()) return { ok: true };
      const message = validationMessage();
      return message
        ? { ok: false, label: latestRef.current.label, message }
        : { ok: true };
    });

    return () => {
      subscription.unsubscribe();
      unregisterFlush();
      unregisterValidator();
      commitOpenItem();
      reportOpenItemEdit(key, null);
    };
  }, [form]);
}
