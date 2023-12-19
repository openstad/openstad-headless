import { useDebounce } from 'rooks';

/*
 * A wrapper hook that centralizes the calling of the debounce hook to one call.
 * This is primarily used for the textual input fields and was made to aid rerendering the preview on change, but use it hoewever you wish.
 */

export function useFieldDebounce(
  onFieldChanged: (name: string, val: string | number | boolean) => void
) {
  return {
    onFieldChange: useDebounce((name, val) => onFieldChanged(name, val), 300),
  };
}
