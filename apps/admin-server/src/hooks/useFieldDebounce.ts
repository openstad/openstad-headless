import debounce from 'lodash/debounce';
import { useEffect, useMemo, useRef } from 'react';

/*
 * A wrapper hook that centralizes the calling of the debounce hook to one call.
 * This is primarily used for the textual input fields and was made to aid rerendering the preview on change, but use it hoewever you wish.
 */

// Registry of the flush functions of every mounted debounced field. The
// whole-widget save flow flushes these so a value the user just typed (still
// inside its 300ms debounce window) is committed to the draft before saving.
const fieldFlushers = new Set<() => void>();

/** Flush all pending field debounces so their values reach the draft config. */
export function flushAllFields() {
  fieldFlushers.forEach((flush) => flush());
}

/**
 * Register a flush function (e.g. a lodash debounce's `.flush`) so it is invoked
 * by flushAllFields() before a whole-widget save. Returns an unregister fn.
 */
export function registerFieldFlusher(flush: () => void): () => void {
  fieldFlushers.add(flush);
  return () => {
    fieldFlushers.delete(flush);
  };
}

export function useFieldDebounce(
  // `val` is `any` (not just scalars) because some fields push structured values
  // — e.g. the extra-fields/tags editors commit an array of option groups. This
  // matches `onFieldChanged?: (key, value: any)` used across form-widget-helpers.
  onFieldChanged: (name: string, val: any) => void
) {
  // Keep the latest callback in a ref so the debounced function (created once)
  // never calls a stale closure.
  const onChangedRef = useRef(onFieldChanged);
  onChangedRef.current = onFieldChanged;

  // A stable lodash debounce we fully control — unlike the previous rooks
  // useDebounce, whose internal unmount cleanup CANCELS the pending call. That
  // silently dropped a value typed just before switching tabs (Radix unmounts
  // the inactive tab). We flush on unmount instead so the edit reaches the
  // draft (previewConfig lives above the tabs and survives the switch).
  const debounced = useMemo(
    () =>
      debounce(
        (name: string, val: any) => onChangedRef.current(name, val),
        300
      ),
    []
  );

  useEffect(() => {
    const flush = () => debounced.flush();
    fieldFlushers.add(flush);
    return () => {
      // Commit any pending value before unmount so a mid-edit tab switch does
      // not discard it.
      debounced.flush();
      fieldFlushers.delete(flush);
    };
  }, [debounced]);

  return {
    onFieldChange: debounced,
  };
}
