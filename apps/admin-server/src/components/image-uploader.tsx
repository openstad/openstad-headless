import React from 'react';
import * as z from 'zod';
import { Input } from './ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from './ui/form';
import { Button } from './ui/button';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

const formSchema = z.object({
  image: z.any(),
  });

export default function ImageUploader() {  

  const [file, setFile] = React.useState<File>()

  function prepareFile(image: any) {
    const formData = new FormData();
    formData.append('image', image);
    formData.append('filename', 'testName');
    formData.append('description', 'testDescription');
    return(formData)
  }

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver<any>(formSchema),
    defaultValues: {},
  });

  async function uploadImage(data: any){
    let image = prepareFile(data)
    await fetch('/api/openstad/api/generatecode', {
      method: 'GET',
    })
    .then(response => response.json())
    .then(data => {
      fetch(data, {
        method: 'POST',
        body: image
      })
    })
  }

  function onSubmit(values: z.infer<typeof formSchema>) {
    uploadImage(file)
  }

  return(
    <Form>
      <form onSubmit={form.handleSubmit(onSubmit)} encType='multipart/form-data' className="lg:w-3/4 grid grid-cols-1 lg:grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="image"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Afbeelding</FormLabel>
              <FormControl>
                <Input type='file' {...field} onChange={(e) => setFile(e.target.files?.[0])} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button variant="default" type="submit" className="w-fit col-span-full">
          Opslaan
        </Button>
      </form>
    </Form>
  )
}