import React, { useCallback, useEffect, useState } from 'react';
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
import toast from 'react-hot-toast';

const formSchema = z.object({
  name: z.string().min(1, {
    message: 'De naam van een project mag niet leeg zijn!',
  }),
});

export default function ProjectDuplicate() {
  const router = useRouter();
  const { project } = router.query;
  const { data, isLoading } = useProject();
  const [errors, setErrors] = useState<string[]>([]);

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

  async function fetchData( url: string) {
    let response = await fetch(url) || [];

    if (!response.ok) {
      return [];
    }

    let data = await response.json();

    if (!Array.isArray(data)) {
      return [];
    }
    return data.map((item) => {
      if (item.deletedAt) {
        return null;
      }
      delete item.projectId;
      item.originalId = item.id;
      delete item.id;
      return item;
    })
  }

  type DuplicateData = {
    areaId: number;
    config: any;
    emailConfig: any;
    hostStatus: any;
    name: string;
    title: string;
    widgets: any[];
    tags: any[];
    statuses: any[];
    resources: any[];
    resourceSettings: boolean;
  };

  async function duplicate(values: z.infer<typeof formSchema>) {
    const duplicateData: DuplicateData = {
      areaId: data.areaId,
      config: data.config,
      emailConfig: data.emailConfig,
      hostStatus: data.hostStatus,
      name: values.name,
      title: data.title,
      widgets: [],
      tags: [],
      statuses: [],
      resources: [],
      resourceSettings: false,
    };

    const widgets = await fetchData(`/api/openstad/api/project/${data.id}/widgets`);
    duplicateData.widgets = widgets;

    const tags = await fetchData(`/api/openstad/api/project/${data.id}/tag`);
    duplicateData.tags = tags;

    const statuses = await fetchData(`/api/openstad/api/project/${data.id}/status`);
    duplicateData.statuses = statuses;

    const resources = await fetchData(`/api/openstad/api/project/${data.id}/resource?includeTags=1&includeStatus=1`);
    duplicateData.resources = resources;

    duplicateData.resourceSettings = duplicateData?.config?.resources || {};

    if (Array.isArray(resources) && resources.length > 0) {
      // Set the canAddNewResources to true to prevent the API from returning an error
      duplicateData.config = duplicateData.config || {};
      duplicateData.config.resources = duplicateData.config.resources || {};
      duplicateData.config.resources.canAddNewResources = true;

      // Set min and max for title, description and summary to prevent the API from returning an error
      duplicateData.config.resources.titleMaxLength = 10000;
      duplicateData.config.resources.titleMinLength = 1;
      duplicateData.config.resources.summaryMaxLength = 10000;
      duplicateData.config.resources.summaryMinLength = 1;
      duplicateData.config.resources.descriptionMaxLength = 10000;
      duplicateData.config.resources.descriptionMinLength = 1;
    }

    const response = await fetch(`/api/openstad/api/project`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(duplicateData),
    });

    if (response.ok) {
      const newId = await response.json();
      toast.success('Er is een kopie van het project aangemaakt. Je wordt nu doorgestuurd naar de projecten pagina.', {
        duration: 5000
      });

      setTimeout(() => {
        if (newId) {
          router.push(`/projects/${newId}/widgets`);
        }
      }, 4000);
    } else {
      const errorData = await response.json();
      setErrors(errorData.errors || ['Er is een fout opgetreden bij het dupliceren van het project.']);
      toast.error('Er is een fout opgetreden bij het dupliceren van het project.');
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
                  Bij het dupliceren van je project wordt er een compleet identieke versie van het project aangemaakt in de database.
                </p>
                <p>
                  Hou er wel rekening mee dat de gewenste gebruikers van het project eerst aan het project gekoppeld moeten worden.
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
              {errors.length > 0 && (
                <div className="mt-4 text-red-600">
                  <ul>
                    {errors.map((error, index) => (
                      <li key={index}>{error}</li>
                    ))}
                  </ul>
                </div>
              )}
              <br />
            </Form>
          </div>
        </div>
      </PageLayout>
    </div>
  );
}
