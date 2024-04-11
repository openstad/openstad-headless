import React, { useCallback, useEffect, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useFieldArray, useForm } from 'react-hook-form';

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
import { Heading } from '@/components/ui/typography';
import { Separator } from '@/components/ui/separator';
import { useRouter } from 'next/router';
import { SimpleCalendar } from '@/components/simple-calender-popup';
import useResource from '@/hooks/use-resource';
import toast from 'react-hot-toast';
import { ImageUploader } from './image-uploader';
import useTags from '@/hooks/use-tags';
import { CheckboxList } from './checkbox-list';
import { X } from 'lucide-react';
import { useProject } from '@/hooks/use-project';

const onlyNumbersMessage = 'Dit veld mag alleen nummers bevatten';
const minError = (field: string, nr: number) =>
  `${field} moet minimaal ${nr} karakters bevatten`;
const maxError = (field: string, nr: number) =>
  `${field} mag maximaal ${nr} karakters bevatten`;

const formSchema = z.object({
  userId: z.coerce
    .number({ invalid_type_error: onlyNumbersMessage })
    .optional(),

  title: z
    .string()
    .min(10, minError('Titel', 10))
    .max(50, maxError('Titel', 50))
    .default(''),
  summary: z
    .string()
    .min(20, minError('Samenvatting', 20))
    .max(140, maxError('Samenvatting', 140))
    .default(''),
  description: z
    .string()
    .min(140, minError('Beschrijving', 140))
    .max(5000, maxError('Beschrijving', 5000))
    .default(''),

  budget: z.coerce
    .number({ invalid_type_error: onlyNumbersMessage })
    .default(0),
  budgetMin: z.coerce
    .number({ invalid_type_error: onlyNumbersMessage })
    .optional(),
  budgetMax: z.coerce
    .number({ invalid_type_error: onlyNumbersMessage })
    .optional(),
  budgetInterval: z.coerce
    .number({ invalid_type_error: onlyNumbersMessage })
    .optional(),

  startDate: z.date(),
  publishDate: z.date().optional(),

  modBreak: z.coerce.string().optional(),
  modBreakUserId: z.coerce
    .number({ invalid_type_error: onlyNumbersMessage })
    .optional(),
  modBreakDate: z.date().optional(),

  location: z.string().optional(),
  image: z.string().optional(),
  images: z
    .array(z.object({ url: z.string() }))
    .optional()
    .default([]),

  extraData: z
    .object({
      originalId: z.coerce
        .number({ invalid_type_error: onlyNumbersMessage })
        .optional(),
    })
    .default({}),
  tags: z.number().array().default([]),
});

type FormType = z.infer<typeof formSchema>;

type Props = {
  onFormSubmit: (body: FormType) => Promise<any>;
};

