import React from 'react';
import * as z from 'zod';
import { Input } from './ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from './ui/form';
import { Button } from './ui/button';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

const formSchema = z.object({
  projectName: z.any(),
  });

export default function ImageUploader() {  

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver<any>(formSchema),
    defaultValues: {},
  });

  function uploadImage(image: any){
    return fetch('http://localhost:31450/image?access_token=189a52049e0f4c14740f2235b9318306', {
        method: 'POST',
        headers: {
          "Content-Type": "application/json",
        },
        body: image
    })
  }

  function onSubmit(values: z.infer<typeof formSchema>) {
    uploadImage(values.projectName)
  }  

  return(
    <Form>
      <form onSubmit={form.handleSubmit(onSubmit)} className="lg:w-3/4 grid grid-cols-1 lg:grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="projectName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Afbeelding</FormLabel>
              <FormControl>
                <Input type='file' {...field} />
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