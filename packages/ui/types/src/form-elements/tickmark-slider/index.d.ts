import { FC } from 'react';
import './style.css';
import { FormValue } from '@openstad-headless/form/src/form';
export type TickmarkSliderProps = {
    overrideDefaultValue?: FormValue;
    index: number;
    title: string;
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
};
declare const TickmarkSlider: FC<TickmarkSliderProps>;
export default TickmarkSlider;
