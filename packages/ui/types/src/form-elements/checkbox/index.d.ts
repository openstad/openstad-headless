import { FC } from "react";
import { FormValue } from "@openstad-headless/form/src/form";
export type CheckboxFieldProps = {
    title: string;
    overrideDefaultValue?: FormValue;
    description?: string;
    choices?: {
        value: string;
        label: string;
        isOtherOption?: boolean;
        defaultValue?: boolean;
    }[];
    fieldRequired?: boolean;
    requiredWarning?: string;
    fieldKey: string;
    disabled?: boolean;
    type?: string;
    onChange?: (e: {
        name: string;
        value: FormValue;
    }, triggerSetLastKey?: boolean) => void;
    showMoreInfo?: boolean;
    moreInfoButton?: string;
    moreInfoContent?: string;
    infoImage?: string;
    maxChoices?: string;
    maxChoicesMessage?: string;
    randomId?: string;
    fieldInvalid?: boolean;
    defaultValue?: string | string[];
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
    randomizeItems?: boolean;
    value?: FormValue;
};
declare const CheckboxField: FC<CheckboxFieldProps>;
export default CheckboxField;
