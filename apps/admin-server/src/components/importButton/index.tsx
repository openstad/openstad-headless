import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogTitle,
} from '@/components/ui/dialog';
import React from 'react';

import useStatus from '../../hooks/use-statuses';
import useTag from '../../hooks/use-tags';
import useUsers from '../../hooks/use-users';
import { Button as RAButton } from '../ui/button';
import ActionButtonsLine from './action-buttons-line';
import countFailedImportRows from './countFailedImportRows';
import FileUpload from './file-upload';
import ImportNotifications from './import-notifications-line';
import ImportRowCount from './import-row-count-line';
import ImportUseIdCheckboxLine from './import-use-id-checkbox-line';
import { translateHeaders } from './translate-headers';
import {
  extractUniqueStatuses,
  prepareStatuses,
} from './utils/status-import-helper';
import { extractUniqueTags, prepareTags } from './utils/tags-import-helper';
import { extractUniqueUserIds, prepareUsers } from './utils/user-import-helper';
import validateFileData from './validate-file-data';
import { processXlsFile } from './xls-extractor';

const ideaSchema = {
  title: 'string',
  summary: 'string',
  description: 'string',
};

interface ValidationError {
  messageType: 'apiValidationError' | string;
  color: string;
  message: string;
}

// Spreadsheet row after translateHeaders/processXlsRow; cells are parsed with
// JSON.parse, so any column can hold any JSON value.
type ImportRow = {
  // Known issue: a numeric status name is parsed to a number and `.trim()` throws.
  statuses?: string;
  'tags.*'?: unknown;
  'user.id'?: number;
  user?: { id?: number };
  [key: string]: unknown;
};

interface FileValidationNotification {
  messageType: string;
  color: string;
  message: string;
}

