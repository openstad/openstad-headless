import React from 'react';
import * as z from 'zod';
import { Input } from './ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from './ui/form';
import { Button } from './ui/button';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createHash, randomInt } from "crypto";
import * as querystring from "querystring";

const formSchema = z.object({
  projectName: z.any(),
  });

type SignatureData = {
  exp?: number; // exp timestamp
  rndNumber: string; // random number
};

export default function ImageUploader() {  
  const secret : string = '';
  const ttl : number = 0;
  const hash : string = "sha1"

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver<any>(formSchema),
    defaultValues: {},
  });

  function uploadImage(image: any){
    return fetch('http://localhost:31450/image?access_token=7a3bde0d196d439926e515fc167ffb8a', {
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

  function sign(url: string, signTTL: number): string {
    const data: SignatureData = {
      rndNumber: randomInt(10000000000).toString()
    }

    const newttl = signTTL ?? ttl;
    if (newttl) {
      data.exp = Date.now() + newttl * 1000;
    }

    const prefixSign = url.indexOf("?") == -1 ? "?" : "&";
    url += `${prefixSign}signed=${querystring.stringify(
      data as Record<string, string | number>,
      "-",
      "_"
    )}`;
    url += `-${this.hash(url, this.secret)}`;

    return url;
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