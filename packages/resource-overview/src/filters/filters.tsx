import { Input, SecondaryButton, Select } from '@openstad-headless/ui/src';
import React, { useState, useEffect, useRef, createRef } from 'react';
import DataStore from '@openstad-headless/data-store/src';
import { useDebounce } from 'rooks';
import { MultiSelectTagFilter } from './multiselect-tag-filter';
import { SelectTagFilter } from './select-tag-filter';
import { ResourceOverviewWidgetProps } from '../resource-overview';


type Filter = {
  tags: Array<number>;
  search: { text: string };
  sort: string;
  page: number;
  pageSize: number;
};

type Props = {
  resources: any;
  onUpdateFilter?: (filter: Filter) => void;
  tagsLimitation?: number[];
} & ResourceOverviewWidgetProps;

export function Filters({
  resources,
  sorting = [],
  tagGroups = [],
  onUpdateFilter,
  tagsLimitation = [],
  ...props
}: Props) {
  const dataStore = new DataStore({
    projectId: props.projectId,
    api: props.api,
  });

  const defaultFilter: Filter = {
    tags: [],
    search: { text: '' },
    sort: props.defaultSorting || 'createdAt_desc',
    page: 0,
    pageSize: props.itemsPerPage || 20,
  };

  const [tagState, setTagState] = useState<{ [key: string]: Array<number> }>();
  const [filter, setFilter] = useState<Filter>(defaultFilter);
  const [selectedOptions, setSelected] = useState<{ [key: string]: any }>({});

  // Standard and dynamic refs used for resetting
  const searchRef = useRef<HTMLInputElement>(null);
  const sortingRef = useRef<HTMLSelectElement>(null);
  const search = useDebounce(setSearch, 300);

  // These dynamic refs are only applicable on single item selects <select>
  // The multiselect is a controlled custom component and is managed by the this component
  const [elRefs, setElRefs] = React.useState<
    React.RefObject<HTMLSelectElement>[]
  >([]);

  useEffect(() => {
    // add or remove refs
    setElRefs((elRefs) =>
      Array(tagGroups.length)
        .fill(undefined)
        .map((_, i) => elRefs[i] || createRef<HTMLSelectElement>())
    );
  }, [tagGroups]);

  useEffect(() => {
    if (sortingRef.current && props.defaultSorting) {
      const index = sorting.findIndex((s) => s.value === props.defaultSorting);
      if (index > -1) {
        // + 1 for the placeholder option
        sortingRef.current.selectedIndex = index + 1;
      }
    }
  }, []);


  function updateFilter(newFilter: Filter) {
    setFilter(newFilter);
    onUpdateFilter && onUpdateFilter(newFilter);
  }

  function setTags(type: string, values: any[]) {
    setTagState({ ...tagState, [type]: values });
  }

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

  const updateTagListMultiple = (tagType: string, updatedTag: string) => {
    const existingTags = selectedOptions[tagType];
    let selected = [...(existingTags || [])];

    if (selected.includes(updatedTag)) {
      selected = selected.filter((o) => o != updatedTag);
    } else {
      selected.push(updatedTag);
    }

    setSelected({ ...selectedOptions, [tagType]: selected });
    setTags(tagType, selected);
  };

  const updateTagListSingle = (tagType: string, updatedTag: string) => {
    const existingTags = selectedOptions[tagType];
    let selected = [...(existingTags || [])];

    if (updatedTag === '') {
      selected = [];
    } else {
      selected = [updatedTag];
    }
    setSelected({ ...selectedOptions, [tagType]: selected });
    setTags(tagType, selected);
  };

  useEffect(() => {
    if (tagState) {
      const tags = Object.values(tagState).flat();
      updateFilter({
        ...filter,
        tags,
      });
    }
  }, [tagState]);

  return (
    <section>
      <div className="osc-resource-overview-filters">
        {props.displaySearch ? (
          <Input
            ref={searchRef}
            onChange={(e) => search(e.target.value)}
            className="osc-resource-overview-search"
            placeholder="Zoeken"
          />
        ) : null}

        {props.displayTagFilters ? (
          <>
            {tagGroups.map((tagGroup, index) => {
              if (tagGroup.multiple) {
                return (
                  <MultiSelectTagFilter
                    key={`tag-select-${tagGroup.type}`}
                    {...props}
                    selected={selectedOptions[tagGroup.type] || []}
                    dataStore={dataStore}
                    tagType={tagGroup.type}
                    placeholder={tagGroup.label}
                    onUpdateFilter={(updatedTag) =>
                      updateTagListMultiple(tagGroup.type, updatedTag)
                    }
                    onlyIncludeIds={tagsLimitation}
                  />
                );
              } else {
                return (
                  <SelectTagFilter
                    ref={elRefs[index]}
                    key={`tag-select-${tagGroup}`}
                    {...props}
                    dataStore={dataStore}
                    tagType={tagGroup.type}
                    placeholder={tagGroup.label}
                    onUpdateFilter={(updatedTag) =>
                      updateTagListSingle(tagGroup.type, updatedTag)
                    }
                    onlyIncludeIds={tagsLimitation}
                  />
                );
              }
            })}
          </>
        ) : null}

        {props.displaySorting ? (
          <Select ref={sortingRef} onValueChange={setSort} options={sorting}>
            <option value={''}>Sorteer op</option>
          </Select>
        ) : null}

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
