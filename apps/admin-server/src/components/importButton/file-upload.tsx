import React from 'react';
import { Button } from '../ui/button';
import { Trash } from 'lucide-react';

const FileUpload = (props: {
  onFileAdded: (e: React.ChangeEvent<HTMLInputElement>) => void;
  clear: () => void;
  fileName: string;
}) => {
  const { onFileAdded, clear, fileName }: {
    onFileAdded: (e: React.ChangeEvent<HTMLInputElement>) => void;
    clear: () => void;
    fileName: string;
  } = props;

  return (
    <div className="flex items-center gap-3">
      <label htmlFor="file-upload" className="cursor-pointer">
        <Button asChild variant="default">
          <span>Kies bestand</span>
        </Button>
      </label>
      <input
        id="file-upload"
        type="file"
        className="hidden"
        onChange={onFileAdded}
        accept=".csv,.tsv,.xls,.xlsx,.txt"
      />

      <span className="flex items-center gap-2">
        {fileName}
        <span
          style={{
            cursor: fileName ? 'pointer' : 'not-allowed',
            color: fileName ? 'red' : 'grey',
          }}
          onClick={clear}
        >
          <Trash className="inline-block mr-2 h-5 w-5" />
        </span>
      </span>
    </div>
  );
};

export default FileUpload;