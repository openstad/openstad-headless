import { ControllerRenderProps } from 'react-hook-form';
import { FormControl } from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

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
  return (
    <Select
      onValueChange={(e: string) => {
        if (onFieldChanged) {
          onFieldChanged(field.name, e);
        }
        field.onChange(e);
      }}
      value={`${selected}`}>
      <FormControl>
        <SelectTrigger>
          <SelectValue placeholder="Selecteer een optie" />
        </SelectTrigger>
      </FormControl>
      <SelectContent>
        {noSelection.length > 0 ? (
          <SelectItem
            key={`${field.name}-dynamic-select-option-no-choice`}
            value={''}>
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
