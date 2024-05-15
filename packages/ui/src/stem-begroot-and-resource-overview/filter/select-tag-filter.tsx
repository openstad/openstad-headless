import { Select } from '@openstad-headless/ui/src';
import React, { forwardRef } from 'react';
import { FormLabel } from "@utrecht/component-library-react";


//Todo correctly type resources. Will be possible when the datastore is correctly typed

// Nasty but make datastore an any type so we can use it without needing an import from a different workspace 

type Props = {
  dataStore: any;
  tagType: string;
  placeholder?: string;
  onlyIncludeIds?: number[];
  onUpdateFilter?: (filter: string) => void;
  title: string;
};

type TagDefinition = { id: number; name: string };

const SelectTagFilter = forwardRef<HTMLSelectElement, Props>(
  (
    { onlyIncludeIds = [], dataStore, tagType, onUpdateFilter, ...props },
    ref
  ) => {
    // The useTags function should not need the  config and such anymore, because it should get that from the datastore object. Perhaps a rewrite of the hooks is needed

    const { data: tags } = dataStore.useTags({
      type: tagType,
      onlyIncludeIds,
    });

    if (!dataStore || !dataStore.useTags) {
      return <p>Cannot render tagfilter, missing data source</p>
    }

    return (
      <div className="form-element">
        <FormLabel htmlFor={props.placeholder}>{props.placeholder}</FormLabel>
        <Select
          id={props.placeholder}
          ref={ref}
          options={(tags || []).map((tag: TagDefinition) => ({
            value: tag.id,
            label: tag.name,
          }))}
          title={props.title}
          onValueChange={(value) => {
            onUpdateFilter && onUpdateFilter(value);
          }}>
          {props.placeholder ? (
            <option value={''}>{props.placeholder}</option>
          ) : null}
        </Select>
      </div>
    );
  }
);

export { SelectTagFilter };
