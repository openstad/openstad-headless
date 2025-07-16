import { FC } from "react";
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
        value: string | Record<number, never> | [];
    }) => void;
    showMoreInfo?: boolean;
    moreInfoButton?: string;
    moreInfoContent?: string;
    infoImage?: string;
    maxChoices?: string;
    maxChoicesMessage?: string;
    randomId?: string;
    fieldInvalid?: boolean;
};
declare const CheckboxField: FC<CheckboxFieldProps>;
export default CheckboxField;
