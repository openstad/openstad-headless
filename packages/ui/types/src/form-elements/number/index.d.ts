import { FC } from "react";
import './style.css';
export type NumberInputProps = {
    title: string;
    description?: string;
    requiredWarning?: string;
    fieldKey: string;
    defaultValue?: string | number;
    disabled?: boolean;
    onChange?: (e: {
        name: string;
        value: string | Record<number, never> | [];
    }) => void;
    reset?: (resetFn: () => void) => void;
    format?: boolean;
    prepend?: string;
    append?: string;
    type?: string;
    placeholder?: string;
    randomId?: string;
    fieldInvalid?: boolean;
};
declare const NumberInput: FC<NumberInputProps>;
export default NumberInput;
