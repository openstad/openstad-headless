import React, { Fragment, useEffect } from 'react';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from './ui/form';

import _, { uniqueId } from 'lodash';
import { Checkbox } from './ui/checkbox';

type Props<T> = {
  form: any;
  fieldName: string;
  fieldLabel?: string;
  label?: (item: T) => string;
  items: Array<T>;
  selectedPredicate: (t: T) => boolean;
  onValueChange: (value: T, checked: boolean) => void;
  keyPerItem: (t:T) => string;
    keyForGrouping?: keyof T;
};

export const CheckboxList = <T extends { [key: string]: any }>({
  form,
  fieldName,
  fieldLabel,
  items,
  keyPerItem,
  selectedPredicate,
  onValueChange,
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
                key={keyPerItem(item)}
                control={form.control}
                name={fieldName}
                render={({ field }) => {
                  return (
                    <FormItem
                      key={`checkbox-${keyPerItem(item)}`}
                      className="flex space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={selectedPredicate(item)}
                          onCheckedChange={(checked: any) =>
                            onValueChange(item, checked)
                          }
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
                <Fragment key={`checklist-group-${groupName}`}>
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
                            key={keyPerItem(item)}
                            control={form.control}
                            name={fieldName}
                            render={({ field }) => {
                              return (
                                <FormItem
                                key={`checkbox-${keyPerItem(item)}`}
                                className="inline-flex flex-row items-start space-x-3 space-y-1">
                                  <FormControl>
                                    <Checkbox
                                      checked={selectedPredicate(item)}
                                      onCheckedChange={(checked: any) =>
                                        onValueChange(
                                          item,
                                          checked,
                                        )
                                      }
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
                </Fragment>
              );
            })}
          </div>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};
