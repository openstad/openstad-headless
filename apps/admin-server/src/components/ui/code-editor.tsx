import React, { useEffect, useState } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { langs } from '@uiw/codemirror-extensions-langs';

export interface CodeEditorProps {
  initValue?: string | object;
  onValueChange?: (value: string) => void;
}

const CodeEditor: React.FC<CodeEditorProps> = ({ initValue = '', onValueChange }) => {
  const formatJSON = (input: string | object) => {
    try {
      // If input is an object, stringify with formatting, otherwise parse and then stringify with formatting
      const jsonString = typeof input === 'object' ? JSON.stringify(input, null, 2) : JSON.stringify(JSON.parse(input), null, 2);
      return jsonString;
    } catch (error) {
      console.error('Error formatting JSON:', error);
      // Return the original input if it's not valid JSON
      return typeof input === 'string' ? input : JSON.stringify(input);
    }
  };

  if (typeof initValue === 'object' || (typeof initValue === 'string' && initValue.trim().startsWith('{'))) {
    initValue = formatJSON(initValue);
  }

  const [value, setValue] = useState(initValue);

  // Update state when initValue changes
  useEffect(() => {
    if (typeof initValue === 'object' || (typeof initValue === 'string' && initValue.trim().startsWith('{'))) {
      setValue(formatJSON(initValue));
    } else {
      setValue(initValue);
    }
  }, [initValue]);

  const onChange = React.useCallback((val: React.SetStateAction<string>, viewUpdate: any) => {
    const formattedValue = formatJSON(val);
    if (onValueChange) {
      onValueChange(formattedValue);
    }
    setValue(formattedValue);
  }, [onValueChange]);

  return <CodeMirror value={value} height="400px" extensions={[langs.json()]} onChange={onChange} />;
};

export { CodeEditor };