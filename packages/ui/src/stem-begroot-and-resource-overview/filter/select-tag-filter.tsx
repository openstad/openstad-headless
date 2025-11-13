import { Select } from '@openstad-headless/ui/src';
import { FormLabel } from '@utrecht/component-library-react';
import React, { forwardRef, useEffect, useState } from 'react';

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
};

type TagDefinition = { id: number; name: string; projectId?: any };

const SelectTagFilter = forwardRef<HTMLSelectElement, Props>(
  (
    {
      onlyIncludeIds = [],
      dataStore,
      tagType,
      onUpdateFilter,
      preFilterTags = undefined,
      parentStopUsingDefaultValue = false,
      ...props
    },
    ref
  ) => {
    // The useTags function should not need the  config and such anymore, because it should get that from the datastore object. Perhaps a rewrite of the hooks is needed

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

    return (
      tags.length > 0 && (
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
                    .find((tag: TagDefinition) =>
                      preFilterTags.includes(tag.id)
                    )
                    ?.id?.toString()
                : undefined
            }></Select>
        </div>
      )
    );
  }
);

export { SelectTagFilter };
