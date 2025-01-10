import React, { useEffect } from 'react';
import { FieldValues, Path, UseFormReturn, useForm } from 'react-hook-form';
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
  onDocumentUploaded?: (documentObject: {url: string} ) => void;
  documentLabel?: string;
  allowedTypes?: string[];
  project: string;
}> = ({ form, fieldName, onDocumentUploaded, allowedTypes, documentLabel = 'Document', project }) => {
  const [document, setDocument] = React.useState<{url: string, name: string}>();
  const [documentUrl, setDocumentUrl] = React.useState<string>('');

  function prepareDocument(document: any) {
    const formData = new FormData();
    formData.append('document', document);
    formData.append('documentname', 'testName');
    formData.append('description', 'testDescription');

    return formData;
  }

  async function uploadDocument(data: any) {
    let document = prepareDocument(data);

    const response = await fetch(`/api/openstad/api/project/${project}/upload/document`, {
      method: 'POST',
      body: document
    })

    setDocument(await response.json());
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
                uploadDocument(e.target.files?.[0])
              }}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
