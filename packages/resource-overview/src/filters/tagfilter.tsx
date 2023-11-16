import { MultiSelect, Select } from '@openstad-headless/ui/src';
import React, { useState } from 'react';
import DataStore from '../../../components/src/data-store';
import { BaseConfig } from '../../../generic-widget-types';

//Todo correctly type ideas. Will be possible when the datastore is correctly typed

export function TagFilter({
  multiple,
  dataStore,
  tagType,
  onUpdateFilter,
  ...props
}: {
  dataStore: DataStore;
  tagType: string;
  placeholder?: string;
  multiple?: boolean;
  onUpdateFilter?: (filter: Array<string>) => void;
} & BaseConfig) {
  // The useTags function should not need the  config and such anymore, because it should get that from the datastore object. Perhaps a rewrite of the hooks is needed
  const [tags, tagsError, tagsIsLoading] = dataStore.useTags({
    ...props,
    type: tagType,
  });

  const [selectedOptions, setSelected] = useState<string[]>([]);

  return multiple ? (
    <MultiSelect
      label={props.placeholder || ''}
      onItemSelected={(value) => {
        let selected = [...selectedOptions];

        if (selected.includes(value)) {
          selected = selected.filter((o) => o != value);
        } else {
          selected.push(value);
        }
        setSelected(selected);
        onUpdateFilter && onUpdateFilter(selected);
      }}
      options={(tags || []).map((tag) => ({
        value: tag.id,
        label: tag.name,
        checked: selectedOptions.includes(tag.id),
      }))}
    />
  ) : (
    <Select
      options={(tags || []).map((tag) => ({ value: tag.id, label: tag.name }))}
      onValueChange={(resource) => {
        onUpdateFilter && onUpdateFilter(resource === '' ? [] : [resource]);
      }}>
      {props.placeholder ? (
        <option value={''}>{props.placeholder}</option>
      ) : null}
    </Select>
  );
}
