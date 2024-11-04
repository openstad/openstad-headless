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
    layout?: 'horizontal' | 'vertical';
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
                                                                   layout = 'horizontal'
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
          <section className={`grid gap-x-3 gap-y-4 flex-col my-4 content-start`}>
            <FormLabel>{fieldLabel}</FormLabel>
            <fieldset className="p-0 rounded grid grid-cols-1 space-y-1">
              <legend className="sr-only">{fieldLabel}</legend>
            <FormField
                control={form.control}
                name={fieldName}
                render={({ field }) => (
                    <FormItem className={`col-span-full ${layout === 'vertical' ? 'flex flex-col' : 'flex flex-row flex-wrap'}`}>
                        {items?.map((item: any) => (
                            <FormField
                                key={keyPerItem(item)}
                                control={form.control}
                                name={fieldName}
                                render={({ field }) => {
                                    return (
                                        <FormItem
                                            key={`checkbox-${keyPerItem(item)}`}
                                            className={`gap-x-0 gap-y-4 grid grid-cols-2 space-x-3 space-y-0 flex-col [grid-template-columns:min-content_auto]`}>
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
            </fieldset>
          </section>
        );
    }

    return (
        <FormField
            control={form.control}
            name={fieldName}
            render={({ field }) => (
                <FormItem className={`col-span-full flex flex-row flex-wrap`}>
                    <div className={`gap-x-4 gap-y-4 grid grid-cols-3`}>
                        {(groupNames || []).map((groupName, index) => {
                            return (
                                <Fragment key={`checklist-group-${groupName}`}>
                                    <section className={`grid gap-x-3 gap-y-4 flex-col my-4 content-start`}>
                                        <FormLabel className="font-normal">
                                            {`${
                                                groupName[0].toUpperCase() +
                                                (groupName.length > 1 ? groupName.slice(1) : '')
                                            }`}
                                        </FormLabel>
                                        <fieldset className="p-0 rounded grid grid-cols-1 space-y-1">
                                            <legend className="sr-only">{fieldLabel}</legend>
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
                                                                        className={`gap-x-0 gap-y-4 grid grid-cols-2 space-x-3 space-y-0 flex-col [grid-template-columns:min-content_auto]`}>
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
                                        </fieldset>
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
