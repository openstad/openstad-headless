import DataStore from '@openstad-headless/data-store/src';
import { FormValue } from '@openstad-headless/form/src/form';
import NotificationProvider from '@openstad-headless/lib/NotificationProvider/notification-provider';
import NotificationService from '@openstad-headless/lib/NotificationProvider/notification-service';
import {
  AccordionProvider,
  FormField,
  FormFieldDescription,
  FormLabel,
  Paragraph,
} from '@utrecht/component-library-react';
import { FilePondErrorDescription, FilePondFile } from 'filepond';
import FilePondPluginFileValidateType from 'filepond-plugin-file-validate-type';
import FilePondPluginImageExifOrientation from 'filepond-plugin-image-exif-orientation';
import FilePondPluginImagePreview from 'filepond-plugin-image-preview';
import 'filepond-plugin-image-preview/dist/filepond-plugin-image-preview.css';
import 'filepond/dist/filepond.min.css';
import React, { FC, useEffect, useState } from 'react';
import { FilePond, registerPlugin } from 'react-filepond';

import { Spacer } from '../../spacer';
import './document-upload.css';

registerPlugin(
  FilePondPluginImageExifOrientation,
  FilePondPluginImagePreview,
  FilePondPluginFileValidateType
);

const filePondSettings = {
  labelIdle:
    "Sleep document(en) naar deze plek of <span class='filepond--label-action'>klik hier</span>",
  labelInvalidField: 'Veld bevat ongeldige documenten',
  labelFileWaitingForSize: 'Wachtend op grootte',
  labelFileSizeNotAvailable: 'Grootte niet beschikbaar',
  labelFileCountSingular: 'Document in lijst',
  labelFileCountPlural: 'Documenten in lijst',
  labelFileLoading: 'Laden',
  labelFileAdded: 'Toegevoegd',
  labelFileLoadError: 'Fout bij het uploaden',
  labelFileRemoved: 'Verwijderd',
  labelFileRemoveError: 'Fout bij het verwijderen',
  labelFileProcessing: 'Uploaden',
  labelFileProcessingComplete: 'Document geladen',
  labelFileProcessingAborted: 'Upload geannuleerd',
  labelFileProcessingError: 'Fout tijdens uploaden',
  labelFileProcessingRevertError: 'Fout tijdens terugdraaien',
  labelTapToCancel: 'tik om te annuleren',
  labelTapToRetry: 'tik om opnieuw te proberen',
  labelTapToUndo: 'tik om ongedaan te maken',
  labelButtonRemoveItem: 'Verwijderen',
  labelButtonAbortItemLoad: 'Abort',
  labelButtonRetryItemLoad: 'Retry',
  labelButtonAbortItemProcessing: 'Verwijder',
  labelButtonUndoItemProcessing: 'Undo',
  labelButtonRetryItemProcessing: 'Retry',
  labelButtonProcessItem: 'Upload',
  labelFileTypeNotAllowed: 'Bestandstype is niet toegestaan',
  allowFileSizeValidation: true,
  maxFileSize: '8mb',
  name: 'document',
  maxParallelUploads: 1,
};

export type DocumentUploadProps = {
  title: string;
  overrideDefaultValue?: FormValue | { name: string; url: string }[];
  description?: string;
  fieldRequired?: boolean;
  requiredWarning?: string;
  fieldKey: string;
  allowedTypes?: string[];
  disabled?: boolean;
  multiple?: boolean;
  type?: string;
  onChange?: (
    e: { name: string; value: { name: string; url: string }[] },
    triggerSetLastKey?: boolean
  ) => void;
  imageUrl?: string;
  showMoreInfo?: boolean;
  moreInfoButton?: string;
  moreInfoContent?: string;
  infoImage?: string;
  randomId?: string;
  fieldInvalid?: boolean;
  defaultValue?: string;
  prevPageText?: string;
  nextPageText?: string;
  fieldOptions?: { value: string; label: string }[];
};

