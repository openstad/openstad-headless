import React, { useEffect, useState } from 'react';

interface ColorPickerProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const isValidHex = (hex: string) => /^#[0-9A-Fa-f]{6}$/.test(hex);

const ColorPicker: React.FC<ColorPickerProps> = ({ value, onChange }) => {
  const [textValue, setTextValue] = useState(value || '');

  useEffect(() => {
    setTextValue(value || '');
  }, [value]);

  const colorInputValue = isValidHex(textValue) ? textValue : '#000000';

  return (
    <span
      className="color-picker-container"
      style={{ display: 'inline-flex', gap: '8px', alignItems: 'center' }}>
      <input
        type="color"
        value={colorInputValue}
        onChange={(e) => {
          setTextValue(e.target.value);
          onChange(e);
        }}
        style={{ marginRight: '-2px' }}
      />
      <input
        type="text"
        value={textValue}
        onChange={(e) => {
          setTextValue(e.target.value);
          if (isValidHex(e.target.value)) {
            onChange(e);
          }
        }}
        onBlur={() => {
          if (textValue && !isValidHex(textValue)) {
            setTextValue(value || '');
          }
        }}
        placeholder="#000000"
        style={{ width: '70px', minWidth: '70px', maxWidth: '70px' }}
      />
    </span>
  );
};

export default ColorPicker;
