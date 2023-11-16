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
  selected = [],
  ...props
}: {
  dataStore: DataStore;
  tagType: string;
  placeholder?: string;
  multiple?: boolean;
  selected?: string[];
  onUpdateFilter?: (filter: string) => void;
} & BaseConfig) {
  // The useTags function should not need the  config and such anymore, because it should get that from the datastore object. Perhaps a rewrite of the hooks is needed
  const [tags, tagsError, tagsIsLoading] = dataStore.useTags({
    ...props,
    type: tagType,
  });

  // Only for use when multiple is added

  return multiple ? (
    <MultiSelect
      label={props.placeholder || ''}
      onItemSelected={(value) => {
        onUpdateFilter && onUpdateFilter(value);
      }}
      options={(tags || []).map((tag) => ({
        value: tag.id,
        label: tag.name,
        checked: selected.includes(tag.id),
      }))}
    />
  ) : (
    <Select
      options={(tags || []).map((tag) => ({ value: tag.id, label: tag.name }))}
      onValueChange={(value) => {
        onUpdateFilter && onUpdateFilter(value);
      }}>
      {props.placeholder ? (
        <option value={''}>{props.placeholder}</option>
      ) : null}
    </Select>
  );
}
