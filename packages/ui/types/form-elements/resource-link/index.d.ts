import { FormValue } from '@openstad-headless/form/src/form';
import { FC } from 'react';
export type ResourceLinkValue = {
    source: string;
    id: string;
    label: string;
    image?: string;
    own?: boolean;
};
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
    onChange?: (e: {
        name: string;
        value: FormValue;
    }, triggerSetLastKey?: boolean) => void;
    type?: string;
    fieldOptions?: {
        value: string;
        label: string;
    }[];
};
declare const ResourceLinkField: FC<ResourceLinkFieldProps>;
export default ResourceLinkField;
