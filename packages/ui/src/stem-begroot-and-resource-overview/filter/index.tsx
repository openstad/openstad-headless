import { Input, SecondaryButton, Select } from '@openstad-headless/ui/src';
import React, { useState, useEffect, useRef } from 'react';
import { useDebounce } from 'rooks';
import { MultiSelectTagFilter } from './multiselect-tag-filter';
import { SelectTagFilter } from './select-tag-filter';
import './index.css';

import "@utrecht/component-library-css";
import "@utrecht/design-tokens/dist/root.css";
import { Button, FormLabel } from "@utrecht/component-library-react";
import { IconButton } from '@openstad-headless/ui/src';
type Filter = {
  tags: Array<number>;
  search: { text: string };
  sort: string;
  page: number;
  pageSize: number;
};

type Props = {
  className?: string;
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
  searchPlaceholder: string;
  resetText: string;
  applyText: string;
  showActiveTags?: boolean;
};

export function Filters({
  dataStore,
  resources,
  sorting = [],
  tagGroups = [],
  tagsLimitation = [],
  onUpdateFilter,
  className = '',
  showActiveTags = false,
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
  const [newActiveTagsDraft, setNewActiveTagsDraft] = useState<Array<{ type: string; id: number; label: string }>>([]);
  const [activeTags, setActiveTags] = useState<Array<{ type: string; id: number; label: string }>>([]);

  const search = useDebounce(setSearch, 300);

  function updateFilter(newFilter: Filter) {
    setFilter(newFilter);
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

  const updateTagListMultiple = (tagType: string, updatedTag: number, updatedLabel?: string) => {
    const existingTags = selectedOptions[tagType];
    const selectedDraft: { type?: string, id: number, label?: string }[] = [...(newActiveTagsDraft || [])];
    const selected = [...(existingTags || [])];

    const tagIndex = selectedDraft.findIndex((tag: { type?: string, id: number, label?: string }) => tag.id === updatedTag);

    if (tagIndex !== -1) {
      selectedDraft.splice(tagIndex, 1);
    } else {
      selectedDraft.push({ id: updatedTag, label: updatedLabel, type: tagType });
    }

    if (selected.includes(updatedTag)) {
      const index = selected.indexOf(updatedTag);
      selected.splice(index, 1);
    } else {
      selected.push(updatedTag);
    }

    setSelected({ ...selectedOptions, [tagType]: selected });
    setTags(tagType, selected);

    // @ts-ignore
    setNewActiveTagsDraft(selectedDraft);
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
  }

  function removeActiveTag(tagType: string, tagId: number) {
    const updatedTags = newActiveTagsDraft.filter(tag => !(tag.type === tagType && tag.id === tagId));
    setNewActiveTagsDraft(updatedTags);

    const updatedSelectedOptions = {
      ...selectedOptions,
      [tagType]: (selectedOptions[tagType] || []).filter((id: number) => id !== tagId),
    };
    setSelected(updatedSelectedOptions);
    setTags(tagType, updatedSelectedOptions[tagType]);

    const updatedFilter = {
      ...filter,
      tags: Object.values(updatedSelectedOptions).flat()
    };

    setFilter(updatedFilter);
    handleSubmit('', updatedFilter, updatedTags);
  }

  useEffect(() => {
    if (tagState) {
      const tags = Object.values(tagState).flat();
      updateFilter({
        ...filter,
        tags,
      });
    }
  }, [tagState]);

  const handleSubmit = (e?: any, updatedFilter?: Filter, updatedTags?: any) => {
    if (e && e.preventDefault) e.preventDefault();
    const filterToSubmit = updatedFilter || filter;
    updateFilter(filterToSubmit);
    onUpdateFilter && onUpdateFilter(filterToSubmit);

    if (updatedTags) {
      setActiveTags(updatedTags);
    } else {
      setActiveTags(newActiveTagsDraft);
    }
  };

  return (
    <section id="stem-begroot-filter">
      <form className={`osc-resources-filter ${className}`} onSubmit={handleSubmit}>
        {props.displaySearch ? (
          <div className="form-element">
            <FormLabel htmlFor="search">Zoeken</FormLabel>
            <Input
              onChange={(e) => search(e.target.value)}
              className="osc-filter-search-bar"
              placeholder={props.searchPlaceholder}
              id='search'
            />
          </div>
        ) : null}
        {(props.displayTagFilters && tagGroups && Array.isArray(tagGroups) && tagGroups.length > 0) ? (
          <>
            {tagGroups.map((tagGroup, index) => {
              if (tagGroup.multiple) {
                return (
                  <MultiSelectTagFilter
                    key={`tag-select-${tagGroup.type}`}
                    selected={selectedOptions[tagGroup.type] || []}
                    dataStore={dataStore}
                    tagType={tagGroup.type}
                    placeholder={tagGroup.label}
                    onlyIncludeIds={tagsLimitation}
                    onUpdateFilter={(updatedTag, updatedLabel) => {
                      updateTagListMultiple(tagGroup.type, updatedTag, updatedLabel);
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
            <Select
              onValueChange={setSort}
              options={sorting}
              id="sortField"
              defaultValue={props.defaultSorting || 'createdAt_desc'}
              disableDefaultOption={true}
            />
          </div>
        ) : null}


        <div className='button-group'>
          <Button
            appearance='secondary-action-button'
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
              setNewActiveTagsDraft([]);
              setActiveTags([]);
              updateFilter(defaultFilter)
              onUpdateFilter && onUpdateFilter(defaultFilter);
            }}>
            {props.resetText}
          </Button>
          <Button type='submit' appearance='primary-action-button'>{props.applyText}</Button>
        </div>
      </form>

      {(activeTags.length > 0 && showActiveTags) && (
        <div className="active-tags">
          <ul>
            {activeTags.map(tag => (
              <li key={`${tag.type}-${tag.id}`} className={tag.type} role="status">
                {tag.label}
                <IconButton
                  onClick={() => removeActiveTag(tag.type, tag.id)}
                  className="subtle-button"
                  icon="ri-close-line"
                  iconOnly={true}
                  text='Filter verwijderen'
                />
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
