import { useDebounce } from 'rooks';

export function useFieldDebounce(
  onFieldChanged: (name: string, val: string | number | boolean) => void
) {
  return {
    onFieldChange: useDebounce((name, val) => onFieldChanged(name, val), 300),
  };
}
