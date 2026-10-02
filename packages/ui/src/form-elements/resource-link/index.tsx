import DataStore from '@openstad-headless/data-store/src';
import { FormValue } from '@openstad-headless/form/src/form';
import {
  FormField,
  FormFieldDescription,
  FormLabel,
  Paragraph,
} from '@utrecht/component-library-react';
import React, { FC, useEffect, useState } from 'react';

import { Combobox, ComboboxOption } from '../../combobox';
import RteContent from '../../rte-formatting/rte-content';
import { Spacer } from '../../spacer';

export type ResourceLinkValue = {
  source: string;
  id: string;
  label: string;
  image?: string;
  own?: boolean;
};

type ResourceLinkOption = ComboboxOption & { own?: boolean };

export type ResourceLinkFieldProps = {
  title?: string;
  description?: string;
  fieldKey: string;
  fieldRequired?: boolean;
  requiredWarning?: string;
  placeholder?: string;
  linkSource?: string;
  linkTags?: string;
  excludeResourceId?: string;
  projectId?: string | number;
  api?: any;
  randomId?: string;
  fieldInvalid?: boolean;
  defaultValue?: ResourceLinkValue[];
  overrideDefaultValue?: FormValue;
  onChange?: (
    e: { name: string; value: FormValue },
    triggerSetLastKey?: boolean
  ) => void;
  type?: string;
  fieldOptions?: { value: string; label: string }[];
};

const toValues = (value: unknown): ResourceLinkValue[] =>
  Array.isArray(value)
    ? (value as ResourceLinkValue[]).filter(
        (item) => item && typeof item === 'object' && item.id && item.source
      )
    : [];

const ResourceLinkField: FC<ResourceLinkFieldProps> = ({
  title,
  description,
  fieldKey,
  placeholder,
  linkSource,
  linkTags,
  excludeResourceId,
  projectId,
  api,
  randomId = '',
  fieldInvalid = false,
  defaultValue = [],
  overrideDefaultValue,
  onChange,
}) => {
  const datastore: any = new DataStore({ projectId, api, config: { api } });

  const [selected, setSelected] = useState<ResourceLinkValue[]>(() =>
    toValues(overrideDefaultValue ?? defaultValue)
  );

  useEffect(() => {
    if (overrideDefaultValue !== undefined) {
      setSelected(toValues(overrideDefaultValue));
    }
  }, [JSON.stringify(overrideDefaultValue)]);

  const labelId = `${fieldKey}-label`;
  const descriptionId = description ? `${fieldKey}-description` : undefined;
  const errorId = fieldInvalid ? `${randomId}_error` : undefined;

  const loadOptions = async (query: string): Promise<ComboboxOption[]> => {
    const results = await datastore.api.links.fetchOptions({
      projectId,
      source: linkSource,
      search: query,
      tags: linkTags,
      exclude: linkSource === 'openstad' ? excludeResourceId : undefined,
    });
    return Array.isArray(results) ? results : [];
  };

  const handleChange = (options: ResourceLinkOption[]) => {
    const values = options.map((option) => ({
      source: linkSource as string,
      id: option.id,
      label: option.label,
      ...(option.image ? { image: option.image } : {}),
      ...(option.own ? { own: true } : {}),
    }));
    setSelected(values);
    onChange?.({ name: fieldKey, value: values });
  };

  return (
    <FormField type="text">
      {title && (
        <Paragraph className="utrecht-form-field__label">
          <FormLabel htmlFor={fieldKey} id={labelId}>
            <RteContent
              content={title}
              unwrapSingleRootDiv={true}
              forceInline={true}
            />
          </FormLabel>
        </Paragraph>
      )}
      {description && (
        <>
          <FormFieldDescription id={descriptionId}>
            <RteContent content={description} unwrapSingleRootDiv={true} />
          </FormFieldDescription>
          <Spacer size={0.5} />
        </>
      )}
      <div className="utrecht-form-field__input">
        <Combobox
          id={fieldKey}
          labelledBy={title ? labelId : undefined}
          describedBy={[descriptionId, errorId].filter(Boolean).join(' ')}
          invalid={fieldInvalid}
          placeholder={placeholder || undefined}
          selected={selected}
          onChange={handleChange}
          loadOptions={loadOptions}
          loadOnFocus={linkSource === 'openstad'}
        />
      </div>
      <Spacer size={1.25} />
    </FormField>
  );
};

export default ResourceLinkField;
