import React, { useCallback, useEffect } from 'react';
import { PageLayout } from '../../../components/ui/page-layout';
import { Button } from '../../../components/ui/button';
import { useRouter } from 'next/router';
import { useProject } from '@/hooks/use-project';
import * as z from 'zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Heading } from '@/components/ui/typography';
import { Separator } from '@/components/ui/separator';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Input } from '@/components/ui/input';

const formSchema = z.object({
  name: z.string().min(1, {
    message: 'De naam van een project mag niet leeg zijn!',
  }),
});

export default function ProjectDuplicate() {
  const router = useRouter();
  const { project } = router.query;
  const { data, isLoading } = useProject();

  const defaults = useCallback(
    () => ({
      name: data?.name || null,
    }),
    [data?.name]
  );

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver<any>(formSchema),
    defaultValues: defaults(),
  });

  useEffect(() => {
    form.reset(defaults());
  }, [form, defaults]);

  if (!data) return null;

  async function duplicate(values: z.infer<typeof formSchema>) {
    const duplicateData = {
      areaId: data.areaId,
      config: data.config,
      emailConfig: data.emailConfig,
      hostStatus: data.hostStatus,
      name: values.name,
      title: data.title,
    };

    await fetch(`/api/openstad/api/project`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(duplicateData),
    });
    router.push('/projects');
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
            name: 'Dupliceren',
            url: `/projects/${project}/duplicate`,
          },
        ]}>
        <div className="container py-6">
          <div className="p-6 bg-white rounded-md">
            <Form {...form}>
              <Heading size="xl">Dupliceren</Heading>
              <Separator className="my-4" />
              <form
                onSubmit={form.handleSubmit(duplicate)}
                className="space-y-4">
                <p>
                  Gebruik deze knop om de gegevens van je project te dupliceren.
                </p>
                <p>
                  Bij het dupliceren van je project zal er een compleet
                  identieke versie van het project aangemaakt worden in de
                  database.
                </p>
                <p>
                  Hou er wel rekening mee dat de gewenste gebruikers van het
                  project eerst aan het project gekoppeld moeten worden.
                </p>
                <br />
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
                <Button type="submit" variant={'default'}>
                  Opslaan
                </Button>
              </form>
              <br />
            </Form>
          </div>
        </div>
      </PageLayout>
    </div>
  );
}
