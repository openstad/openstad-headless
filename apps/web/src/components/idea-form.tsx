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
import { toast } from 'react-hot-toast';
import { SimpleCalendar } from '@/components/simple-calender-popup';
import useIdea from '@/hooks/use-idea';

const formSchema = z.object({
  userId: z.string().optional(),

  title: z
    .string()
    .min(10, 'Titel moet minimaal 10 karakters bevatten')
    .max(50, 'Titel mag maximaal 50 karakters bevatten'),
  summary: z
    .string()
    .min(20, 'Samenvatting moet minimaal 20 karakters bevatten')
    .max(140, 'Samenvatting mag maximaal 140 karakters bevatten'),
  description: z
    .string()
    .min(140, 'Omschrijving moet minimaal 140 karakters bevatten')
    .max(5000, 'Omschrijving mag maximaal 5000 karakters bevatten'),

  budgetMin: z.coerce.number().optional(),
  budgetMax: z.coerce.number().optional(),
  budgetInterval: z.coerce.number().optional(),

  startDate: z.date(),
  publishDate: z.date().optional(),

  modBreak: z.string().optional(),
  modBreakUserId: z.coerce.number().optional(),
  modBreakDate: z.date().optional(),

  location: z.string(),
  images: z.string().array().default([]),

  extraData: z
    .object({
      originalId: z.coerce.number().optional(),
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
      ? new Date(existingData?.publishDate)
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
    <div className="container mx-auto py-10 w-1/2 float-left ">
      <Form {...form}>
        <Heading size="xl" className="mb-4">
          {id ? 'Idee • Aanpassen' : 'Idee • Aanmaken'}
        </Heading>
        <Separator className="mb-4" />
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <FormField
            control={form.control}
            name="userId"
            render={({ field }) => (
              <FormItem>
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
              <FormItem>
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
              <FormItem>
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
              <FormItem>
                <FormLabel>Samenvatting</FormLabel>
                <FormControl>
                  <Textarea placeholder="" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Beschrijving</FormLabel>
                <FormControl>
                  <Textarea placeholder="" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="budgetMin"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Minimum budget (optioneel)</FormLabel>
                <FormControl>
                  <Input type="number" min={0} placeholder="" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="budgetMax"
            render={({ field }) => (
              <FormItem>
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
              <FormItem>
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
              <FormItem>
                <FormLabel>Location (optioneel)</FormLabel>
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
              <FormItem>
                <FormLabel>modBreak (optioneel)</FormLabel>
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
              <FormItem>
                <FormLabel>ModBreak user id (optioneel)</FormLabel>
                <FormControl>
                  <Input type="number" min={0} placeholder="" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <SimpleCalendar
            form={form}
            fieldName="modBreakDate"
            label="ModBreak datum (optioneel)"
            placeholder="Kies een datum"
            withReset
          />

          <SimpleCalendar
            form={form}
            fieldName="startDate"
            label="start datum van het plan"
          />

          <SimpleCalendar
            form={form}
            fieldName="publishDate"
            label="Publiceer datum van het plan (laat leeg voor een concept plan)"
            withReset
          />

          <Separator />
          <Button type="submit" variant={'default'}>
            Opslaan
          </Button>
        </form>
        <br />
      </Form>
    </div>
  );
}
