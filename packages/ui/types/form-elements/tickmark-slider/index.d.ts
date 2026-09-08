import { FormValue } from '@openstad-headless/form/src/form';
import React, { FC } from 'react';
import './style.css';
export type TickmarkSliderProps = {
    overrideDefaultValue?: FormValue;
    index: number;
    title: string;
    fieldOptions?: {
        value: string;
        label: string | React.JSX.Element;
        image?: {
            url: string;
            alt: string;
        };
        ariaValueText?: string;
    }[];
    clickableSteps?: boolean;
    images?: Array<{
        url: string;
        name?: string;
        imageAlt?: string;
        imageDescription?: string;
    }>;
    createImageSlider?: boolean;
    imageClickable?: boolean;
    fieldRequired: boolean;
    fieldKey: string;
    imageSrc?: string;
    imageAlt?: string;
    imageDescription?: string;
    description?: string;
    disabled?: boolean;
    onChange?: (e: {
        name: string;
        value: FormValue;
    }, triggerSetLastKey?: boolean) => void;
    type?: string;
    showSmileys?: boolean;
    showMoreInfo?: boolean;
    moreInfoButton?: string;
    moreInfoContent?: string;
    infoImage?: string;
    randomId?: string;
    fieldInvalid?: boolean;
    defaultValue?: string;
    prevPageText?: string;
    nextPageText?: string;
    confirmed?: boolean;
    optionFeedback?: Record<string, 'correct' | 'incorrect' | 'missed'>;
};
declare const TickmarkSlider: FC<TickmarkSliderProps>;
export default TickmarkSlider;
