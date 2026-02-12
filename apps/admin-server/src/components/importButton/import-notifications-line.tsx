import { Info } from 'lucide-react';
import React from 'react';

interface ValidationNotification {
  message: string;
  color: string;
}

interface ImportNotificationsProps {
  fileValidationNotifications: ValidationNotification[];
  dialogStatus: string;
}

const ImportNotifications: React.FC<ImportNotificationsProps> = ({
  fileValidationNotifications,
  dialogStatus,
}) => {
  if (dialogStatus === 'importFinished') {
    return (
      <div>
        <ul>
          {fileValidationNotifications.map((validationError, index) => (
            <li key={index} style={{ color: validationError.color }}>
              {validationError.message}
            </li>
          ))}
        </ul>
      </div>
    );
  }

  if (!fileValidationNotifications || fileValidationNotifications.length < 1) {
    return null;
  }

  const color = fileValidationNotifications.some((n) => n.color === 'red')
    ? 'red'
    : 'blue';

  // Prepare tooltip content
  const tooltipContent = fileValidationNotifications
    .map((n) => `${n.message} (${n.color})`)
    .join('\n');

  return (
    <div
      style={{
        marginBottom: '0px',
        color,
        display: 'flex',
        alignItems: 'center',
        gap: '4px',
      }}>
      <span>
        Import validation alerts:{' '}
        <strong>{fileValidationNotifications.length}</strong>
      </span>

      <span
        title={tooltipContent}
        style={{
          verticalAlign: 'middle',
          padding: '4px',
          cursor: 'pointer',
          whiteSpace: 'pre',
        }}>
        <Info className="inline-block mr-2 h-5 w-5" />
      </span>
    </div>
  );
};

export default ImportNotifications;
