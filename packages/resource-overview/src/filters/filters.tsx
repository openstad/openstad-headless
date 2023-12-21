import { Input, SecondaryButton, Select } from '@openstad-headless/ui/src';
import React, { useState, useEffect, useRef, createRef } from 'react';
import DataStore from '../../../components/src/data-store';
import { BaseProps } from '../../../types/base-props';
import { useDebounce } from 'rooks';
import { MultiSelectTagFilter } from './multiselect-tag-filter';
import { SelectTagFilter } from './select-tag-filter';

//Todo correctly type resources. Will be possible when the datastore is correctly typed

type Filter = {
  tags: {};
  search: {
    text: string;
  };
  sort: string;
};

type Props = {
  resources: any;
  dataStore: DataStore;
  sortOptions?: Array<{ value: string; label: string }>;
  tagTypes?: Array<{ type: string; placeholder?: string; multiple?: boolean }>;
  onUpdateFilter?: (filter: Filter) => void;
} & BaseProps;

export function Filters({
  resources,
  dataStore,
  tagTypes = [
    { type: 'theme', placeholder: 'Selecteer een thema', multiple: true },
    { type: 'area', placeholder: 'Selecteer een gebied' },
  ],
  sortOptions = [
    { value: 'title', label: 'Titel' },
    { value: 'createdAt_desc', label: 'Nieuwste eerst' },
    { value: 'createdAt_asc', label: 'Oudste eerst' },
  ],
  onUpdateFilter,
  ...props
}: Props) {
  const defaultFilter = { tags: {}, search: { text: '' }, sort: '' };
  tagTypes.forEach((tagType) => {
    defaultFilter.tags[tagType.type] = null;
  });

  const [filter, setFilter] = useState(defaultFilter);
  const [selectedOptions, setSelected] = useState<{}>({});

  // Standard and dynamic refs used for resetting
  const searchRef = useRef<HTMLInputElement>(null);
  const sortingRef = useRef<HTMLSelectElement>(null);

  // These dynamic refs are only applicable on single item selects <select>
  // The multiselect is a controlled custom component and is managed by the this component
  const [elRefs, setElRefs] = React.useState<
    React.RefObject<HTMLSelectElement>[]
  >([]);

  useEffect(() => {
    // add or remove refs
    setElRefs((elRefs) =>
      Array(tagTypes.length)
        .fill(undefined)
        .map((_, i) => elRefs[i] || createRef<HTMLSelectElement>())
    );
  }, [tagTypes]);

  function updateFilter(newFilter: Filter) {
    setFilter(newFilter);
    onUpdateFilter && onUpdateFilter(newFilter);
  }

  function setTags(type: string, values: any[]) {
    updateFilter({
      ...filter,
      tags: {
        ...filter.tags,
        [type]: values,
      },
    });
  }

  const search = useDebounce(setSearch, 300);

  function setSearch(value: string) {
    updateFilter({
      ...filter,
      search: {
        text: value,
      },
    });
  }

  function setSort(value: string) {
    updateFilter({
      ...filter,
      sort: value,
    });
  }

  const updateTagList = (tagType: string, updatedTag: string) => {
    const existingTags = selectedOptions[tagType];
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

    setSelected({ ...selectedOptions, [tagType]: selected });
    setTags(tagType, selected);
  };

  return (
    <section>
      <div className="osc-resource-overview-filters">
        <Input
          ref={searchRef}
          onChange={(e) => search(e.target.value)}
          className="osc-resource-overview-search"
          placeholder="Zoeken"
        />

        {tagTypes.map((tagType, index) => {
          if (tagType.multiple) {
            return (
              <MultiSelectTagFilter
                key={`tag-select-${tagType.type}`}
                {...props}
                selected={selectedOptions[tagType.type] || []}
                dataStore={dataStore}
                tagType={tagType.type}
                placeholder={tagType.placeholder}
                onUpdateFilter={(updatedTag) =>
                  updateTagList(tagType.type, updatedTag)
                }
              />
            );
          } else {
            return (
              <SelectTagFilter
                ref={elRefs[index]}
                key={`tag-select-${tagType.type}`}
                {...props}
                dataStore={dataStore}
                tagType={tagType.type}
                placeholder={tagType.placeholder}
                onUpdateFilter={(updatedTag) =>
                  updateTagList(tagType.type, updatedTag)
                }
              />
            );
          }
        })}

        <Select ref={sortingRef} onValueChange={setSort} options={sortOptions}>
          <option value={''}>Sorteer op</option>
        </Select>

        <SecondaryButton
          onClick={() => {
            if (searchRef.current) {
              searchRef.current.value = '';
            }

            if (sortingRef.current) {
              sortingRef.current.selectedIndex = 0;
            }

            elRefs.forEach((ref) => {
              if (ref.current?.selectedIndex) {
                ref.current.selectedIndex = 0;
              }
            });

            setSelected({});
            updateFilter(defaultFilter);
          }}>
          Wis alles
        </SecondaryButton>
      </div>
    </section>
  );
}
