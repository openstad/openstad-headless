import { FC } from "react";
import { FormValue } from "@openstad-headless/form/src/form";
export type CheckboxFieldProps = {
    title: string;
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
    }) => void;
    showMoreInfo?: boolean;
    moreInfoButton?: string;
    moreInfoContent?: string;
    infoImage?: string;
    maxChoices?: string;
    maxChoicesMessage?: string;
    randomId?: string;
    fieldInvalid?: boolean;
    defaultValue?: string;
    prevPageTekst?: string;
    nextPageTekst?: string;
    fieldOptions?: {
        value: string;
        label: string;
    }[];
};
declare const CheckboxField: FC<CheckboxFieldProps>;
export default CheckboxField;