export default function ResourceForm({ onFormSubmit }: Props) {
  const router = useRouter();
  const { project, id } = router.query;
  const { data: projectData } = useProject();

  const { data: existingData, error } = useResource(
    project as string,
    id as string
  );

  const { data: tags, error: tagError, isLoading } = useTags(project as string);

  const loadedTags = (tags || []) as {
    id: number;
    name: string;
    type?: string;
  }[];

  const budgetFallback = (existingData: any, key: string = '') => {
    if (!existingData) return 0;

    if (typeof existingData?.budget === 'number') {
      return existingData.budget;
    }

    return existingData[key] || 0;
  };

  const defaults = useCallback(
    (): FormType => ({
      userId: existingData?.userId || undefined,

      title: existingData?.title || '',
      summary: existingData?.summary || '',
      description: existingData?.description || '',
      budget: budgetFallback(existingData),
      budgetMin: budgetFallback(existingData, 'min'),
      budgetMax: budgetFallback(existingData, 'max'),
      budgetInterval: budgetFallback(existingData, 'interval'),
      tags:
        existingData?.tags?.map((t: any) => t.id) ||
        projectData?.config?.resources?.tags ||
        [],
      startDate: existingData?.startDate
        ? new Date(existingData?.startDate)
        : new Date(),
      publishDate: existingData?.publishDate
        ? new Date(existingData.publishDate)
        : undefined,

      modBreak: existingData?.modBreak || '',
      modBreakUserId: existingData?.modBreakUserId || undefined,
      modBreakDate: existingData?.modBreakDate
        ? new Date(existingData.modBreakDate)
        : undefined,

      location: existingData?.location
        ? JSON.stringify(existingData?.location)
        : '',
      image: '',
      images: existingData?.images || [],
      extraData: {
        originalId: existingData?.extraData?.originalId || undefined,
      },
    }),
    [existingData]
  );

  const form = useForm<FormType>({
    resolver: zodResolver<any>(formSchema),
    defaultValues: defaults(),
  });

  function onSubmit(values: FormType) {
    onFormSubmit(values)
      .then(() => {
        toast.success(`Resource successvol ${id ? 'aangepast' : 'aangemaakt'}`);
        router.push(`/projects/${project}/resources`);
      })
      .catch((e) => {
        toast.error(`Resource kon niet ${id ? 'aangepast' : 'aangemaakt'} worden`);
      });
  }

  useEffect(() => {
    if (existingData) {
      form.reset(defaults());
    }
    if (!existingData && projectData?.config?.resources?.tags) {
      const selectedTags = form.getValues('tags') || [];

      if (selectedTags.length === 0) {
        const projectTags = Array.isArray(projectData?.config?.resources?.tags)
          ? projectData?.config?.resources?.tags
          : [];
        form.reset({
          tags: Array.from(new Set([...selectedTags, ...projectTags])),
        });
      }
    }
  }, [existingData, form, defaults, projectData?.config?.resources?.tags]);

  const { fields: imageFields, remove: removeImage } = useFieldArray({
    control: form.control,
    name: 'images',
  });

  return (
    <div className="p-6 bg-muted">
      <Form className='p-6 bg-white rounded-md' {...form}>
        <Heading size="xl">{id ? 'Aanpassen' : 'Toevoegen'}</Heading>
        <Separator className="my-4" />
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="grid grid-cols-2 gap-x-4 gap-y-8 lg:auto-rows-fit max-w-screen-xl">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem className="col-span-full lg:col-span-1">
                <FormLabel>Titel</FormLabel>
                <FormControl>
                  <Input placeholder="" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="summary"
            render={({ field }) => (
              <FormItem className="col-span-full lg:col-span-1">
                <FormLabel>Samenvatting</FormLabel>
                <FormControl>
                  <Input placeholder="" {...field} />

                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem className="col-span-full sm:col-span-2 md:col-span-2 lg:col-span-2">
                <FormLabel>Beschrijving</FormLabel>
                <FormControl>
                  <Textarea rows={6} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <ImageUploader
            form={form}
            fieldName="image"
            onImageUploaded={(imageResult) => {
              let array = [...(form.getValues('images') || [])];
              array.push(imageResult);
              form.setValue('images', array);
              form.resetField('image');
              form.trigger('images');
            }}
          />

          <FormField
            control={form.control}
            name="budget"
            render={({ field }) => (
              <FormItem className="col-span-1">
                <FormLabel>Budget</FormLabel>
                <FormControl>
                  <Input placeholder="" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="extraData.originalId"
            render={({ field }) => (
              <FormItem className="col-span-full lg:col-span-1">
                <FormLabel>
                  Resource id van het originele resource (optioneel)
                </FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="Het originele resource id"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="userId"
            render={({ field }) => (
              <FormItem className="col-span-full lg:col-span-1">
                <FormLabel>User id van het resource (optioneel)</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Laat leeg om jezelf te koppelen"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* <FormField
            control={form.control}
            name="budgetMin"
            render={({ field }) => (
              <FormItem className="col-span-1">
                <FormLabel>Minimum budget (optioneel)</FormLabel>
                <FormControl>
                  <Input placeholder="" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="budgetMax"
            render={({ field }) => (
              <FormItem className="col-span-1">
                <FormLabel>Maximum budget (optioneel)</FormLabel>
                <FormControl>
                  <Input type="number" min={0} placeholder="" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="budgetInterval"
            render={({ field }) => (
              <FormItem className="col-span-1">
                <FormLabel>Interval budget (optioneel)</FormLabel>
                <FormControl>
                  <Input type="number" min={0} placeholder="" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          /> */}

          <FormField
            control={form.control}
            name="location"
            render={({ field }) => (
              <FormItem className="col-span-full lg:col-span-1">
                <FormLabel>Locatie (optioneel)</FormLabel>
                <FormControl>
                  <Input placeholder="" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <hr className="col-span-full mt-8 mb-8" />

          <FormField
            control={form.control}
            name="modBreak"
            render={({ field }) => (
              <FormItem className="col-span-1">
                <FormLabel>ModBreak (optioneel)</FormLabel>
                <FormControl>
                  <Input placeholder="" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="modBreakUserId"
            render={({ field }) => (
              <FormItem className="col-span-1">
                <FormLabel>ModBreak user id (optioneel)</FormLabel>
                <FormControl>
                  <Input placeholder="" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="mt-auto col-span-full lg:col-span-1">
            <SimpleCalendar
              form={form}
              fieldName="modBreakDate"
              label="ModBreak datum (optioneel)"
              placeholder="Kies een datum"
              withReset
            />
          </div>

          <hr className="col-span-full mt-8 mb-8" />

          <div className="mt-auto col-span-full lg:col-span-1">
            <SimpleCalendar
              form={form}
              fieldName="startDate"
              label="Startdatum van het resource"
            />
          </div>
          <div className="mt-auto col-span-full lg:col-span-1">
            <SimpleCalendar
              form={form}
              fieldName="publishDate"
              label="Publiceer datum van het resource (laat leeg voor een concept resource)"
              withReset
            />
          </div>

          <CheckboxList
            form={form}
            fieldName="tags"
            fieldLabel="Selecteer de gewenste tags die bij een resource weergegeven zullen
               worden."
            label={(t) => t.name}
            keyForGrouping="type"
            keyPerItem={(t) => `${t.id}`}
            items={loadedTags}
            selectedPredicate={(t) =>
              form.getValues('tags').findIndex((tg) => tg === t.id) > -1
            }
            onValueChange={(tag, checked) => {
              const values = form.getValues('tags');
              form.setValue(
                'tags',
                checked
                  ? [...values, tag.id]
                  : values.filter((id) => id !== tag.id)
              );
            }}
          />

          <section className="grid col-span-full grid-cols-3 gap-x-4 gap-y-8 ">
            {imageFields.map(({ id, url }, index) => {
              return (
                <div key={id} style={{ position: 'relative' }}>
                  <img src={url} alt={url} />
                  <Button
                    color="red"
                    onClick={() => {
                      removeImage(index);
                    }}
                    style={{
                      position: 'absolute',
                      right: 0,
                      top: 0,
                    }}>
                    <X size={24} />
                  </Button>
                </div>
              );
            })}
          </section>

          <Button className="w-fit col-span-full" type="submit">
            Opslaan
          </Button>
        </form>
      </Form>
    </div>
  );
}
