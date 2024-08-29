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
    const randomId = Math.random().toString(36).substring(7);

    function getRandomId(placeholder: string | undefined) {
      if(placeholder && placeholder.length >= 1) {
      return placeholder.toLowerCase().replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, '-');
      } else {
      return randomId;
      }
    }
    return (
      tags.length > 0 && (
        <div className="form-element">
          <FormLabel htmlFor={getRandomId(props.placeholder)}>{props.placeholder|| 'Selecteer item'}</FormLabel>
          <Select
            id={getRandomId(props.placeholder)}
            ref={ref}
            options={(tags || []).map((tag: TagDefinition) => ({
              value: tag.id,
              label: tag.name,
            }))}
            title={props.title}
            onValueChange={(value) => {
              onUpdateFilter && onUpdateFilter(value);
            }}>
          </Select>
        </div>
      )
    );
  }
);

export { SelectTagFilter };
