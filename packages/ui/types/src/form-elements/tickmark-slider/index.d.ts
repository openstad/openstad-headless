import { FC } from 'react';
import './style.css';
import { FormValue } from '@openstad-headless/form/src/form';
export type TickmarkSliderProps = {
    index: number;
    title: string;
    fieldOptions?: {
        value: string;
        label: string;
    }[];
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
    }) => void;
    type?: string;
    showSmileys?: boolean;
    showMoreInfo?: boolean;
    moreInfoButton?: string;
    moreInfoContent?: string;
    infoImage?: string;
    randomId?: string;
    fieldInvalid?: boolean;
    defaultValue?: string;
    prevPageTekst?: string;
    nextPageTekst?: string;
};
declare const TickmarkSlider: FC<TickmarkSliderProps>;
export default TickmarkSlider;
