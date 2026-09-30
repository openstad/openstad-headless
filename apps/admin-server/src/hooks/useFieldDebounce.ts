import debounce from 'lodash/debounce';
import { useEffect, useMemo, useRef } from 'react';

/*
 * A wrapper hook that centralizes the calling of the debounce hook to one call.
 * This is primarily used for the textual input fields and was made to aid rerendering the preview on change, but use it hoewever you wish.
 */

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
  onFieldChanged: (name: string, val: any) => void
) {
  const onChangedRef = useRef(onFieldChanged);
  onChangedRef.current = onFieldChanged;

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
      debounced.flush();
      fieldFlushers.delete(flush);
    };
  }, [debounced]);

  return {
    onFieldChange: debounced,
  };
}
