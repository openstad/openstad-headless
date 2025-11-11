import { FC } from "react";
import './style.css';
import { FormValue } from "@openstad-headless/form/src/form";
export type NumberInputProps = {
    title: string;
    overrideDefaultValue?: FormValue;
    description?: string;
    requiredWarning?: string;
    fieldKey: string;
    defaultValue?: string | number;
    disabled?: boolean;
    onChange?: (e: {
        name: string;
        value: FormValue;
    }, triggerSetLastKey?: boolean) => void;
    reset?: (resetFn: () => void) => void;
    format?: boolean;
    prepend?: string;
    append?: string;
    type?: string;
    placeholder?: string;
    randomId?: string;
    fieldInvalid?: boolean;
    prevPageText?: string;
    nextPageText?: string;
    fieldOptions?: {
        value: string;
        label: string;
    }[];
};
declare const NumberInput: FC<NumberInputProps>;
export default NumberInput;
