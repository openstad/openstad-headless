import { FC } from 'react';
import './style.css';
export type TickmarkSliderProps = {
    index: number;
    title: string;
    fieldOptions: {
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
        value: string | Record<number, never> | [];
    }) => void;
    type?: string;
    showSmileys?: boolean;
    showMoreInfo?: boolean;
    moreInfoButton?: string;
    moreInfoContent?: string;
    infoImage?: string;
    randomId?: string;
    fieldInvalid?: boolean;
};
declare const TickmarkSlider: FC<TickmarkSliderProps>;
export default TickmarkSlider;
