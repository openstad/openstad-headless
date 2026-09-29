import InfoDialog from '@/components/ui/info-hover';
import { ObjectListSelect } from '@/components/ui/object-select';
import React from 'react';
import type { UseFormReturn } from 'react-hook-form';

import {
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../../components/ui/form';

// TODO find the actual type of the form, so we can get typehinting in the parent for fieldName based on the passed form
type Props<T> = {
  // UseFormReturn is invariant in its field values and fieldName is a runtime
  // string, so callers' typed forms cannot be passed as UseFormReturn<FieldValues>.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  form: UseFormReturn<any>;
  fieldName: string;
  fieldLabel?: string;
  fieldInfo?: string;
  items?: Array<T>;
  keyForValue: keyof T;
  onFieldChanged?: (key: string, value: string) => void;
  label?: (item: T) => string;
  noSelection?: string;
};

export const FormObjectSelectField = <T extends object>({
  form,
  ...props
}: Props<T>) => {
  return (
    <FormField
      control={form.control}
      name={props.fieldName}
      render={({ field }) => (
        <FormItem>
          <FormLabel>
            {props.fieldLabel}
            {props.fieldInfo && <InfoDialog content={props.fieldInfo} />}
          </FormLabel>
          {ObjectListSelect<T>({
            field,
            selected: field.value,
            ...props,
          })}
          <FormMessage />
        </FormItem>
      )}
    />
  );
};
