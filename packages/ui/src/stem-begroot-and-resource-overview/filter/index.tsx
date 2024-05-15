import { Input, SecondaryButton, Select } from '@openstad-headless/ui/src';
import React, { useState, useEffect, useRef } from 'react';
import { useDebounce } from 'rooks';
import { MultiSelectTagFilter } from './multiselect-tag-filter';
import { SelectTagFilter } from './select-tag-filter';
import './index.css';

import "@utrecht/component-library-css";
import "@utrecht/design-tokens/dist/root.css";
import { Button, FormLabel } from "@utrecht/component-library-react";

type Filter = {
  tags: Array<number>;
  search: { text: string };
  sort: string;
  page: number;
  pageSize: number;
};

type Props = {
  className?:string;
  dataStore: any;
  resources: any;
  onUpdateFilter?: (filter: Filter) => void;
  sorting: Array<{ value: string; label: string }>;
  displaySorting: boolean;
  defaultSorting: string;
  displaySearch: boolean;
  itemsPerPage?: number;
  displayTagFilters: boolean;
  tagGroups?: Array<{ type: string; label?: string; multiple: boolean }>;
  tagsLimitation?: Array<number>;
};

export function Filters({
  dataStore,
  resources,
  sorting = [],
  tagGroups = [],
  tagsLimitation = [],
  onUpdateFilter,
  className='',
  ...props
}: Props) {
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

  const search = useDebounce(setSearch, 300);

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
    const selected = [...(existingTags || [])];
    
    if (selected.includes(updatedTag)) {
      const index = selected.indexOf(updatedTag);
      selected.splice(index, 1);
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
      <div className={`osc-resources-filter ${className}`}>
        {props.displaySearch ? (
          <div className="form-element">
            <FormLabel htmlFor="search">Zoeken</FormLabel>
            <Input
              onChange={(e) => search(e.target.value)}
              className="osc-filter-search-bar"
              placeholder="Zoeken"
              id='search'
            />
          </div>
        ) : null}
        {props.displayTagFilters ? (
          <>
            {tagGroups.map((tagGroup, index) => {
              console.log(tagGroups)
              if (tagGroup.multiple) {
                return (
                  <MultiSelectTagFilter
                    key={`tag-select-${tagGroup.type}`}
                    selected={selectedOptions[tagGroup.type] || []}
                    dataStore={dataStore}
                    tagType={tagGroup.type}
                    placeholder={tagGroup.label}
                    onlyIncludeIds={tagsLimitation}
                    onUpdateFilter={(updatedTag) => {
                      updateTagListMultiple(tagGroup.type, updatedTag)
                    }}
                  />
                );
              } else {
                return (
                  <SelectTagFilter
                    key={`tag-select-${tagGroup}`}
                    {...props}
                    dataStore={dataStore}
                    tagType={tagGroup.type}
                    placeholder={tagGroup.label}
                    title={`Selecteer een item`}
                    onlyIncludeIds={tagsLimitation}
                    onUpdateFilter={(updatedTag) =>
                      updateTagListSingle(tagGroup.type, updatedTag)
                    }
                  />
                );
              }
            })}
          </>
        ) : null}

        {props.displaySorting ? (
          <div className="form-element">
            <FormLabel htmlFor={'sortField'}>Sorteer op</FormLabel>
            <Select onValueChange={setSort} options={sorting} id="sortField">
              <option value={''}>Sorteer op</option>
            </Select>
          </div>
        ) : null}

        <Button
          appearance='primary-action-button'
          onClick={() => {
            const filterParent = document.querySelector('#stem-begroot-filter');

            const singleSelects: NodeListOf<HTMLSelectElement> | undefined =
              filterParent?.querySelectorAll(':scope select');
            const inputsInFilter: NodeListOf<HTMLInputElement> | undefined =
              filterParent?.querySelectorAll(':scope input');

            if (singleSelects) {
              singleSelects.forEach((s) => (s.selectedIndex = 0));
            }

            if (inputsInFilter) {
              inputsInFilter.forEach((i) => (i.value = ''));
            }
            setSelected({});
            updateFilter(defaultFilter);
          }}>
          Wis alles
        </Button>
      </div>
    </section>
  );
}
