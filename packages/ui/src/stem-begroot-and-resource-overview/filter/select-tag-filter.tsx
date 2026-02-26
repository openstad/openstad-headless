import { Select } from '@openstad-headless/ui/src';
import { FormLabel, SubtleButton } from '@utrecht/component-library-react';
import React, { forwardRef, useEffect, useState } from 'react';

import RadioboxField from '../../form-elements/radio';

//Todo correctly type resources. Will be possible when the datastore is correctly typed

// Nasty but make datastore an any type so we can use it without needing an import from a different workspace

type Props = {
  dataStore: any;
  tagType: string;
  placeholder?: string;
  onlyIncludeIds?: number[];
  onUpdateFilter?: (filter: any, label?: string) => void;
  title: string;
  tagGroupProjectId?: any;
  preFilterTags?: Array<number>;
  parentStopUsingDefaultValue?: boolean;
  inlineOptions?: boolean;
  valueSelected?: string;
  removeActiveTag?: (tagType: string, tagId: number) => void;
  resetCounter: number;
  setResetCounter: React.Dispatch<React.SetStateAction<number>>;
};

type TagDefinition = {
  id: number;
  name: string;
  type: string;
  projectId?: any;
};

const SelectTagFilter = forwardRef<HTMLSelectElement, Props>(
  (
    {
      onlyIncludeIds = [],
      dataStore,
      tagType,
      onUpdateFilter,
      preFilterTags = undefined,
      parentStopUsingDefaultValue = false,
      inlineOptions = false,
      valueSelected = '',
      removeActiveTag,
      resetCounter,
      setResetCounter,
      ...props
    },
    ref
  ) => {
    // The useTags function should not need the  config and such anymore, because it should get that from the datastore object. Perhaps a rewrite of the hooks is needed
    const [
      stopUsingDefaultValueAfterReset,
      setStopUsingDefaultValueAfterReset,
    ] = useState(false);

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

    const [defaultValue, setDefaultValue] = useState<string | undefined>(
      undefined
    );
    const [stopUsingDefaultValue, setStopUsingDefaultValue] = useState(false);

    useEffect(() => {
      if (parentStopUsingDefaultValue) {
        setStopUsingDefaultValue(true);
      }
    });

    if (!dataStore || !dataStore.useTags) {
      return <p>Cannot render tagfilter, missing data source</p>;
    }
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
        preFilterTags &&
        preFilterTags.length > 0 &&
        tags &&
        tags.length &&
        onUpdateFilter
      ) {
        preFilterTags.forEach((tagId) => {
          const tag = tags.find((tag: TagDefinition) => tag.id === tagId);
          if (tag) {
            const tagId = tag?.id?.toString();

            if (defaultValue !== tagId) {
              onUpdateFilter(tagId, tag?.name || '');
              setDefaultValue(tagId);
            }
          }
        });
      }
    }, [preFilterTags]);

    return tags.length > 0 && !inlineOptions ? (
      <div className="form-element">
        <FormLabel htmlFor={getRandomId(props.placeholder)}>
          {props.placeholder || 'Selecteer item'}
        </FormLabel>
        <Select
          id={getRandomId(props.placeholder)}
          ref={ref}
          options={(tags || []).map((tag: TagDefinition) => ({
            value: tag.id,
            label: tag.name,
          }))}
          title={props.title}
          onValueChange={(value, label) => {
            setStopUsingDefaultValue(true);
            onUpdateFilter && onUpdateFilter(value, label);
          }}
          defaultValue={
            preFilterTags && preFilterTags.length > 0
              ? tags
                  .find((tag: TagDefinition) => preFilterTags.includes(tag.id))
                  ?.id?.toString()
              : undefined
          }></Select>
      </div>
    ) : (
      tags.length > 0 && inlineOptions && (
        <div className="form-element">
          <FormLabel>
            {props.placeholder || 'Selecteer item'}
            {!!valueSelected && (
              <SubtleButton
                appearance="link"
                onClick={() => {
                  setStopUsingDefaultValueAfterReset(true);
                  setResetCounter(resetCounter + 1);
                  removeActiveTag &&
                    removeActiveTag(tagType, Number(valueSelected));
                }}>
                Wis
              </SubtleButton>
            )}
          </FormLabel>
          <RadioboxField
            key={resetCounter}
            fieldKey={tagType}
            choices={(tags || []).map((tag: TagDefinition) => ({
              value: tag.id,
              label: tag.name,
            }))}
            title=""
            onChange={({ name, value }) => {
              setStopUsingDefaultValue(true);
              onUpdateFilter && onUpdateFilter(value, name);
            }}
            defaultValue={
              !stopUsingDefaultValueAfterReset &&
              preFilterTags &&
              preFilterTags.length > 0
                ? tags.find((tag: TagDefinition) =>
                    preFilterTags.includes(tag.id)
                  )?.id
                : undefined
            }
          />
        </div>
      )
    );
  }
);

export { SelectTagFilter };
