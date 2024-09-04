import React from "react";

interface ColorPickerProps {
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    [key: string]: any;
}

const ColorPicker: React.FC<ColorPickerProps> = ({ value, onChange, ...rest }) => {
    return (
        <span className="color-picker-container">
      <input type="color" value={value} onChange={onChange} />
      <input type="text" value={value} onChange={onChange} />
    </span>
    );
};

export default ColorPicker;