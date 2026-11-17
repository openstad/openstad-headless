import { FormValue } from '@openstad-headless/form/src/form';
import { FC } from 'react';
import './sort.scss';
type OptionTitle = {
    key: string;
};
type Option = {
    titles?: OptionTitle[];
};
export type SortFieldProps = {
    options?: Option[];
    title?: string;
    description?: string;
    onSort?: (sorted: Option[]) => void;
    fieldKey: string;
    type?: string;
    defaultValue?: string;
    fieldOptions?: {
        value: string;
        label: string;
    }[];
    fieldRequired?: boolean;
    requiredWarning?: string;
    images?: Array<{
        url: string;
        name?: string;
        imageAlt?: string;
        imageDescription?: string;
    }>;
    createImageSlider?: boolean;
    imageClickable?: boolean;
    onChange?: (e: {
        name: string;
        value: any;
        isInitial?: boolean;
    }, triggerSetLastKey?: boolean) => void;
    prevPageText?: string;
    nextPageText?: string;
    overrideDefaultValue?: FormValue;
    numberingStyle?: string;
    infoImage?: string;
};
declare const SortField: FC<SortFieldProps>;
export default SortField;
