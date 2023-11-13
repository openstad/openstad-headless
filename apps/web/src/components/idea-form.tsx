import React, { useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useForm } from 'react-hook-form';

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
import useIdea from '@/hooks/use-idea';
import toast from 'react-hot-toast';

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

  location: z.string(),
  images: z.string().array().default([]),

  extraData: z
    .object({
      originalId: z.coerce
        .number({ invalid_type_error: onlyNumbersMessage })
        .optional(),
    })
    .default({}),
});

type FormType = z.infer<typeof formSchema>;

type Props = {
  onFormSubmit: (body: FormType) => Promise<any>;
};

export default function IdeaForm({ onFormSubmit }: Props) {
  const router = useRouter();
  const { project, id } = router.query;

  const { data: existingData, error } = useIdea(
    project as string,
    id as string
  );

  const defaults = (): FormType => ({
    userId: existingData?.userId || undefined,

    title: existingData?.title || '',
    summary: existingData?.summary || '',
    description: existingData?.description || '',

    budgetMin: existingData?.budget?.min || undefined,
    budgetMax: existingData?.budget?.max || undefined,
    budgetInterval: existingData?.budget?.interval || undefined,

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

    location: existingData?.location || '',
    images: existingData?.images || [],
    extraData: {
      originalId: existingData?.extraData?.originalId || undefined,
    },
  });

  const form = useForm<FormType>({
    resolver: zodResolver<any>(formSchema),
    defaultValues: defaults(),
  });

  function onSubmit(values: FormType) {
    onFormSubmit(values)
      .then(() => {
        toast.success(`Plan successvol ${id ? 'aangepast' : 'aangemaakt'}`);
        router.push(`/projects/${project}/ideas`);
      })
      .catch((e) => {
        toast.error(`Plan kon niet ${id ? 'aangepast' : 'aangemaakt'} worden`);
      });
  }

  useEffect(() => {
    if (existingData) {
      form.reset(defaults());
    }
  }, [existingData]);

  return (
    <div className="p-6 bg-white rounded-md">
      <Form {...form}>
        <Heading size="xl">{id ? 'Aanpassen' : 'Toevoegen'}</Heading>
        <Separator className="my-4" />
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="lg:w-2/3 grid grid-cols-3 gap-4 lg:auto-rows-fit">
          <FormField
            control={form.control}
            name="userId"
            render={({ field }) => (
              <FormItem className="col-span-full lg:col-span-2 lg:pr-40">
                <FormLabel>User id van het plan (optioneel)</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Laat leeg om jezelf te koppellen"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="extraData.originalId"
            render={({ field }) => (
              <FormItem className="col-span-1 lg:-ml-40">
                <FormLabel>
                  Plan id van het originele plan (optioneel)
                </FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="Het originele plan id"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem className="col-span-full">
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
              <FormItem className="col-span-full lg:col-span-2 lg:pr-40">
                <FormLabel>Samenvatting</FormLabel>
                <FormControl>
                  <Textarea rows={6} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem className="col-span-1 lg:-ml-40">
                <FormLabel>Beschrijving</FormLabel>
                <FormControl>
                  <Textarea rows={6} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
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
          />

          <FormField
            control={form.control}
            name="location"
            render={({ field }) => (
              <FormItem className="col-span-1">
                <FormLabel>Locatie (optioneel)</FormLabel>
                <FormControl>
                  <Input placeholder="" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

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

          <div className="mt-auto col-span-full lg:col-span-1">
            <SimpleCalendar
              form={form}
              fieldName="startDate"
              label="Startdatum van het plan"
            />
          </div>
          <div className="mt-auto col-span-full lg:col-span-1">
            <SimpleCalendar
              form={form}
              fieldName="publishDate"
              label="Publiceer datum van het plan (laat leeg voor een concept plan)"
              withReset
            />
          </div>

          <Button className="w-fit col-span-full" type="submit">
            Opslaan
          </Button>
        </form>
      </Form>
    </div>
  );
}
