import React from 'react';
import { Info } from 'lucide-react';

const ImportRowCount = (props: { values: any[] }) => {
  const { values } = props;

  if (!values || values.length < 1) return <></>;

  const tooltipContent = values
    .map(row =>
      Object.keys(row)
        .map(key => `${key}: ${row[key]}`)
        .join(', ')
    )
    .join('\n');

  return (
    <div style={{ marginBottom: '0px', color: 'blue', display: 'flex', alignItems: 'center', gap: '4px' }}>
      <span>
        Import row count: <strong>{values.length}</strong>
      </span>

      <span
        title={tooltipContent}
        style={{
          verticalAlign: 'middle',
          padding: '4px',
          cursor: 'pointer',
        }}
      >
        <Info className="inline-block mr-2 h-5 w-5" />
      </span>
    </div>
  );
};

export default ImportRowCount;
