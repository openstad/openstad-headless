import { FormValue } from '@openstad-headless/form/src/form';
import { FC } from 'react';
import './a-b-slider.css';
export type RangeSliderProps = {
    title: string;
    overrideDefaultValue?: FormValue | valueObject;
    description?: string;
    labelA: string;
    labelB: string;
    titleA: string;
    titleB: string;
    imageA: string;
    imageB: string;
    descriptionA?: string;
    descriptionB?: string;
    fieldRequired?: boolean;
    fieldKey: string;
    showLabels?: boolean;
    minCharacters?: number;
    maxCharacters?: number;
    disabled?: boolean;
    type?: string;
    onChange?: (e: {
        name: string;
        value: FormValue | valueObject;
    }, triggerSetLastKey?: boolean) => void;
    showMoreInfo?: boolean;
    moreInfoButton?: string;
    moreInfoContent?: string;
    infoImage?: string;
    randomId?: string;
    fieldInvalid?: boolean;
    skipQuestion?: boolean;
    skipQuestionAllowExplanation?: boolean;
    skipQuestionExplanation?: string;
    skipQuestionLabel?: string;
    defaultValue?: string;
    prevPageText?: string;
    nextPageText?: string;
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
};
type valueObject = {
    value: string;
    skipQuestion: boolean;
    skipQuestionExplanation: string | undefined;
};
declare const RangeSlider: FC<RangeSliderProps>;
export default RangeSlider;
