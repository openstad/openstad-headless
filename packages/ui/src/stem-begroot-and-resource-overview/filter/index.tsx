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
import PostcodeAutoFill from "../../location";
type Filter = {
  tags: Array<number>;
  search: { text: string };
  sort: string;
  page: number;
  pageSize: number;
  location: PostcodeAutoFillLocation;
};

export type PostcodeAutoFillLocation = {
  lat: string;
  lng: string;
  proximity?: number;
} | undefined;

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
  tagGroups?: Array<{ type: string; label?: string; multiple: boolean; projectId?: any }>;
  tagsLimitation?: Array<number>;
  searchPlaceholder: string;
  resetText: string;
  applyText: string;
  showActiveTags?: boolean;
  preFilterTags?: Array<number>;
  displayLocationFilter?: boolean;
  displayCollapsibleFilter?: boolean;
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
  preFilterTags = undefined,
  displayCollapsibleFilter = false,
  ...props
}: Props) {
  const defaultFilter: Filter = {
    tags: [],
    search: { text: '' },
    sort: props.defaultSorting || 'createdAt_desc',
    page: 0,
    pageSize: props.itemsPerPage || 20,
    location: undefined,
  };

  const [tagState, setTagState] = useState<{ [key: string]: Array<number> }>();
  const [filter, setFilter] = useState<Filter>(defaultFilter);
  const [selectedOptions, setSelected] = useState<{ [key: string]: any }>({});
  const [newActiveTagsDraft, setNewActiveTagsDraft] = useState<Array<{ type: string; id: number; label: string }>>([]);
  const [activeTags, setActiveTags] = useState<Array<{ type: string; id: number; label: string }>>([]);
  const [stopUsingDefaultValue, setStopUsingDefaultValue] = useState<boolean>(false);
  const [tagsReadyForParameter, setTagsReadyForParameter] = useState<Array<string | number>>([]);
  const [filtersVisible, setFiltersVisible] = useState<boolean>(false);

  const search = useDebounce(setSearch, 300);

  function updateFilter(newFilter: Filter) {
    setFilter(newFilter);

    const tags = newFilter?.tags || [];

    setTagsReadyForParameter(tags);
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

  function setLocation(location: PostcodeAutoFillLocation) {
    updateFilter({
      ...filter,
      location: location,
    });
  }

  const updateParameter = () => {
    const url = new URL(window.location.href);

    if (tagsReadyForParameter.length > 0) {
      const tagString = tagsReadyForParameter.join(',');
      url.searchParams.set('tagIds', tagString);
    } else {
      url.searchParams.delete('tagIds');
    }

    window.history.replaceState(null, '', url);
  }

  const updateTagListMultiple = (tagType: string, updatedTag: number, updatedLabel: string, forceSelected?: boolean) => {
    setSelected((prevSelectedOptions) => {
      const existingTags = prevSelectedOptions[tagType] || [];
      const selected = [...(existingTags || [])];

      if (selected.includes(updatedTag)) {
        if (!forceSelected) {
          const index = selected.indexOf(updatedTag);
          selected.splice(index, 1);
        }
      } else {
        selected.push(updatedTag);
      }

      setTags(tagType, selected);

      return { ...prevSelectedOptions, [tagType]: selected };
    });

    setNewActiveTagsDraft((prevSelectedOptions) => {
      const selectedDraft: { type: string, id: number, label: string }[] = [...(prevSelectedOptions || [])];
      const tagIndex = selectedDraft.findIndex((tag: { type: string, id: number, label: string }) => tag.id === updatedTag);

      if (tagIndex !== -1) {
        if (!forceSelected) {
          selectedDraft.splice(tagIndex, 1);
        }
      } else {
        const label = updatedLabel || '';
        selectedDraft.push({ id: updatedTag, label: label, type: tagType });
      }

      if (forceSelected) {
        setActiveTags(selectedDraft)
      }

      return selectedDraft;
    });
  };

  const updateTagListSingle = (tagType: string, updatedTag: string, updatedLabel?: string) => {
    const existingTags = selectedOptions[tagType];
    let selected = [...(existingTags || [])];

    if (updatedTag === '') {
      selected = [];

      setNewActiveTagsDraft((prevSelectedOptions) => {
        return (prevSelectedOptions || []).filter(tag => tag.type !== tagType);
      })
    } else {
      selected = [updatedTag];

      setNewActiveTagsDraft((prevSelectedOptions) => {
        const filtered = (prevSelectedOptions || []).filter(tag => tag.type !== tagType);
        const label = updatedLabel || '';
        return [...filtered, { id: Number(updatedTag), label: label, type: tagType }];
      })
    }

    setSelected({ ...selectedOptions, [tagType]: selected });
    setTags(tagType, selected);
  }

  function removeActiveTag(tagType: string, tagId: number) {
    const updatedTags = newActiveTagsDraft.filter(tag => !(tag.type === tagType && tag.id === tagId));
    setNewActiveTagsDraft(updatedTags);

    const updatedSelectedOptions = {
      ...selectedOptions,
      [tagType]: Array.isArray(selectedOptions[tagType])
        ? (selectedOptions[tagType] || []).filter((id: number | string) => {
          const isMatch = (typeof id === 'number' ? id === tagId : Number(id) === tagId);
          return !isMatch;
        })
        : [],
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
    setStopUsingDefaultValue(true);
    if (e && e.preventDefault) e.preventDefault();
    const filterToSubmit = updatedFilter || filter;
    console.log("filterToSubmit", updatedFilter, filter);
    updateFilter(filterToSubmit);
    onUpdateFilter && onUpdateFilter(filterToSubmit);

    console.log("newActiveTagsDraft", newActiveTagsDraft);
    console.log("updatedTags", updatedTags);

    if (updatedTags) {
      setActiveTags(updatedTags);
    } else {
      setActiveTags(newActiveTagsDraft);
    }

    updateParameter();
  };

  const sortOptionsOrder = ['createdAt_desc', 'createdAt_asc', 'title_asc', 'title_desc', 'votes_desc', 'votes_asc'];
  sorting = sorting?.sort((a, b) => {
    const indexA = sortOptionsOrder.indexOf(a.value);
    const indexB = sortOptionsOrder.indexOf(b.value);
    return indexA - indexB;
  });

  const filterGroup = () => {
    return (
      <>
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
                    onlyIncludeIds={[]}
                    onUpdateFilter={(updatedTag, updatedLabel, forceSelected) => {
                      updateTagListMultiple(tagGroup.type, updatedTag, updatedLabel || '', forceSelected || false);
                    }}
                    tagGroupProjectId={tagGroup.projectId || ''}
                    preFilterTags={preFilterTags}
                    parentStopUsingDefaultValue={stopUsingDefaultValue}
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
                    onlyIncludeIds={[]}
                    onUpdateFilter={(updatedTag, updatedLabel) =>
                      updateTagListSingle(tagGroup.type, updatedTag, updatedLabel)
                    }
                    tagGroupProjectId={tagGroup.projectId || ''}
                    preFilterTags={preFilterTags}
                    parentStopUsingDefaultValue={stopUsingDefaultValue}
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

        {props.displayLocationFilter ? (
          <PostcodeAutoFill
            onValueChange={setLocation}
            locationDefault={filter.location}
            {...props}
          />
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
              setStopUsingDefaultValue(true);
              setSelected({});
              setNewActiveTagsDraft([]);
              setActiveTags([]);
              updateFilter(defaultFilter);
              setTagState({});
              onUpdateFilter && onUpdateFilter(defaultFilter);
              updateParameter();
              setLocation(undefined);
            }}
            test-id={"filter-reset-button"}
          >
            {props.resetText}
          </Button>
          <Button type='submit' appearance='primary-action-button' test-id={"filter-apply-button"}>{props.applyText}</Button>
        </div>
      </>
    )
  }

  return !(props.displayTagFilters || props.displaySearch || props.displaySorting || props.displayLocationFilter) ? null : (
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
        {(props.displaySearch && displayCollapsibleFilter) ? (
          <button type='submit' className="apply-filters-button">
            <span className="filter-icon"></span>
            <span className="sr-only">Filters toepassen</span>
          </button>
        ) : null}

        {displayCollapsibleFilter ? (
          <>
            <Button className="toggle-filters-button" type="button" aria-expanded={filtersVisible ? 'true' : 'false'} aria-controls="filters-container" onClick={(e) => { setFiltersVisible(!filtersVisible) }}>
              <span className="filter-icon"></span>
              <span className="sr-only">Filters uitklappen</span>
            </Button>
            <div id="filters-container" className={`filters-container ${displayCollapsibleFilter ? '--collapsable' : ''}`} aria-hidden={!filtersVisible ? 'true' : 'false'}>
              <div className="filters-wrapper">
                <button className="close-filters-button" type="button" onClick={(e) => { setFiltersVisible(false) }}>
                  <span className="close-icon"></span>
                  <span className="sr-only">Sluit filters</span>
                </button>
                <div className="filters-content">
                  {filterGroup()}
                </div>
              </div>
            </div>
          </>
        ) : (
          filterGroup()
        )}



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
