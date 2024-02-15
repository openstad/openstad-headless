import { SecondaryButton, Select } from '@openstad-headless/ui/src';
import React, { useState, useEffect, useRef } from 'react';
import DataStore from '@openstad-headless/data-store/src';
import { useDebounce } from 'rooks';
import { MultiSelectTagFilter } from './multiselect-tag-filter';
import { SelectTagFilter } from './select-tag-filter';
import { StemBegrootWidgetProps } from '../../stem-begroot';
import './index.css';

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
  sorting: Array<{ value: string; label: string }>;
  defaultSorting?: string;
  itemsPerPage?: number;
} & StemBegrootWidgetProps;

export function Filters({
  resources,
  sorting = [],
  tagGroups = [],
  onUpdateFilter,
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
    <section id="stem-begroot-filter">
      <div className="osc-stem-begroot-filters">
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
                  />
                );
              }
            })}
          </>
        ) : null}

        <Select ref={sortingRef} onValueChange={setSort} options={sorting}>
          <option value={''}>Sorteer op</option>
        </Select>

        <SecondaryButton
          onClick={() => {
            const filterParent = document.querySelector('#stem-begroot-filter');

            const singleSelects:NodeListOf<HTMLSelectElement>| undefined =
              filterParent?.querySelectorAll(':scope select');
              const inputsInFilter:NodeListOf<HTMLInputElement>|undefined =
              filterParent?.querySelectorAll(':scope input');

              if(singleSelects) {
                singleSelects.forEach((s) => (s.selectedIndex = 0));
              }

              if(inputsInFilter) {
                inputsInFilter.forEach(i => i.value = '')
              }
            setSelected({});
            updateFilter(defaultFilter);
          }}>
          Wis alles
        </SecondaryButton>
      </div>
    </section>
  );
}
