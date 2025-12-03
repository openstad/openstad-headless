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
  autoApply?: boolean;
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
  autoApply = false,
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
  const [activeFilter, setActiveFilter] = useState<Filter>(defaultFilter);
  const [searchValue, setSearchValue] = useState<string>('');
  const [sortValue, setSortValue] = useState<string>(props.defaultSorting || 'createdAt_desc');
  const [locationValue, setLocationValue] = useState<PostcodeAutoFillLocation>(undefined);

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
    const newFilter = {
      ...filter,
      search: {
        text: value,
      },
    };
    updateFilter(newFilter);

    if (autoApply) {
      handleSubmit(undefined, newFilter, activeTags);
    }
  }

  function setSort(value: string) {
    setSortValue(value);
    updateFilter({
      ...filter,
      sort: value,
    });
    if (autoApply) {
      handleSubmit(undefined, { ...filter, sort: value }, activeTags);
    }
  }

  function setLocation(location: PostcodeAutoFillLocation) {
    setLocationValue(location);
    updateFilter({
      ...filter,
      location: location,
    });
    if (autoApply) {
      handleSubmit(undefined, { ...filter, location }, activeTags);
    }
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
    let selectedTags;
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
      selectedTags = { ...prevSelectedOptions, [tagType]: selected };

      return selectedTags;
    });

    let draftTags;
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

      draftTags = selectedDraft;
      return draftTags;
    });

    if (autoApply) {
      const newTags = Object.values(selectedTags || {}).flat().map(Number);
      const newFilter = { ...filter, tags: newTags };
      handleSubmit(undefined, newFilter, draftTags);
    }
  };

  const updateTagListSingle = (tagType: string, updatedTag: string, updatedLabel?: string) => {
    const existingTags = selectedOptions[tagType];
    let selected = [...(existingTags || [])];

    let draftTags;
    if (updatedTag === '') {
      selected = [];

      draftTags = (newActiveTagsDraft || []).filter(tag => tag.type !== tagType);
      setNewActiveTagsDraft(draftTags);
    } else {
      selected = [updatedTag];

      const filtered = (newActiveTagsDraft || []).filter(tag => tag.type !== tagType);
      const label = updatedLabel || '';
      draftTags = [...filtered, { id: Number(updatedTag), label: label, type: tagType }];
      setNewActiveTagsDraft(draftTags);
    }

    const selectedTags = { ...selectedOptions, [tagType]: selected };
    setSelected(selectedTags);
    setTags(tagType, selected);

    if (autoApply) {
      const newTags = Object.values(selectedTags || {}).flat().map(Number);
      const newFilter = { ...filter, tags: newTags };
      handleSubmit(undefined, newFilter, draftTags);
    }
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
      const newFilter = { ...filter, tags };
      updateFilter(newFilter);

      if (autoApply) {
        handleSubmit(undefined, newFilter, newActiveTagsDraft);
      }
    }
  }, [tagState, autoApply, newActiveTagsDraft]);

  const handleSubmit = (e?: any, updatedFilter?: Filter, updatedTags?: any) => {
    setStopUsingDefaultValue(true);
    if (e && e.preventDefault) e.preventDefault();
    const filterToSubmit = updatedFilter || filter;
    updateFilter(filterToSubmit);
    onUpdateFilter && onUpdateFilter(filterToSubmit);
    setActiveFilter(filterToSubmit);

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

  return !(props.displayTagFilters || props.displaySearch || props.displaySorting || props.displayLocationFilter) ? null : (
    <section id="stem-begroot-filter">
      <form className={`osc-resources-filter ${className}`} onSubmit={!autoApply ? handleSubmit : undefined}>
        {props.displaySearch ? (
          <div className="form-element">
            <FormLabel htmlFor="search">Zoeken</FormLabel>
            <Input
              value={searchValue}
              onChange={(e) => {
                setSearchValue(e.target.value);
                search(e.target.value);
              }}
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
              value={sortValue}
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
              setSearchValue('');
              setSearch('');
              setSortValue(props.defaultSorting || 'createdAt_desc');
              setLocationValue(undefined);
              updateFilter(defaultFilter);
              setTagState({});
              onUpdateFilter && onUpdateFilter(defaultFilter);
              updateParameter();
              setLocation(undefined);
              handleSubmit(undefined, defaultFilter, []);
            }}
            test-id={"filter-reset-button"}
          >
            {props.resetText}
          </Button>
          {!autoApply && (
            <Button type='submit' appearance='primary-action-button' test-id={"filter-apply-button"}>{props.applyText}</Button>
          )}
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

      {activeFilter && (
        <div id="filter-status" aria-live="polite" className="--sr-only">
          <>
            <p>Huidige filterinstellingen:</p>

            {props.displaySearch && (
              <p>Zoekterm: {activeFilter.search.text || 'geen'}</p>
            )}
            {props.displaySorting && (() => {
              const sortLabel = sorting.find(sort => sort.value === activeFilter.sort)?.label || activeFilter.sort;
              return <p>Sorteer op: {sortLabel}</p>;
            })()}

            {props.displayLocationFilter && (
              locationValue && locationValue.lat && locationValue.lng ? (
                <p>
                  Locatie filter: Breedtegraad {locationValue.lat}, Lengtegraad {locationValue.lng}
                  {locationValue.proximity ? `, Straal: ${locationValue.proximity}m` : ''}
                </p>
              ) : (
                <p>Locatie filter: geen</p>
              )
            )}
            {props.displayTagFilters && (
              <>
                <p>Tags: {activeFilter.tags.length > 0 ? '' : 'geen'}</p>
                {activeFilter.tags.length > 0 && (
                  <ul>
                    {activeTags.map(tag => (
                      <li key={`${tag.type}-${tag.id}`}> {tag.label} </li>
                    ))}
                  </ul>
                )}
              </>
            )}
          </>
        </div>
      )}

    </section>
  );
}
