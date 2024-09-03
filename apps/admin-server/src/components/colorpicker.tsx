import React from "react";

const ColorPicker = ({ value, onChange, ...rest }) => {
    return (
        <span className="color-picker-container">
      <input type="color" value={value} onChange={onChange} />
      <input type="text" value={value} onChange={onChange} />
    </span>
    );
};

export default ColorPicker;