import { Matrix } from '@openstad-headless/enquete/src/types/enquete-props';
import { FormValue } from '@openstad-headless/form/src/form';
import { FC } from 'react';
import './matrix.css';
export type MatrixFieldProps = {
    title: string;
    overrideDefaultValue?: FormValue;
    description?: string;
    fieldRequired?: boolean;
    requiredWarning?: string;
    fieldKey: string;
    disabled?: boolean;
    type?: string;
    onChange?: (e: {
        name: string;
        value: string | Record<number, never> | [] | string[];
    }, triggerSetLastKey?: boolean) => void;
    showMoreInfo?: boolean;
    moreInfoButton?: string;
    moreInfoContent?: string;
    infoImage?: string;
    maxChoices?: string;
    randomId?: string;
    fieldInvalid?: boolean;
    matrixMultiple?: boolean;
    matrix?: Matrix;
    defaultValue?: FormValue;
    fieldOptions?: {
        value: string;
        label: string;
    }[];
    images?: Array<{
        url: string;
        name?: string;
        imageAlt?: string;
        imageDescription?: string;
    }>;
    createImageSlider?: boolean;
    imageClickable?: boolean;
    nextPageText?: string;
    prevPageText?: string;
};
declare const MatrixField: FC<MatrixFieldProps>;
export default MatrixField;
