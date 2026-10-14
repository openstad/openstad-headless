import { looseFormEqual } from '@/lib/loose-equal';
import { mergeEarlyEdits } from '@/lib/merge-early-edits';
import cloneDeep from 'lodash/cloneDeep';
import { useEffect, useRef } from 'react';

/**
 * Keep a react-hook-form in sync with data that is fetched after the first
 * render.
 *
 * A page builds its form before its data has arrived, so the first render uses
 * the fallbacks in `defaults` instead of the stored values. Resetting on every
 * change of `data` then swaps those fallbacks for the real values, which is
 * visible as flickering field values. Waiting for `data` keeps the fallbacks off
 * screen, and skipping the reset while the form is dirty stops a background
 * revalidation from discarding what the user is typing.
 */
export function useSyncFormDefaults(
  form: {
    formState: { isDirty: boolean };
    getValues: () => any;
    reset: (values?: any, options?: any) => void;
    watch: (callback: (values: any, info: { name?: string }) => void) => {
      unsubscribe: () => void;
    };
  },
  defaults: () => any,
  data: unknown
) {
  const loaded = useRef(false);
  const shown = useRef<Record<string, unknown> | null>(null);
  if (shown.current === null) shown.current = cloneDeep(form.getValues());
  const edited = useRef<Record<string, unknown>>({});

  useEffect(() => {
    const subscription = form.watch((values, { name }) => {
      if (loaded.current) return;
      if (name) {
        const key = name.split('.')[0];
        if (!(key in edited.current)) {
          edited.current[key] = cloneDeep(shown.current?.[key]);
        }
      }
      shown.current = cloneDeep(values);
    });
    return () => subscription.unsubscribe();
  }, [form]);

  useEffect(() => {
    if (!data) return;
    if (!loaded.current) {
      loaded.current = true;
      const stored = defaults();
      const current = form.getValues();
      const merged = { ...stored };
      Object.entries(edited.current).forEach(([key, before]) => {
        merged[key] = mergeEarlyEdits(before, current?.[key], stored?.[key]);
      });
      form.reset(stored);
      if (!looseFormEqual(merged, stored)) {
        form.reset(merged, { keepDefaultValues: true });
      }
      return;
    }
    if (form.formState.isDirty) return;
    form.reset(defaults());
  }, [form, defaults, data]);
}
