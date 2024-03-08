import useTags from '@/hooks/use-tags';

import React, { useEffect } from 'react';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../components/ui/form';

import _ from 'lodash';
import { Checkbox } from './ui/checkbox';

type Props<T> = {
  projectId: string;
  form: any;
  fieldName: string;
  fieldLabel?: string;
  keyForValue: keyof T;
  keyForGrouping?: keyof T;
  items: Array<T>;
  label?: (item: T) => string;
};

export const TagCheckboxList = <T extends { [key: string]: any }>({
  form,
  fieldName,
  fieldLabel,
  items,
  keyForValue,
  keyForGrouping,
  label,
}: Props<T>) => {
  const [groupNames, setGroupedNames] = React.useState<string[]>([]);

  useEffect(() => {
    if (Array.isArray(items) && keyForGrouping) {
      const groupNames = _.chain(items).map(keyForGrouping).uniq().value();
      setGroupedNames(groupNames);
    }
  }, [items]);

  if (!keyForGrouping) {
    return (
      <FormField
        control={form.control}
        name={fieldName}
        render={({ field }) => (
          <FormItem className="col-span-full">
            <FormLabel>{fieldLabel}</FormLabel>
            {items?.map((item: any) => (
              <FormField
                key={item[keyForValue]}
                control={form.control}
                name={fieldName}
                render={({ field }) => {
                  return (
                    <FormItem
                      key={item[keyForValue]}
                      className="flex space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value?.includes(item[keyForValue])}
                          onCheckedChange={(checked: any) => {
                            return checked
                              ? field.onChange([
                                  ...field.value,
                                  item[keyForValue],
                                ])
                              : field.onChange(
                                  field.value?.filter(
                                    (value: any) => value !== item[keyForValue]
                                  )
                                );
                          }}
                        />
                      </FormControl>
                      <FormLabel className="font-normal">
                        {label && label(item)}
                      </FormLabel>
                    </FormItem>
                  );
                }}
              />
            ))}
            <FormMessage />
          </FormItem>
        )}
      />
    );
  }

  return (
    <FormField
      control={form.control}
      name={fieldName}
      render={({ field }) => (
        <FormItem className="col-span-full">
          <FormLabel>{fieldLabel}</FormLabel>
          <div className="gap-x-4 gap-y-4">
            {(groupNames || []).map((groupName, index) => {
              return (
                <>
                  <FormLabel className="font-normal">
                    {`${
                      groupName[0].toUpperCase() +
                      (groupName.length > 1 ? groupName.slice(1) : '')
                    }`}
                  </FormLabel>
                  <section className="grid grid-cols-6 gap-y-2 my-2">
                    {items
                      ?.filter((t) => t[keyForGrouping] === groupName)
                      .map((item: any) => {
                        return (
                          <FormField
                            key={item[keyForValue]}
                            control={form.control}
                            name={fieldName}
                            render={({ field }) => {
                              return (
                                <FormItem
                                  key={item[keyForValue]}
                                  className="inline-flex flex-row items-start space-x-3 space-y-1">
                                  <FormControl>
                                    <Checkbox
                                      checked={field.value?.includes(
                                        item[keyForValue]
                                      )}
                                      onCheckedChange={(checked: any) => {
                                        return checked
                                          ? field.onChange([
                                              ...field.value,
                                              item[keyForValue],
                                            ])
                                          : field.onChange(
                                              field.value?.filter(
                                                (value: any) =>
                                                  value !== item[keyForValue]
                                              )
                                            );
                                      }}
                                    />
                                  </FormControl>
                                  <FormLabel className="font-normal">
                                    {label && label(item)}
                                  </FormLabel>
                                </FormItem>
                              );
                            }}
                          />
                        );
                      })}
                  </section>
                </>
              );
            })}
          </div>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};
