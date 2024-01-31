import { Select } from '@openstad-headless/ui/src';
import React, { forwardRef } from 'react';
import DataStore from '@openstad-headless/data-store/src';
import { BaseProps } from '../../../types/base-props';

//Todo correctly type resources. Will be possible when the datastore is correctly typed

type Props = {
  dataStore: typeof DataStore;
  tagType: string;
  placeholder?: string;
  onUpdateFilter?: (filter: string) => void;
} & BaseProps;

const SelectTagFilter = forwardRef<HTMLSelectElement, Props>(
  ({ dataStore, tagType, onUpdateFilter, ...props }, ref) => {
    // The useTags function should not need the  config and such anymore, because it should get that from the datastore object. Perhaps a rewrite of the hooks is needed
    const [tags] = dataStore.useTags({
      ...props,
      type: tagType,
    });

    return (
      <Select
        ref={ref}
        options={(tags || []).map((tag: { id: string; name: string }) => ({
          value: tag.id,
          label: tag.name,
        }))}
        onValueChange={(value) => {
          onUpdateFilter && onUpdateFilter(value);
        }}>
        {props.placeholder ? (
          <option value={''}>{props.placeholder}</option>
        ) : null}
      </Select>
    );
  }
);

export { SelectTagFilter };
