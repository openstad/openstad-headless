import { UploadDocument } from '@/hooks/upload-document';
import React, { useEffect } from 'react';
import { FieldValues, Path, UseFormReturn } from 'react-hook-form';

import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from './ui/form';
import { Input } from './ui/input';

export const DocumentUploader: React.FC<{
  form: UseFormReturn<any>;
  fieldName: Path<FieldValues>;
  onDocumentUploaded?: (documentObject: { url: string; name?: string }) => void;
  documentLabel?: string;
  allowedTypes?: string[];
  project?: string;
}> = ({
  form,
  fieldName,
  onDocumentUploaded,
  allowedTypes,
  documentLabel = 'Document',
  project,
}) => {
  const [document, setDocument] = React.useState<{
    url: string;
    name: string;
  }>();
  const [documentUrl, setDocumentUrl] = React.useState<string>('');

  async function doUpload(data: any) {
    const uploadedDocument = await UploadDocument(data, project);

    setDocument(uploadedDocument);
  }

  useEffect(() => {
    if (document) {
      let uploadedDocumentUrl = document.url;
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

      if (documentUrl !== uploadedDocumentUrl) {
        setDocumentUrl(uploadedDocumentUrl);
        form.setValue(fieldName, uploadedDocumentUrl);
        onDocumentUploaded &&
          onDocumentUploaded({
            url: uploadedDocumentUrl,
            name: document?.name,
          });
      }
    }
  }, [document, form, fieldName, onDocumentUploaded]);

  const acceptAttribute = allowedTypes ? allowedTypes.join(',') : '';

  return (
    <FormField
      control={form.control}
      name={fieldName}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{documentLabel}</FormLabel>
          <FormControl>
            <Input
              type="file"
              accept={acceptAttribute}
              {...field}
              onChange={(e) => {
                doUpload(e.target.files?.[0]);
              }}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};
