import { FC } from "react";
import { FormValue } from "@openstad-headless/form/src/form";
export type ImageChoiceFieldProps = {
    title: string;
    description?: string;
    choices: ChoiceItem[];
    fieldRequired?: boolean;
    requiredWarning?: string;
    fieldKey: string;
    disabled?: boolean;
    type?: string;
    onChange?: (e: {
        name: string;
        value: FormValue;
    }) => void;
    showMoreInfo?: boolean;
    moreInfoButton?: string;
    moreInfoContent?: string;
    infoImage?: string;
    randomId?: string;
    fieldInvalid?: boolean;
    multiple?: boolean;
    defaultValue?: string;
    prevPageText?: string;
    nextPageText?: string;
    fieldOptions?: {
        value: string;
        label: string;
    }[];
};
export type ChoiceItem = {
    label: string;
    value: string;
    imageSrc: string;
    imageDescription: string;
    imageAlt: string;
    hideLabel?: boolean;
};
declare const ImageChoiceField: FC<ImageChoiceFieldProps>;
export default ImageChoiceField;
