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

export const ImageUploader: React.FC<{
  form: UseFormReturn<any>;
  fieldName: Path<FieldValues>;
  onImageUploaded?: (imageObject: {url: string} ) => void;
}> = ({ form, fieldName, onImageUploaded }) => {
  const [file, setFile] = React.useState<{url: string}>();

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
    if (file) {
      form.setValue(fieldName, file.url);
      onImageUploaded && onImageUploaded(file);
    }
  }, [file, form, fieldName, onImageUploaded]);

  return (
    <FormField
      control={form.control}
      name={fieldName}
      render={({ field }) => (
        <FormItem>
          <FormLabel>Afbeelding</FormLabel>
          <FormControl>
            <Input
              type="file"
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
