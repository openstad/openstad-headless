import { FC } from "react";
export type HiddenInputProps = {
    fieldKey: string;
    defaultValue: string;
    type?: string;
    onChange?: (e: {
        name: string;
        value: string | Record<number, never> | [];
    }) => void;
};
declare const HiddenInput: FC<HiddenInputProps>;
export default HiddenInput;
