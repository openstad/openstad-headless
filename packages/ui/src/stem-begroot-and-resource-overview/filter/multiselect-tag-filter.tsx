import { MultiSelect } from '@openstad-headless/ui/src';
import React from 'react';
import DataStore from '@openstad-headless/data-store/src';
import { FormLabel } from "@utrecht/component-library-react";


//Todo correctly type resources. Will be possible when the datastore is correctly typed

// Nasty but make datastore an any type so we can use it without needing an import from a different workspace 
type Props = {
  dataStore:any;
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

  if(!dataStore || !dataStore.useTags) {
    return <p>Cannot render tagfilter, missing data source</p>
  }
  
  const {data:tags} = dataStore.useTags({
    type: tagType,
    onlyIncludeIds,
  });

  return (
    <div className="form-element">
      <FormLabel htmlFor={props.placeholder}>{props.placeholder}</FormLabel>
      <MultiSelect
        id={props.placeholder}
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
    </div>
  );
};
export { MultiSelectTagFilter };
