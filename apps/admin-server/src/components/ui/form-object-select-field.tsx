import React from 'react';
import {

  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../../components/ui/form';

import { ObjectListSelect } from '@/components/ui/object-select';
import InfoDialog from '@/components/ui/info-hover';

// TODO find the actual type of the form, so we can get typehinting in the parent for fieldName based on the passed form
type Props<T> = {
  form: any;
  fieldName: string;
  fieldLabel?:string;
  fieldInfo?:string;
  items: Array<T>;
  keyForValue: keyof T;
  onFieldChanged?: (key: string, value: keyof T) => void;
  label?: (item: T) => string;
  noSelection?: string;
};

export const FormObjectSelectField = <T extends { [key: string]: any }>({
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
            selected:field.value,
            ...props,
          })}
          <FormMessage />
        </FormItem>
      )}
    />
  );
};
