import DataStore from '@openstad-headless/data-store/src';
import { FormLabel } from '@utrecht/component-library-react';
import React, { useEffect, useState } from 'react';

//Todo correctly type resources. Will be possible when the datastore is correctly typed

// Nasty but make datastore an any type so we can use it without needing an import from a different workspace
type Props = {
  dataStore: any;
  tagType: string;
  placeholder?: string;
  selected?: number[];
  onUpdateFilter?: (
    filter: any,
    label?: string,
    forceSelected?: boolean
  ) => void;
  onlyIncludeIds?: number[];
  tagGroupProjectId?: any;
  preFilterTags?: Array<number>;
  parentStopUsingDefaultValue?: boolean;
  inlineOptions?: boolean;
};

type TagDefinition = { id: number; name: string; projectId?: any };

const MultiSelectTagFilter = ({
  dataStore,
  tagType,
  onUpdateFilter,
  selected = [],
  onlyIncludeIds = [],
  preFilterTags = undefined,
  parentStopUsingDefaultValue = false,
  inlineOptions = false,
  ...props
}: Props) => {
  if (!dataStore || !dataStore.useTags) {
    return <p>Cannot render tagfilter, missing data source</p>;
  }

  const useTagsConfig: {
    type: string;
    onlyIncludeIds: number[];
    projectId?: string;
  } = {
    type: tagType,
    onlyIncludeIds,
  };

  if (
    typeof props?.tagGroupProjectId === 'string' &&
    props?.tagGroupProjectId === '0'
  ) {
    useTagsConfig.projectId = props.tagGroupProjectId;
  }

  const { data: tags } = dataStore.useTags(useTagsConfig);

  const [stopUsingDefaultValue, setStopUsingDefaultValue] = useState(false);
  const [prefilterTagsSelected, setPrefilterTagsSelected] = useState<number[]>(
    []
  );

  useEffect(() => {
    if (parentStopUsingDefaultValue) {
      setStopUsingDefaultValue(true);
    }
  });

  const randomId = Math.random().toString(36).substring(7);

  function getRandomId(placeholder: string | undefined) {
    if (placeholder && placeholder.length >= 1) {
      return placeholder
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, '')
        .replace(/\s+/g, '-');
    } else {
      return randomId;
    }
  }

  useEffect(() => {
    if (
      !stopUsingDefaultValue &&
      !parentStopUsingDefaultValue &&
      preFilterTags &&
      preFilterTags.length > 0 &&
      onUpdateFilter
    ) {
      preFilterTags.forEach((tagId) => {
        const tag = tags.find((tag: TagDefinition) => tag.id === tagId);

        if (tag) {
          onUpdateFilter(tag.id, tag.name, true);

          setPrefilterTagsSelected((prevTags) => {
            if (!prevTags.includes(tag.id)) {
              return [...prevTags, tag.id];
            }
            return prevTags;
          });
        }
      });
    }
  }, [preFilterTags]);

  const combinedSelects = stopUsingDefaultValue
    ? selected
    : Array.from(new Set([...selected, ...prefilterTagsSelected]));

  const groupId = getRandomId(props.placeholder);
  const groupLabel = props.placeholder || `Selecteer ${tagType.toLowerCase()}`;

  return (
    tags.length > 0 && (
      <div className="form-element">
        <FormLabel id={groupId}>{groupLabel}</FormLabel>
        <div
          className={`multiselect-options${inlineOptions ? ' multiselect-options--inline' : ''}`}
          role="group"
          aria-labelledby={groupId}>
          {(tags as TagDefinition[]).map((tag) => {
            const checkboxId = `${groupId}-tag-${tag.id}`;
            return (
              <div key={tag.id} className="multiselect-option">
                <input
                  type="checkbox"
                  id={checkboxId}
                  checked={combinedSelects.includes(tag.id)}
                  onChange={() => {
                    setStopUsingDefaultValue(true);
                    onUpdateFilter && onUpdateFilter(tag.id, tag.name);
                  }}
                />
                <label htmlFor={checkboxId}>{tag.name}</label>
              </div>
            );
          })}
        </div>
      </div>
    )
  );
};
export { MultiSelectTagFilter };
