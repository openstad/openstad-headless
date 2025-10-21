import React, { useEffect } from 'react';
import { FieldValues, Path, UseFormReturn, useForm } from 'react-hook-form';
import {
    FormControl, FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from './ui/form';
import { Input } from './ui/input';
import {validateProjectNumber} from "@/lib/validateProjectNumber";
import {UploadDocument} from "@/hooks/upload-document";

export const ImageUploader: React.FC<{
  form: UseFormReturn<any>;
  fieldName: Path<FieldValues>;
  onImageUploaded?: (imageObject: {url: string} ) => void;
  imageLabel?: string;
  description?: string;
  allowedTypes?: string[];
  project?: string;
}> = ({ form, fieldName, onImageUploaded, allowedTypes, imageLabel = 'Afbeelding', description = '', project }) => {
  const [file, setFile] = React.useState<{url: string}>();
  const [fileUrl, setFileUrl] = React.useState<string>('');

  function prepareFile(image: any) {
    const formData = new FormData();
    formData.append('image', image);
    formData.append('filename', 'testName');
    formData.append('description', 'testDescription');

    return formData;
  }

  async function uploadImage(data: any) {
    let response;

    if (data && data.type === 'image/gif') {
      response = await UploadDocument(data, project)
    } else {
      let image = prepareFile(data);

      const projectNumber: number | undefined = validateProjectNumber(project);

      const uploadCall = await fetch(`/api/openstad/api/project/${projectNumber}/upload/image`, {
        method: 'POST',
        body: image
      })

      response = await uploadCall.json()
    }

    setFile(response);
  }

  useEffect(() => {
    if (file && fileUrl !== file.url ) {
        setFileUrl(file.url);
        form.setValue(fieldName, file.url);
        onImageUploaded && onImageUploaded(file);
    }
  }, [file, form, fieldName, onImageUploaded]);

  const acceptAttribute = allowedTypes
    ? allowedTypes.join(',')
    : "";

  return (
    <FormField
      control={form.control}
      name={fieldName}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{imageLabel}</FormLabel>
            { description && (
              <FormDescription>
                {description}
              </FormDescription>
            )}
          <FormControl>
            <Input
              type="file"
              accept={acceptAttribute}
              {...field}
              onChange={(e) => uploadImage(e.target.files?.[0])}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
