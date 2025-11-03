import { FC } from "react";
import { FormValue } from "@openstad-headless/form/src/form";
export type HiddenInputProps = {
    overrideDefaultValue?: FormValue;
    fieldKey: string;
    defaultValue: string;
    type?: string;
    onChange?: (e: {
        name: string;
        value: FormValue;
    }, triggerSetLastKey?: boolean) => void;
    prevPageText?: string;
    nextPageText?: string;
    fieldOptions?: {
        value: string;
        label: string;
    }[];
};
declare const HiddenInput: FC<HiddenInputProps>;
export default HiddenInput;
