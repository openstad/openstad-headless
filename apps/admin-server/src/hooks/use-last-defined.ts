import { useRef } from 'react';

/**
 * The last value that was not undefined, until `resetKey` changes.
 *
 * A save on the authentication pages answers with the project without its auth
 * settings, so they are undefined until the refresh lands. A second save in
 * that moment can still use the settings the page loaded before.
 */
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
