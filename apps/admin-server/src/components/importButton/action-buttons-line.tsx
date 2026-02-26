import { Loader } from 'lucide-react';
import React from 'react';

import { Button } from '../ui/button';

const ActionButtonsLine = (props: {
  handleClose: () => void;
  handleSubmitCreate: () => void;
  handleSubmitOverwrite: () => void;
  handleReload: () => void;
  values: any[];
  importing: boolean;
  useId: boolean;
  idPresent: boolean;
  dialogStatus?: string;
}) => {
  const {
    handleClose,
    handleSubmitCreate,
    handleSubmitOverwrite,
    handleReload,
    values,
    importing,
    useId,
    idPresent,
    dialogStatus,
  } = props;

  if (dialogStatus === 'importFinished') {
    return (
      <>
        <Button onClick={handleClose} variant="ghost">
          <span>{'SLUIT'}</span>
        </Button>

        <Button onClick={handleReload} color="secondary" variant="default">
          {importing && (
            <Loader className="animate-spin" size={18} strokeWidth={2} />
          )}
          <span>{'Meer importeren'}</span>
        </Button>
      </>
    );
  }

  return (
    <>
      <Button onClick={handleClose} variant="ghost">
        <span>{'SLUIT'}</span>
      </Button>
      <Button
        disabled={!values || values.length < 1 || importing}
        onClick={handleSubmitCreate}
        color="secondary"
        variant="default">
        {importing && (
          <Loader className="animate-spin" size={18} strokeWidth={2} />
        )}
        <span>{'RIJEN CREËREN'}</span>
      </Button>
      <Button
        disabled={
          !values ||
          values.length < 1 ||
          importing ||
          !idPresent ||
          (idPresent && !useId)
        }
        onClick={handleSubmitOverwrite}
        color="primary"
        variant="default">
        {importing && (
          <Loader className="animate-spin" size={18} strokeWidth={2} />
        )}
        <span>{'RIJEN BIJWERKEN'}</span>
      </Button>
    </>
  );
};

export default ActionButtonsLine;
