import React from 'react';
import { Select, SelectItem } from '../ui/select';

interface ImportDelimiterProps {
  delimiter: string;
  handleImportDelimiterChange: (value: string) => void;
}

const ImportDelimiter: React.FC<ImportDelimiterProps> = ({ delimiter, handleImportDelimiterChange }) => {
  return (
    <div style={{ margin: '10px 0' }}>
      <label htmlFor="delimiter-select">Delimiter (csv/tsv only): </label>
      <br />
      <Select
        onValueChange={handleImportDelimiterChange}
        value={delimiter}
      >
        <SelectItem value="">Auto detect</SelectItem>
        <SelectItem value=",">Comma (,)</SelectItem>
        <SelectItem value=";">Semicolon (;)</SelectItem>
      </Select>
    </div>
  );
};

export default ImportDelimiter;
