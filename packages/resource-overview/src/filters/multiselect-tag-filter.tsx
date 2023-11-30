import { MultiSelect, Select } from '@openstad-headless/ui/src';
import React, { useState, forwardRef } from 'react';
import DataStore from '../../../components/src/data-store';
import { BaseConfig } from '../../../generic-widget-types';

//Todo correctly type resources. Will be possible when the datastore is correctly typed

type Props = {
  dataStore: DataStore;
  tagType: string;
  placeholder?: string;
  selected?: string[];
  onUpdateFilter?: (filter: string) => void;
} & BaseConfig;

const MultiSelectTagFilter = ({
  dataStore,
  tagType,
  onUpdateFilter,
  selected = [],
  ...props
}: Props) => {
  // The useTags function should not need the  config and such anymore, because it should get that from the datastore object. Perhaps a rewrite of the hooks is needed
  const [tags] = dataStore.useTags({
    ...props,
    type: tagType,
  });

  return (
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
  );
};
export { MultiSelectTagFilter };
