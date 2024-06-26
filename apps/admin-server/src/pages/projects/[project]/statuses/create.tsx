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
import { YesNoSelect } from '@/lib/form-widget-helpers';
import { Input } from '@/components/ui/input';
import { PageLayout } from '@/components/ui/page-layout';
import { Heading } from '@/components/ui/typography';
import { Separator } from '@/components/ui/separator';
import { useRouter } from 'next/router';
import useStatus from '@/hooks/use-statuses';
import toast from 'react-hot-toast';

const formSchema = z.object({
  name: z.string(),
  seqnr: z.coerce.number(),
  addToNewResources: z.boolean(),
});

export default function ProjectStatusCreate() {
  const router = useRouter();
  const project = router.query.project;
  const { createStatus } = useStatus(project as string);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver<any>(formSchema),
    defaultValues: {},
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const status = await createStatus(values.name, values.seqnr, values.addToNewResources);
    if (status?.id) {
      toast.success('Status aangemaakt!');
      router.push(`/projects/${project}/statuses`);
    } else {
      toast.error('Er is helaas iets mis gegaan.')
    }
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
            name: 'Statuses',
            url: `/projects/${project}/statuses`,
          },
          {
            name: 'Status toevoegen',
            url: `/projects/${project}/statuses/create`,
          },
        ]}>
        <div className="p-6 bg-white rounded-md">
          <Form {...form}>
            <Heading size="xl">Toevoegen</Heading>
            <Separator className="my-4" />
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="lg:w-1/2 grid grid-cols-1 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Naam</FormLabel>
                    <FormControl>
                      <Input placeholder="" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="seqnr"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sequence nummer</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="addToNewResources"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Voeg deze status automatisch toe aan nieuwe resources
                    </FormLabel>
                    {YesNoSelect(field, {})}
                    <FormMessage />
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
