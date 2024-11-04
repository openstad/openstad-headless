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
  const [errors, setErrors] = useState<Array<{step: string, error: string}>>([]);
  const [isErrorsVisible, setIsErrorsVisible] = useState(false);
  const [duplicatingInProgress, setDuplicatingInProgress] = useState(false);
  const [removePreviousDuplicatedDataInProgress, setRemovePreviousDuplicatedDataInProgress] = useState(false);
  const [duplicatedData, setDuplicatedData] = useState<Array<any>>([]);

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
    skipDefaultStatuses: boolean;
  };

  const removePreviousDuplicatedData = async () => {
    setRemovePreviousDuplicatedDataInProgress(true);

    try {
      const response = await fetch('/api/openstad/api/project/delete-duplicated-data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ...duplicatedData }),
      });

      if (!response.ok) {
        throw new Error('Failed to delete duplicated data');
      }

      toast.success('Gedupliceerde project en gedupliceerde data is verwijderd.');
    } catch (error) {
      toast.error('Verwijderen niet gelukt. Neem contact op met de beheerders.');
    } finally {
      setRemovePreviousDuplicatedDataInProgress(false);
      setErrors([]);
      setIsErrorsVisible(false);
      setDuplicatedData([]);
    }
  }

  async function duplicate(values: z.infer<typeof formSchema>) {
    setDuplicatingInProgress(true);
    setDuplicatedData([]);

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
      skipDefaultStatuses: true,
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

    setDuplicatingInProgress(false);

    if (!response.ok) {
      const responseJSON = await response.json();
      setErrors(responseJSON.errors || [{error: "There was an error trying to duplicate the project", step: "Duplicate project"}]);
      setDuplicatedData(responseJSON.duplicatedData || []);
      toast.error('Er is een fout opgetreden bij het dupliceren van het project.');

      return;
    }

    const newId = await response.json();
    toast.success('Er is een kopie van het project aangemaakt. Je wordt nu doorgestuurd naar de projecten pagina.', {
      duration: 5000
    });

    setTimeout(() => {
      if (newId) {
        router.push(`/projects/${newId}/widgets`);
      }
    }, 4000);
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
                <Button type="submit" variant={'default'} disabled={duplicatingInProgress}>
                  {duplicatingInProgress ? 'Bezig met dupliceren' : 'Dupliceren'}
                </Button>
              </form>
              {errors.length > 0 && (
                <div className="mt-4">
                  <br/>
                  <Separator className="my-4"/>
                  <Heading size="lg">Er is een fout opgetreden bij het dupliceren van het project.</Heading>
                  <div className="mt-4">
                    <p>De data is al (deels) gedupliceerd.
                      Als je de data wilt verwijderen, klik dan op de knop hieronder.</p>

                  <div className="flex mt-4">
                    <Button variant={'default'} disabled={removePreviousDuplicatedDataInProgress}
                            onClick={() => removePreviousDuplicatedData()} style={{marginRight: '15px'}}>
                      {removePreviousDuplicatedDataInProgress ? 'Bezig met verwijderen' : 'Verwijder laatste duplicaat'}
                    </Button>
                    <Button style={{backgroundColor: "red", color: "white"}}
                            onClick={() => setIsErrorsVisible(!isErrorsVisible)}>
                      {isErrorsVisible ? 'Verberg fouten' : 'Toon fouten'}
                    </Button>
                  </div>
                    {isErrorsVisible && (
                      <div className="mt-2 text-red-600">
                        <p style={{color: "black", marginBottom: "10px"}}>Er zijn fouten opgetreden. Als de fouten niet
                          duidelijk zijn, neem dan contact op met de beheerders.</p>
                        <ul>
                          {errors.map((error, index) => (
                            <li key={index}>{`${error.step} - ${error.error}`}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
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
