import React, { FC } from "react";
import { FormValue } from "@openstad-headless/form/src/form";

export type HiddenInputProps = {
    overrideDefaultValue?: FormValue;
    fieldKey: string;
    defaultValue: string;
    type?: string;
    onChange?: (e: {name: string, value: FormValue}, triggerSetLastKey?: boolean) => void;
    prevPageText?: string;
    nextPageText?: string;
    fieldOptions?: { value: string; label: string }[];
    images?: Array<{
        url: string;
        name?: string;
        imageAlt?: string;
        imageDescription?: string;
    }>;
    createImageSlider?: boolean;
    imageClickable?: boolean;
}

const HiddenInput: FC<HiddenInputProps> = ({
    fieldKey,
    defaultValue,
}) => {
    return (
        <input
            name={fieldKey}
            defaultValue={defaultValue}
            type="hidden"
        />
    );
};

export default HiddenInput;
