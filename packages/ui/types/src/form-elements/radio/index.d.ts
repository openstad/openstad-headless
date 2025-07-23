import { FC } from "react";
export type RadioboxFieldProps = {
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
    randomId?: string;
    fieldInvalid?: boolean;
};
declare const RadioboxField: FC<RadioboxFieldProps>;
export default RadioboxField;
