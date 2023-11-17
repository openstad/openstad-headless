import { MultiSelect, Select } from '@openstad-headless/ui/src';
import React, { useState, forwardRef } from 'react';
import DataStore from '../../../components/src/data-store';
import { BaseConfig } from '../../../generic-widget-types';

//Todo correctly type ideas. Will be possible when the datastore is correctly typed

type Props = {
  dataStore: DataStore;
  tagType: string;
  placeholder?: string;
  onUpdateFilter?: (filter: string) => void;
} & BaseConfig;

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
        options={(tags || []).map((tag) => ({
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
