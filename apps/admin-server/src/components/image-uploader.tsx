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

export const ImageUploader: React.FC<{
  form: UseFormReturn<any>;
  fieldName: Path<FieldValues>;
  onImageUploaded?: (imageObject: {url: string} ) => void;
  imageLabel?: string;
  description?: string;
  allowedTypes?: string[];
}> = ({ form, fieldName, onImageUploaded, allowedTypes, imageLabel = 'Afbeelding', description = '' }) => {
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
    let image = prepareFile(data);
    await fetch('/api/openstad/api/image', {
      method: 'GET',
    })
      .then((response) => response.json())
      .then(async (data) => {
        const response = await fetch(data, {
          method: 'POST',
          body: image,
        })
        setFile(await response.json());
      });
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
