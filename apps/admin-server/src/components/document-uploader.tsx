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
import {UploadDocument} from "@/hooks/upload-document";

export const DocumentUploader: React.FC<{
  form: UseFormReturn<any>;
  fieldName: Path<FieldValues>;
  onDocumentUploaded?: (documentObject: {url: string} ) => void;
  documentLabel?: string;
  allowedTypes?: string[];
  project?: string;
}> = ({ form, fieldName, onDocumentUploaded, allowedTypes, documentLabel = 'Document', project }) => {
  const [document, setDocument] = React.useState<{url: string, name: string}>();
  const [documentUrl, setDocumentUrl] = React.useState<string>('');

  async function doUpload(data: any) {
    const uploadedDocument = await UploadDocument(data, project);

    setDocument(uploadedDocument);
  }

  useEffect(() => {
    if (document && documentUrl !== document.url ) {
        setDocumentUrl(document.url);
        form.setValue(fieldName, document.url);
      onDocumentUploaded && onDocumentUploaded(document);
    }
  }, [document, form, fieldName, onDocumentUploaded]);

  const acceptAttribute = allowedTypes
    ? allowedTypes.join(',')
    : "";

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
                doUpload(e.target.files?.[0])
              }}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
