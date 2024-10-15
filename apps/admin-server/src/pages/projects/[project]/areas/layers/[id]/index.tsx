import React, { useCallback, useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {useFieldArray, useForm} from 'react-hook-form';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { PageLayout } from '@/components/ui/page-layout';
import { Heading } from '@/components/ui/typography';
import { Separator } from '@/components/ui/separator';
import { useRouter } from 'next/router';
import useDatalayer from '@/hooks/use-datalayer';
import toast from 'react-hot-toast';
import {ImageUploader} from "@/components/image-uploader";
import {X} from "lucide-react";

const formSchema = z.object({
  name: z.string(),
  layer: z.string(),
  icon: z
    .array(z.object({ url: z.string() }))
    .optional()
    .default([]),
  iconUploader: z.string(),
});

export default function ProjectDatalayerEdit() {
  const router = useRouter();
  const { project, id } = router.query;
  const { data, isLoading, updateDatalayer } = useDatalayer(
    id as string
  );

  const defaults = useCallback(
    () => ({
      name: data?.name || null,
      layer: JSON.stringify(data?.layer),
      icon: data?.icon || null,
      iconUploader: '',
    }),
    [data]
  );

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver<any>(formSchema),
    defaultValues: {},
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const datalayer = await updateDatalayer(values.name, values.layer, values.icon);

    if (datalayer) {
      toast.success('Kaartlaag aangepast!');
      // router.push(`/projects/${project}/areas`);
    } else {
      toast.error('De kaartlaag die is meegegeven lijkt niet helemaal te kloppen.')
    }
  }

  useEffect(() => {
    form.reset(defaults());
  }, [form, defaults]);

  const { fields: iconField, remove: removeImage } = useFieldArray({
    control: form.control,
    name: 'icon',
  });

  return (
    <div>
      <PageLayout
        pageHeader="Projecten"
        breadcrumbs={[
          {
            name: 'Projecten',
            url: '/projects',
          },
          {
            name: 'Polygonen',
            url: `/projects/${project}/areas`,
          },
          {
            name: 'Kaartlaag aanpassen',
            url: `/projects/${project}/areas/layers/${id}`,
          },
        ]}>
        <div className="p-6 bg-white rounded-md">
          <Form {...form}>
            <Heading size="xl">Aanpassen</Heading>
            <Separator className="my-4" />
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="lg:w-1/2 grid grid-cols-1 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({field}) => (
                  <FormItem>
                    <FormLabel>Naam</FormLabel>
                    <FormControl>
                      <Input placeholder="" {...field} />
                    </FormControl>
                    <FormMessage/>
                  </FormItem>
                )}
              />

              <ImageUploader
                form={form}
                fieldName="iconUploader"
                imageLabel="Icoon op de kaart"
                description="De ideale afmetingen voor een icoon zijn 30x40 pixels."
                allowedTypes={['image/*']}
                onImageUploaded={(imageResult) => {
                  form.setValue('icon', [imageResult]);
                  form.resetField('iconUploader');
                  form.trigger('icon');
                }}
              />
              <div className="space-y-2 col-span-full md:col-span-1 flex flex-col">
                {iconField.length > 0 && (
                  <>
                    <label
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Geüpload icoon</label>
                    <section className="grid col-span-full grid-cols-3 gap-x-4 gap-y-8 ">
                      {iconField.map(({id, url}, index) => {
                        return (
                          <div key={id} className="relative">
                            <img src={url} alt={url}/>
                            <Button
                              color="red"
                              onClick={() => {
                                removeImage(index);
                              }}
                              className="absolute right-0 top-0">
                              <X size={24}/>
                            </Button>
                          </div>
                        );
                      })}
                    </section>
                  </>
                )}
              </div>

              <FormField
                control={form.control}
                name="layer"
                render={({field}) => (
                  <FormItem>
                    <FormLabel>Kaartlaag</FormLabel>
                    <FormControl>
                      <Textarea placeholder="" {...field} />
                    </FormControl>
                    <FormMessage/>
                  </FormItem>
                )}
              />
              <Button className="w-fit col-span-full" type="submit">
                Opslaan
              </Button>
            </form>
          </Form>
        </div>
      </PageLayout>
    </div>
  );
}
