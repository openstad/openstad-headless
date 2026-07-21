import { FormControl } from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ControllerRenderProps } from 'react-hook-form';

const NO_SELECTION_VALUE = '__none__';

type Props<T> = {
  field: ControllerRenderProps<any, any>;
  items: Array<T>;
  keyForValue: keyof T;
  selected?: T[keyof T] | '';
  onFieldChanged?: (key: string, value: keyof T) => void;
  label?: (item: T) => string;
  noSelection?: string;
};

export const ObjectListSelect = <T extends { [key: string]: any }>({
  field,
  items = [],
  keyForValue,
  onFieldChanged,
  label,
  selected = '',
  noSelection = '',
}: Props<T>) => {
  const hasNoSelectionOption = noSelection.length > 0;
  const selectedString = `${selected ?? ''}`;
  const triggerValue =
    hasNoSelectionOption && selectedString === ''
      ? NO_SELECTION_VALUE
      : selectedString;

  return (
    <Select
      onValueChange={(e: string) => {
        const next = e === NO_SELECTION_VALUE ? '' : e;
        if (onFieldChanged) {
          onFieldChanged(field.name, next);
        }
        field.onChange(next);
      }}
      value={triggerValue}>
      <FormControl>
        <SelectTrigger>
          <SelectValue placeholder="Selecteer een optie" />
        </SelectTrigger>
      </FormControl>
      <SelectContent className="overflow-y-auto max-h-[16rem]">
        {hasNoSelectionOption ? (
          <SelectItem
            key={`${field.name}-dynamic-select-option-no-choice`}
            value={NO_SELECTION_VALUE}>
            {noSelection}
          </SelectItem>
        ) : null}
        {items.map((item, index) => {
          return (
            <SelectItem
              key={`${field.name}-dynamic-select-option-${index}`}
              value={`${item[keyForValue]}`}>
              {label ? label(item) : item[keyForValue]}
            </SelectItem>
          );
        })}
      </SelectContent>
    </Select>
  );
};
