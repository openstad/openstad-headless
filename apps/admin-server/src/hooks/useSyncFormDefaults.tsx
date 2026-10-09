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
 *
 * The first data is always taken in: an edit made before it arrived is kept,
 * every other field gets its stored value. Otherwise a save would send the
 * fallbacks of the untouched fields and overwrite what is stored.
 */
export function useSyncFormDefaults(
  form: {
    formState: { isDirty: boolean };
    reset: (values?: any, options?: any) => void;
  },
  defaults: () => any,
  data: unknown
) {
  const loaded = useRef(false);
  useEffect(() => {
    if (!data) return;
    if (!loaded.current) {
      loaded.current = true;
      form.reset(
        defaults(),
        form.formState.isDirty ? { keepDirtyValues: true } : undefined
      );
      return;
    }
    if (form.formState.isDirty) return;
    form.reset(defaults());
  }, [form, defaults, data]);
}
