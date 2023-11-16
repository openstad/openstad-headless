import { Input, SecondaryButton, Select } from '@openstad-headless/ui/src';
import React, { useState } from 'react';
import DataStore from '../../../components/src/data-store';
import { BaseConfig } from '../../../generic-widget-types';
import { TagFilter } from './tagfilter';
import { useDebounce } from 'rooks';

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
    { type: 'theme', placeholder: 'Selecteer een thema', multiple: true },
    { type: 'area', placeholder: 'Selecteer een gebied' },
  ],
  onUpdateFilter,
  ...props
}: {
  ideas: any;
  dataStore: DataStore;
  tagTypes?: Array<{ type: string; placeholder?: string; multiple?: boolean }>;
  onUpdateFilter?: (filter: Filter) => void;
} & BaseConfig) {
  const defaultFilter = { tags: {}, search: { text: '' } };
  tagTypes.forEach((tagType) => {
    defaultFilter.tags[tagType.type] = null;
  });

  const [filter, setFilter] = useState(defaultFilter);
  const [selectedOptions, setSelected] = useState<{}>({});

  function updateFilter(newFilter: Filter) {
    setFilter(newFilter);
    onUpdateFilter && onUpdateFilter(newFilter);
  }

  function setTags(type, values) {
    updateFilter({
      ...filter,
      tags: {
        ...filter.tags,
        [type]: values,
      },
    });
  }

  const search = useDebounce(setSearch, 300);

  function setSearch(value) {
    updateFilter({
      ...filter,
      search: {
        text: value,
      },
    });
  }

  return (
    <section>
      <div className="osc2-resource-overview-filters">
        <Input
          onChange={(e) => search(e.target.value)}
          className="osc2-resource-overview-search"
          placeholder="Zoeken"
        />

        {tagTypes.map((tagType) => (
          <TagFilter
            {...props}
            selected={selectedOptions[tagType.type] || []}
            multiple={tagType.multiple}
            dataStore={dataStore}
            tagType={tagType.type}
            placeholder={tagType.placeholder}
            onUpdateFilter={(updatedTag) => {
              const existingTags = selectedOptions[tagType.type];
              let selected = [...(existingTags || [])];

              if (updatedTag === '') {
                // Only a regular select kan return a "".
                // Remove the selection from the list
                selected = [];
              } else {
                if (selected.includes(updatedTag)) {
                  selected = selected.filter((o) => o != updatedTag);
                } else {
                  selected.push(updatedTag);
                }
              }

              setSelected({ ...selectedOptions, [tagType.type]: selected });
              setTags(tagType.type, selected);
            }}
          />
        ))}

        <Select
          options={[
            { label: 'Datum (nieuw-oud)', value: 'date-desc' },
            { label: 'Datum (oud-nieuw)', value: 'date-asc' },
          ]}>
          <option value={''}>Sorteer op</option>
        </Select>

        <SecondaryButton
          onClick={() => {
            setSelected({});
            updateFilter(defaultFilter);
            const selects = document.querySelectorAll(
              ':scope .osc2-resource-overview-filters select'
            );
            selects.forEach((select: any) => (select.selectedIndex = '0'));
          }}>
          Wis alles
        </SecondaryButton>
      </div>
    </section>
  );
}
