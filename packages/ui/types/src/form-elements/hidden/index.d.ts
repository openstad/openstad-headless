import { FC } from "react";
import { FormValue } from "@openstad-headless/form/src/form";
export type HiddenInputProps = {
    fieldKey: string;
    defaultValue: string;
    type?: string;
    onChange?: (e: {
        name: string;
        value: FormValue;
    }) => void;
    prevPageText?: string;
    nextPageText?: string;
    fieldOptions?: {
        value: string;
        label: string;
    }[];
};
declare const HiddenInput: FC<HiddenInputProps>;
export default HiddenInput;