const DocumentUploadField: FC<DocumentUploadProps> = ({
  title,
  description,
  fieldKey,
  fieldRequired = false,
  multiple = false,
  onChange,
  allowedTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  ],
  disabled = false,
  showMoreInfo = false,
  moreInfoButton = 'Meer informatie',
  moreInfoContent = '',
  infoImage = '',
  randomId = '',
  fieldInvalid = false,
  ...props
}) => {
  const datastore = new DataStore({ props });

  const [documents, setDocuments] = useState<FilePondFile[]>([]);
  const [uploadedDocuments, setUploadedDocuments] = useState<
    { name: string; url: string }[]
  >([]);

  const acceptAttribute = allowedTypes ? allowedTypes : '';

  class HtmlContent extends React.Component<{ html: any }> {
    render() {
      let { html } = this.props;
      return <div dangerouslySetInnerHTML={{ __html: html }} />;
    }
  }

  useEffect(() => {
    const allDocuments = [];

    if (documents.length > 0 && uploadedDocuments.length > 0) {
      for (let i = 0; i < documents.length; i++) {
        const file = documents[i].file;
        if (file && file.name) {
          let sanitizedFileName = file.name.replace(/\./g, '_'); // Replace all dots with underscores
          sanitizedFileName = sanitizedFileName.replace(/ /g, '_'); // Replace spaces with underscores
          sanitizedFileName = sanitizedFileName.replace(
            /[^a-zA-Z0-9_\-]/g,
            '_'
          ); // Replace special characters with underscores
          sanitizedFileName = sanitizedFileName.replace(/_+/g, '_'); // Replace multiple underscores with a single underscore

          let fileInUploadedDocuments = uploadedDocuments.find(
            (o) => o.name === sanitizedFileName
          );

          if (fileInUploadedDocuments) {
            allDocuments.push(fileInUploadedDocuments);
          }
        }
      }
    }

    if (onChange) {
      onChange({
        name: fieldKey,
        value: allDocuments,
      });
    }
  }, [uploadedDocuments.length, setUploadedDocuments, setDocuments]);

  function waitForElm(selector: any) {
    return new Promise((resolve) => {
      if (document.querySelector(selector)) {
        return resolve(document.querySelector(selector));
      }

      const observer = new MutationObserver((mutations) => {
        if (document.querySelector(selector)) {
          observer.disconnect();
          resolve(document.querySelector(selector));
        }
      });

      observer.observe(document.body, {
        childList: true,
        subtree: true,
      });
    });
  }

  useEffect(() => {
    waitForElm('.filepond--browser').then((elm: any) => {
      const label = document.querySelectorAll('.filepond--drop-label > label');
      const span = document.querySelectorAll(
        '.filepond--drop-label > label > span'
      );
      label.forEach((item: any) => {
        item.setAttribute('aria-hidden', 'false');
      });
      span.forEach((item: any) => {
        item.removeAttribute('tabindex');
      });
    });
  }, []);

  const notifyFailed = (message: string) =>
    NotificationService.addNotification(message, 'error');

  return (
    <FormField type="text">
      {title && (
        <Paragraph className="utrecht-form-field__label">
          <FormLabel
            htmlFor={randomId}
            dangerouslySetInnerHTML={{ __html: title }}
          />
        </Paragraph>
      )}

      {description && (
        <FormFieldDescription
          dangerouslySetInnerHTML={{ __html: description }}
        />
      )}
      {showMoreInfo && (
        <AccordionProvider
          sections={[
            {
              body: <HtmlContent html={moreInfoContent} />,
              expanded: undefined,
              label: moreInfoButton,
            },
          ]}
        />
      )}

      {infoImage && (
        <figure className="info-image-container">
          <img src={infoImage} alt="" />
          <Spacer size={0.5} />
        </figure>
      )}

      <div className="utrecht-form-field__input">
        <FilePond
          files={documents.map((file) => file.file)}
          onupdatefiles={(fileItems: FilePondFile[]) => {
            setDocuments(fileItems);
          }}
          allowMultiple={multiple}
          server={{
            process: {
              url: props?.imageUrl + '/documents',
              method: 'POST',
              headers: {
                Authorization: 'Bearer ' + datastore.api?.currentUserJWT,
              },
              onload: (response: any) => {
                const currentDocuments = [...uploadedDocuments];
                currentDocuments.push(JSON.parse(response)[0]);

                setUploadedDocuments(currentDocuments);

                return JSON.stringify(currentDocuments); // Dit heeft echt geen nut, maar het lost wel de TS problemen op
              },
            },
            fetch: props?.imageUrl + '/documents',
            revert: null,
          }}
          id={randomId}
          required={fieldRequired}
          disabled={disabled}
          acceptedFileTypes={
            typeof acceptAttribute === 'string'
              ? [acceptAttribute]
              : acceptAttribute
          }
          beforeAddFile={(fileItem) => {
            return new Promise<boolean>((resolve, reject) => {
              const forbiddenCharsRegex = /[\\/:\*\?"<>\|]/;
              const fileName = fileItem.file.name;
              const forbiddenChar = fileName.match(forbiddenCharsRegex);

              if (forbiddenChar) {
                const forbiddenCharName = forbiddenChar[0];
                const forbiddenCharIndex =
                  fileName.indexOf(forbiddenCharName) + 1;

                // We don't use forbiddenCharName, because the character might not be rendered correctly in the notification
                // For example: '//' will be rendered as ':', which is confusing for the user
                const errorMessage = `Bestandsnaam mag het teken op positie ${forbiddenCharIndex} niet bevatten.`;
                reject(errorMessage);
              } else {
                resolve(true);
              }
            }).catch((error) => {
              notifyFailed(error);
              return false;
            });
          }}
          aria-invalid={fieldInvalid}
          aria-describedby={`${randomId}_error`}
          onremovefile={(
            error: FilePondErrorDescription | null,
            file: FilePondFile
          ) => {
            const fileName = file?.file?.name;

            if (!!fileName) {
              const uploadDocumentFileName = fileName.replace(/\./g, '_');
              const fileIsInUploadedDocuments = uploadedDocuments.find(
                (item) => item.name === uploadDocumentFileName
              );

              if (!fileIsInUploadedDocuments) return;

              const updatedDocuments = uploadedDocuments.filter(
                (item) => item.name !== uploadDocumentFileName
              );
              setUploadedDocuments(updatedDocuments);

              const updatedFiles = documents.filter(
                (item) => item.file.name !== fileName
              );
              setDocuments(updatedFiles);
            }
          }}
          {...filePondSettings}
        />
        <NotificationProvider />
      </div>
    </FormField>
  );
};

export default DocumentUploadField;
