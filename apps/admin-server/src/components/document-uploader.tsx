import { UploadDocument } from '@/hooks/upload-document';
import {
  GENERIC_UPLOAD_ERROR_MESSAGE,
  MAX_UPLOAD_SIZE_MB,
  UploadError,
} from '@/lib/upload-limits';
import React from 'react';
import { FieldValues, Path, UseFormReturn } from 'react-hook-form';

import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from './ui/form';
import { Input } from './ui/input';

export const DocumentUploader: React.FC<{
  form: UseFormReturn<any>;
  fieldName: Path<FieldValues>;
  onDocumentUploaded?: (documentObject: {
    url: string;
    name?: string;
    size?: number;
    mimeType?: string;
  }) => void;
  documentLabel?: string;
  allowedTypes?: string[];
  project?: string;
  allowMultiple?: boolean;
}> = ({
  form,
  fieldName,
  onDocumentUploaded,
  allowedTypes,
  documentLabel = 'Document',
  project,
  allowMultiple = false,
}) => {
  async function doUpload(file: File) {
    const uploadedDocument = await UploadDocument(file, project);

    let uploadedDocumentUrl = uploadedDocument.url;
    const lastDotIndex = uploadedDocumentUrl.lastIndexOf('.');
    const lastUnderscoreIndex = uploadedDocumentUrl.lastIndexOf('_');

    if (lastDotIndex === -1 && lastUnderscoreIndex > 1) {
      uploadedDocumentUrl =
        uploadedDocumentUrl.substring(0, lastUnderscoreIndex) +
        '.' +
        uploadedDocumentUrl.substring(lastUnderscoreIndex + 1);
    } else if (lastDotIndex > -1 && lastUnderscoreIndex > -1) {
      if (lastDotIndex < lastUnderscoreIndex) {
        uploadedDocumentUrl =
          uploadedDocumentUrl.substring(0, lastUnderscoreIndex) +
          '.' +
          uploadedDocumentUrl.substring(lastUnderscoreIndex + 1);
      }
    }

    form.setValue(fieldName, uploadedDocumentUrl);
    onDocumentUploaded?.({
      url: uploadedDocumentUrl,
      name: uploadedDocument?.name,
      size: uploadedDocument?.size,
      mimeType: uploadedDocument?.mimeType,
    });
  }

  const acceptAttribute = allowedTypes ? allowedTypes.join(',') : '';

  return (
    <FormField
      control={form.control}
      name={fieldName}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{documentLabel}</FormLabel>
          <FormDescription>
            Maximale bestandsgrootte: {MAX_UPLOAD_SIZE_MB} MB
          </FormDescription>
          <FormControl>
            <Input
              type="file"
              accept={acceptAttribute}
              multiple={allowMultiple}
              {...field}
              onChange={async (e) => {
                const files = e.target.files;
                if (!files || files.length === 0) return;

                form.clearErrors(fieldName);
                try {
                  for (const file of Array.from(files)) {
                    await doUpload(file);
                  }
                } catch (error) {
                  const message =
                    error instanceof UploadError
                      ? error.message
                      : GENERIC_UPLOAD_ERROR_MESSAGE;
                  form.setError(fieldName, { type: 'manual', message });
                }
              }}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};
