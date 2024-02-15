import { MultiSelect } from '@openstad-headless/ui/src';
import React from 'react';
import DataStore from '@openstad-headless/data-store/src';

//Todo correctly type resources. Will be possible when the datastore is correctly typed

type Props = {
  dataStore: typeof DataStore;
  tagType: string;
  placeholder?: string;
  selected?: number[];
  onUpdateFilter?: (filter: string) => void;
  onlyIncludeIds?: number[];
};

type TagDefinition = { id: number; name: string };

const MultiSelectTagFilter = ({
  dataStore,
  tagType,
  onUpdateFilter,
  selected = [],
  onlyIncludeIds = [],
  ...props
}: Props) => {
  // The useTags function should not need the  config and such anymore, because it should get that from the datastore object. Perhaps a rewrite of the hooks is needed
  const [tags] = dataStore.useTags({
    type: tagType,
    onlyIncludeIds,
  });

  return (
    <MultiSelect
      label={props.placeholder || ''}
      onItemSelected={(value) => {
        onUpdateFilter && onUpdateFilter(value);
      }}
      options={(tags || []).map((tag: TagDefinition) => ({
        value: tag.id,
        label: tag.name,
        checked: selected.includes(tag.id),
      }))}
    />
  );
};
export { MultiSelectTagFilter };