export const ImportButton = ({ project }: { project: string }) => {
  const [open, setOpen] = React.useState<boolean>(false);
  const [importing, setImporting] = React.useState<boolean>(false);
  const [fileName, setFileName] = React.useState<string>('');
  const [values, setValues] = React.useState<ImportRow[]>([]);
  const [useId, setUseId] = React.useState<boolean>(true);
  const [dialogStatus, setDialogStatus] = React.useState<
    'base' | 'importFinished'
  >('base');
  const [fileValidationNotifications, setFileValidationNotifications] =
    React.useState<FileValidationNotification[]>([]);

  const { data: statuses, createStatus } = useStatus(
    open ? project : undefined
  );
  const { data: tags, createTag } = useTag(open ? project : undefined);
  const { createUser } = useUsers();

  const openImportDialog = () => {
    setOpen(true);
  };

  const clear = () => {
    setImporting(false);
    setFileName('');
    setValues([]);
    setFileValidationNotifications([]);
  };

  const handleClose = () => {
    clear();
    setOpen(false);
    window.location.reload();
  };

  const handleSubmit = (callback: (value: ImportRow) => Promise<Response>) => {
    setImporting(true);

    const apiValidationErrors: ValidationError[] = [];

    Promise.all(
      values.map((value) =>
        callback(value).catch((error: Error) => {
          var valueKeys = Object.keys(value);
          var formattedFirstValue: unknown =
            valueKeys[0] && value[valueKeys[0]];
          var formattedSecondValue: unknown =
            valueKeys[1] && value[valueKeys[1]];

          // add first info rows for more information what row failed

          if (formattedFirstValue) {
            if (
              Array.isArray(value[valueKeys[0]]) ||
              typeof value[valueKeys[0]] === 'string'
            ) {
              formattedFirstValue = `${valueKeys[0]} : ${String(
                value[valueKeys[0]]
              ).slice(0, 25)}`;
            } else {
              formattedFirstValue = `${valueKeys[0]}: ${value[valueKeys[0]]}`;
            }
          } else {
            formattedFirstValue = '';
          }

          if (formattedSecondValue) {
            if (
              Array.isArray(value[valueKeys[1]]) ||
              typeof value[valueKeys[1]] === 'string'
            ) {
              formattedSecondValue = `${valueKeys[1]} : ${String(
                value[valueKeys[1]]
              ).slice(0, 25)}`;
            } else {
              formattedSecondValue = `${valueKeys[1]}: ${value[valueKeys[1]]}`;
            }
          } else {
            formattedSecondValue = '';
          }

          apiValidationErrors.push({
            messageType: 'apiValidationError',
            color: 'red',
            message:
              'Kon rij niet importeren: ' +
              formattedFirstValue +
              '; ' +
              formattedSecondValue +
              ', fout: ' +
              error.message,
          });
        })
      )
    ).then(() => {
      setFileValidationNotifications(apiValidationErrors);
      setImporting(false);
      setDialogStatus('importFinished');
    });
  };

  const prepareData = (
    value: Record<string, unknown>,
    addRemoveKeys?: string[]
  ) => {
    // certain columns should not be sent, for instance date values, like createdAt and updatedAt
    const standardRemoveKeys = ['deletedAt', 'createdAt', 'updatedAt'];
    // certains keys should be parsed as object but exported as a JSON
    const exceptionsObjectKeys = ['location'];

    const removeKeys = addRemoveKeys
      ? standardRemoveKeys.concat(addRemoveKeys)
      : standardRemoveKeys;

    const cleanUp = function (
      value: unknown,
      key: string,
      parentValues: Record<string, unknown> | null
    ) {
      if (
        value &&
        typeof value === 'object' &&
        !exceptionsObjectKeys.includes(key)
      ) {
        const record = value as Record<string, unknown>;
        Object.keys(record).forEach((childKey) => {
          cleanUp(record[childKey], childKey, record);
        });
      } else {
        if ((!value || removeKeys.includes(key)) && parentValues) {
          delete parentValues[key];
        }
      }
    };

    cleanUp(value, '', null);
    value['publishDate'] = new Date();
    return value;
  };

  const prepareSubmit = async () => {
    const translatedValues = values.map((v) => translateHeaders(v));

    const uniqueStatuses = extractUniqueStatuses(translatedValues);
    const uniqueTags = extractUniqueTags(translatedValues);
    const uniqueUserIds = extractUniqueUserIds(translatedValues);

    const statusMapping = await prepareStatuses(
      uniqueStatuses,
      statuses || [],
      createStatus
    );
    const tagMapping = await prepareTags(uniqueTags, tags || [], createTag);
    const userMapping = await prepareUsers(uniqueUserIds, project, createUser);

    return { statusMapping, tagMapping, userMapping };
  };

  const getStatusIdsFromMapping = (
    value: ImportRow,
    mapping: Map<string, number>
  ): number[] => {
    if (!value.statuses) return [];

    const names = value.statuses
      .trim()
      .split('|')
      .map((n: string) => n.trim());
    return names
      .map((n: string) => mapping.get(n.toLowerCase()))
      .filter(Boolean) as number[];
  };

  const getTagIdsFromMapping = (
    value: ImportRow,
    mapping: Map<string, number>
  ): number[] => {
    const tagIds: number[] = [];
    const tagsObject = value['tags.*'];

    if (tagsObject && typeof tagsObject === 'object') {
      Object.entries(tagsObject).forEach(([type, val]) => {
        const names = String(val)
          .trim()
          .split('|')
          .map((n: string) => n.trim());
        names.forEach((n) => {
          const id = mapping.get(`${type.toLowerCase()}.${n.toLowerCase()}`);
          if (id) tagIds.push(id);
        });
      });
      delete value['tags.*'];
    }

    return tagIds;
  };

  const getUserIdFromMapping = (
    value: ImportRow,
    mapping: Map<number, number>
  ): number | undefined => {
    const originalUserId = value['user.id'] || value?.user?.id;
    return originalUserId ? mapping.get(originalUserId) : undefined;
  };

  const handleSubmitCreate = async () => {
    // Prepare all statuses, tags, and user ids
    const { statusMapping, tagMapping, userMapping } = await prepareSubmit();

    const callback = async (row: ImportRow) => {
      const value: ImportRow = translateHeaders(row);
      delete value.id;

      const statusIds = getStatusIdsFromMapping(value, statusMapping);
      const tagIds = getTagIdsFromMapping(value, tagMapping);
      const userId = getUserIdFromMapping(value, userMapping);

      const payload = prepareData(value);
      payload.statuses = statusIds;
      payload.tags = tagIds;
      payload.userId = userId;

      const response = await fetch(
        `/api/openstad/api/project/${project}/resource`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = 'Onbekende fout';

        try {
          const errorJson = JSON.parse(errorText);
          errorMessage = errorJson.message || errorJson.error || errorText;
        } catch (e) {
          errorMessage = errorText;
        }

        throw new Error(errorMessage);
      }

      return response;
    };

    handleSubmit(callback);
  };

  const handleSubmitOverwrite = async () => {
    // Prepare all statuses, tags, and user ids
    const { statusMapping, tagMapping, userMapping } = await prepareSubmit();

    const callback = async (row: ImportRow) => {
      const value: ImportRow = translateHeaders(row);

      const statusIds = getStatusIdsFromMapping(value, statusMapping);
      const tagIds = getTagIdsFromMapping(value, tagMapping);
      const userId = getUserIdFromMapping(value, userMapping);

      const payload = prepareData(value);

      if (statusIds.length > 0) {
        payload.statuses = statusIds;
      }
      if (tagIds.length > 0) {
        payload.tags = tagIds;
      }
      if (userId) {
        payload.userId = userId;
      }

      const response = await fetch(
        `/api/openstad/api/project/${project}/resource/${payload.id}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = 'Onbekende fout';

        try {
          const errorJson = JSON.parse(errorText);
          errorMessage = errorJson.message || errorJson.error || errorText;
        } catch (e) {
          errorMessage = errorText;
        }

        throw new Error(errorMessage);
      }

      return response;
    };

    handleSubmit(callback);
  };

  const handleReload = async () => {
    clear();
    setDialogStatus('base');
  };

  const handleCheckBoxChange = (checked: boolean) => {
    setUseId(!!checked);
  };

  const onFileAdded = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const { target } = e;
    const file = target.files && target.files[0];
    if (!file) return;

    setFileName(file.name);

    let match = file.name.match(/\.(csv|tsv|xlsx?)$/);
    if (!match) throw new Error('File type not recognized');
    let ext = match[1];

    const values = await processXlsFile(file, {});

    setValues(values);
    setFileValidationNotifications(await validateFileData(values, ideaSchema));

    target.value = '';
  };

  const totalRows = values ? values.length : 0;

  return (
    <>
      <RAButton
        className="text-xs p-2 w-fit"
        type="button"
        onClick={openImportDialog}>
        Importeer inzendingen
      </RAButton>

      <Dialog
        open={open}
        onOpenChange={(isOpen) => {
          if (!isOpen) handleClose();
          setOpen(isOpen);
        }}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description">
        <DialogContent>
          <DialogTitle id="alert-dialog-title">
            Importeer inzendingen
          </DialogTitle>

          <div
            id="alert-dialog-description"
            style={{ fontFamily: 'sans-serif' }}>
            {dialogStatus === 'importFinished' ? (
              <>
                <h3>Import voltooid!</h3>
                <p>
                  <b>
                    {totalRows -
                      countFailedImportRows(fileValidationNotifications)}
                  </b>{' '}
                  van de <b>{totalRows}</b> rijen succesvol geïmporteerd
                </p>
                <h5 style={{ color: 'red' }}>
                  {countFailedImportRows(fileValidationNotifications)} mislukte
                  rijen:
                </h5>
                <ImportNotifications
                  {...{ fileValidationNotifications, dialogStatus }}
                />
              </>
            ) : (
              <>
                <p style={{ marginBottom: '10px' }}>
                  Upload een xls(x)-bestand voor bulkbewerking of bulkaanmaak.
                </p>
                <ul style={{ marginBottom: '10px' }} className="list-disc pl-5">
                  <li>
                    Voor aanmaken: gebruik een bestand zonder
                    &apos;id&apos;-kolom.
                  </li>
                  <li>
                    Voor bewerken: gebruik een bestand met &apos;id&apos;-kolom
                    (bijvoorbeeld eerst exporteren, in Excel bewerk en opnieuw
                    uploaden).
                  </li>
                </ul>
                <p style={{ marginBottom: '5px' }}>
                  Vereisten voor het databestand
                </p>
                <ol className="list-decimal pl-5">
                  <li>Het bestand moet een &apos;.xls(x)&apos;-bestand zijn</li>
                  <li>
                    Alleen kolommen die overeenkomen met het datamodel worden
                    geïmporteerd; kolommen met gebruikers- of geaggregeerde
                    gegevens worden genegeerd.
                  </li>
                  <li>
                    Om een specifieke gebruiker aan een rij toe te wijzen,
                    gebruik een kolomkop genaamd &apos;userId&apos; in je csv.
                  </li>
                </ol>
                <ImportUseIdCheckboxLine
                  {...{ checked: useId, handleCheckBoxChange }}
                />
                <FileUpload {...{ onFileAdded, clear, fileName }} />
                <ImportNotifications
                  {...{ fileValidationNotifications, dialogStatus }}
                />
                <ImportRowCount {...{ values }} />
              </>
            )}
          </div>

          <DialogFooter>
            <ActionButtonsLine
              {...{
                handleClose,
                handleSubmitCreate,
                handleSubmitOverwrite,
                handleReload,
                values,
                importing,
                dialogStatus,
                useId,
                idPresent: fileValidationNotifications.some(
                  (n) => n.messageType === 'idColumnPresent'
                ),
              }}
            />
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
