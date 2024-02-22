import React, { FC } from "react";

export type HiddenInputProps = {
    fieldKey: string;
    defaultValue: string;
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
