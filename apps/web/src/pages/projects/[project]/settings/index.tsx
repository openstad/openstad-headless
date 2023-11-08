import * as React from 'react';
import { useEffect } from 'react';
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
import { PageLayout } from '@/components/ui/page-layout';
import { Heading } from '@/components/ui/typography';
import { Separator } from '@/components/ui/separator';
import { useRouter } from 'next/router';
import { useProject } from '../../../../hooks/use-project';
import { SimpleCalendar } from '@/components/simple-calender-popup';

const formSchema = z.object({
  name: z.string().min(1, {
    message: 'De naam van een project mag niet leeg zijn!',
  }),
  endDate: z.date().min(new Date(), {
    message: 'De datum moet nog niet geweest zijn!',
  }),
});

export default function ProjectSettings() {
  const category = 'project';

  const router = useRouter();
  const { project } = router.query;
  const { data, isLoading, updateProject } = useProject();
  const defaults = () => ({
    name: data?.name || null,
    endDate: data?.config?.[category]?.endDate
      ? new Date(data?.config?.[category]?.endDate)
      : new Date(),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver<any>(formSchema),
    defaultValues: defaults(),
  });

  useEffect(() => {
    form.reset(defaults());
  }, [data?.config]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const name = values.name;
    try {
      await updateProject(
        {
          [category]: {
            endDate: values.endDate,
          },
        },
        name
      );
    } catch (error) {
      console.error('could not update', error);
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
            name: 'Instellingen',
            url: `/projects/${project}/settings`,
          },
        ]}>
        <div className="container mx-auto py-10 w-1/2 float-left">
          <Form {...form}>
            <Heading size="xl" className="mb-4">
              Instellingen • Algemeen
            </Heading>
            <Separator className="mb-4" />
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Projectnaam</FormLabel>
                    <FormControl>
                      <Input placeholder="Naam" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <SimpleCalendar
                form={form}
                fieldName="endDate"
                label="Einddatum"
              />
              <Button type="submit" variant={'default'}>
                Opslaan
              </Button>
            </form>
            <br />
          </Form>
          <div>
            <br />
            <p>
              Let op! Deze actie is definitief en kan niet ongedaan gemaakt
              worden.
            </p>
            <p>{`Het project moet eerst aangemerkt staan als 'beëindigd' voordat deze actie uitgevoerd kan worden.`}</p>
            <br />
            <Button variant={'destructive'}>Project archiveren</Button>
          </div>
        </div>
      </PageLayout>
    </div>
  );
}
