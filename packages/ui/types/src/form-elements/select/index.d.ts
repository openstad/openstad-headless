import { FC } from "react";
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
        value: string | Record<number, never> | [];
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
};
declare const SelectField: FC<SelectFieldProps>;
export default SelectField;
