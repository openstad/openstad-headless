import { MultiSelect } from '@openstad-headless/ui/src';
import React from 'react';
import DataStore from '../../../components/src/data-store';
import { BaseProps } from '../../../types/base-props';

//Todo correctly type resources. Will be possible when the datastore is correctly typed

type Props = {
  dataStore: DataStore;
  tagType: string;
  placeholder?: string;
  selected?: string[];
  onUpdateFilter?: (filter: string) => void;
} & BaseProps;

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
      options={(tags || []).map((tag: { id: string; name: string }) => ({
        value: tag.id,
        label: tag.name,
        checked: selected.includes(tag.id),
      }))}
    />
  );
};
export { MultiSelectTagFilter };
