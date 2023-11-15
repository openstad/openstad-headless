import { SecondaryButton, Select } from '@openstad-headless/ui/src';
import React, { useState } from 'react';
import DataStore from '../../../components/src/data-store';
import { BaseConfig } from '../../../generic-widget-types';
import { TagFilter } from './tagfilter';

//Todo correctly type ideas. Will be possible when the datastore is correctly typed

type Filter = {
  tags: {};
  search: {
    text: string;
  };
};

export function Filters({
  ideas,
  dataStore,
  tagTypes = [
    { type: 'theme', placeholder: 'Selecteer een thema' },
    { type: 'area', placeholder: 'Selecteer een gebied' },
  ],
  onUpdateFilter,
  ...props
}: {
  ideas: any;
  dataStore: DataStore;
  tagTypes?: Array<{ type: string; placeholder?: string }>;
  onUpdateFilter?: (filter: Filter) => void;
} & BaseConfig) {
  const defaultFilter = { tags: {}, search: { text: '' } };
  tagTypes.forEach((tagType) => {
    defaultFilter.tags[tagType.type] = null;
  });

  const [filter, setFilter] = useState(defaultFilter);

  function updateFilter(newFilter: Filter) {
    setFilter(newFilter);
    onUpdateFilter && onUpdateFilter(newFilter);
  }

  function setTags(type, values) {
    let newFilter = {
      ...filter,
      tags: {
        ...filter.tags,
        [type]: values,
      },
    };
    updateFilter(newFilter);
  }

  function setSearch(value) {
    let newFilter = {
      ...filter,
      search: {
        text: value,
      },
    };
    updateFilter(newFilter);
  }

  return (
    <section>
      <div className="osc2-resource-overview-filters">
        {tagTypes.map((tagType) => (
          <TagFilter
            {...props}
            dataStore={dataStore}
            tagType={tagType.type}
            placeholder={tagType.placeholder}
            onUpdateFilter={(updatedTags) => {
              setTags(tagType.type, updatedTags);
            }}
          />
        ))}

        <SecondaryButton>Wis alles</SecondaryButton>
      </div>
    </section>
  );
}
