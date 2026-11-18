import { useRef } from 'react';

/** The last value that was not undefined, until `resetKey` changes. */
export function useLastDefined<T>(
  value: T | undefined,
  resetKey?: unknown
): T | undefined {
  const last = useRef<{ key: unknown; value: T | undefined }>({
    key: resetKey,
    value,
  });
  if (last.current.key !== resetKey) last.current = { key: resetKey, value };
  if (value !== undefined) last.current.value = value;
  return last.current.value;
}
