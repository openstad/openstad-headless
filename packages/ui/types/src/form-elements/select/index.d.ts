import { FC } from "react";
import { FormValue } from "@openstad-headless/form/src/form";
export type SelectFieldProps = {
    title?: string;
    description?: string;
    choices?: string[] | [{
        value: string;
        label: string;
    }];
    fieldRequired?: boolean;
    requiredWarning?: string;
    fieldKey: string;
    defaultOption?: string;
    disabled?: boolean;
    onChange?: (e: {
        name: string;
        value: FormValue;
    }) => void;
    type?: string;
    showMoreInfo?: boolean;
    moreInfoButton?: string;
    moreInfoContent?: string;
    infoImage?: string;
    randomId?: string;
    fieldInvalid?: boolean;
    multiple?: boolean;
    defaultValue?: string | string[];
    prevPageText?: string;
    nextPageText?: string;
    fieldOptions?: {
        value: string;
        label: string;
    }[];
};
declare const SelectField: FC<SelectFieldProps>;
export default SelectField;
