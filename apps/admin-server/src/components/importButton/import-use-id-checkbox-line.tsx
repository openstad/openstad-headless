import React from 'react';
import { Checkbox } from '../ui/checkbox';

const ImportUseIdCheckboxLine = (props: { 
  checked: boolean; 
  handleCheckBoxChange: (checked: boolean) => void 
}) => {
  const { checked, handleCheckBoxChange } = props;

  return (
    <div style={{ margin: '10px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
      <Checkbox
        id="useId"
        checked={checked}
        onCheckedChange={(value) => handleCheckBoxChange(!!value)}
        name="useId"
      />
      <label htmlFor="useId" style={{ cursor: 'pointer' }}>
        Gebruik ID tijdens import
      </label>
    </div>
  );
};

export default ImportUseIdCheckboxLine;