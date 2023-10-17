import React from 'react';
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
import { PageLayout } from '@/components/ui/page-layout';
import { Heading } from '@/components/ui/typography';
import { Separator } from '@/components/ui/separator';
import useIdeas from '@/hooks/use-ideas';
import { useRouter } from 'next/router';
import { toast } from 'react-hot-toast';
import { SimpleCalendar } from '@/components/simple-calender-popup';

const formSchema = z.object({
  ideaID: z.coerce.number().optional(),
  userId: z.string().optional(),

  title: z.string().min(10).max(50),
  summary: z.string().min(20).max(140),
  description: z.string().min(140).max(5000),

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
});

export default function ProjectIdeaCreate() {
  const router = useRouter();
  const { project } = router.query;
  const { create } = useIdeas(project as string);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver<any>(formSchema),
    defaultValues: {
      title: '',
      summary: '',
      description: '',
      location: '',
      startDate: new Date(),
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    create(values)
      .then(() => {
        toast.success('Plan successvol aangemaakt');
      })
      .catch((e) => {
        toast.error('Plan kon niet aangemaakt worden');
      });
  }

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
            name: 'Ideeën',
            url: '/projects/1/ideas',
          },
          {
            name: 'Idee aanmaken',
            url: '/projects/1/ideas/create',
          },
        ]}>
        <div className="container mx-auto py-10 w-1/2 float-left ">
          <Form {...form}>
            <Heading size="xl" className="mb-4">
              Idee • Aanmaken
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
                name="ideaID"
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
      </PageLayout>
    </div>
  );
}
