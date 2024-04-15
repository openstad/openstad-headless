import React, { FC } from "react";

export type HiddenInputProps = {
    fieldKey: string;
    defaultValue: string;
    type?: string;
    onChange?: (e: {name: string, value: string | Record<number, never> | []}) => void;
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
