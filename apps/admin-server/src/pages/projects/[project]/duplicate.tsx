import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Heading } from '@/components/ui/typography';
import { useProject } from '@/hooks/use-project';
import { collectDuplicationPayload } from '@/lib/collect-duplication-payload';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/router';
import React, { useCallback, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import * as z from 'zod';

import { Button } from '../../../components/ui/button';
import { PageLayout } from '../../../components/ui/page-layout';

const formSchema = z.object({
  name: z.string().min(1, {
    message: 'De naam van een project mag niet leeg zijn!',
  }),
});

export default function ProjectDuplicate() {
  const router = useRouter();
  const { project } = router.query;
  const { data, isLoading, waitForDuplication } = useProject([
    'includeAuthConfig',
  ]);
  const [errors, setErrors] = useState<Array<{ step: string; error: string }>>(
    []
  );
  const [isErrorsVisible, setIsErrorsVisible] = useState(false);
  const [duplicatingInProgress, setDuplicatingInProgress] = useState(false);
  const [redirecting, setRedirecting] = useState(false);
  const [stillRunning, setStillRunning] = useState(false);
  const [
    removePreviousDuplicatedDataInProgress,
    setRemovePreviousDuplicatedDataInProgress,
  ] = useState(false);
  const [duplicatedData, setDuplicatedData] = useState<any>({});

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

  useEffect(() => {
    if (!project) return;
    let cancelled = false;

    (async () => {
      try {
        const res = await fetch(
          `/api/openstad/api/project/${project}/duplication-status`
        );
        if (!res.ok) {
          console.error(
            `Duplicatiestatus opvragen mislukt met status ${res.status}`
          );
          return;
        }
        const data = await res.json();
        if (cancelled || !data.previousFailure?.duplicatedData) return;
        setDuplicatedData(data.previousFailure.duplicatedData);
        setErrors(data.previousFailure.errors || []);
      } catch (e) {
        console.error('Duplicatiestatus opvragen mislukt', e);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [project]);

  if (!data) return null;

  const removePreviousDuplicatedData = async () => {
    setRemovePreviousDuplicatedDataInProgress(true);
    let rollbackSucceeded = false;

    try {
      const response = await fetch(
        '/api/openstad/api/project/delete-duplicated-data',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ ...duplicatedData }),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to delete duplicated data');
      }

      toast.success(
        'Gedupliceerde project en gedupliceerde data is verwijderd.'
      );
      rollbackSucceeded = true;
    } catch (error) {
      toast.error(
        'Verwijderen niet gelukt. Neem contact op met de beheerders.'
      );
    } finally {
      setRemovePreviousDuplicatedDataInProgress(false);
      if (rollbackSucceeded) {
        setErrors([]);
        setIsErrorsVisible(false);
        setDuplicatedData({});
      }
    }
  };

  async function duplicate(values: z.infer<typeof formSchema>) {
    setDuplicatingInProgress(true);
    setDuplicatedData({});

    try {
      const payload = await collectDuplicationPayload(data.id, data);

      const duplicateData = {
        ...payload,
        sourceProjectId: data.id,
        name: values.name,
        isDuplicateRequest: true,
      };

      const response = await fetch(`/api/openstad/api/project`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(duplicateData),
      });

      if (!response.ok) {
        const responseJSON = await response.json();
        setErrors(
          responseJSON.errors || [
            {
              error: 'There was an error trying to duplicate the project',
              step: 'Duplicate project',
            },
          ]
        );
        setDuplicatedData(responseJSON.duplicatedData || {});
        toast.error(
          'Er is een fout opgetreden bij het dupliceren van het project.'
        );
        return;
      }

      const body = await response.json();
      const newId = body?.id;
      if (!newId) {
        throw new Error('Geen project-id ontvangen');
      }

      const outcome = await waitForDuplication(newId);

      if (outcome.status === 'running') {
        setStillRunning(true);
        toast(
          'Het dupliceren duurt langer dan verwacht en gaat op de achtergrond door. Het project verschijnt vanzelf in het overzicht.',
          { duration: 8000 }
        );
        return;
      }

      if (outcome.status !== 'done') {
        setErrors(outcome.errors);
        setDuplicatedData(outcome.duplicatedData || {});
        toast.error(
          'Er is een fout opgetreden bij het dupliceren van het project.'
        );
        return;
      }

      toast.success(
        'Er is een kopie van het project aangemaakt. Je wordt nu doorgestuurd naar de projecten pagina.',
        {
          duration: 5000,
        }
      );

      setRedirecting(true);
      setTimeout(() => {
        router.push(`/projects/${newId}/widgets`);
      }, 4000);
    } catch (error) {
      setErrors([
        {
          step: 'Project dupliceren',
          error: 'Netwerkfout of ongeldig antwoord van de server.',
        },
      ]);
      toast.error(
        'Er is een fout opgetreden bij het dupliceren van het project.'
      );
    } finally {
      setDuplicatingInProgress(false);
    }
  }

  return (
    <div>
      <PageLayout
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
                  Bij het dupliceren van je project wordt er een compleet
                  identieke versie van het project aangemaakt in de database.
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
                <Button
                  type="submit"
                  variant={'default'}
                  disabled={
                    duplicatingInProgress || redirecting || stillRunning
                  }>
                  {duplicatingInProgress
                    ? 'Bezig met dupliceren'
                    : 'Dupliceren'}
                </Button>
              </form>
              {errors.length > 0 && (
                <div className="mt-4">
                  <br />
                  <Separator className="my-4" />
                  <Heading size="lg">
                    Er is een fout opgetreden bij het dupliceren van het
                    project.
                  </Heading>
                  <div className="mt-4">
                    {duplicatedData?.rollbackSessionId && (
                      <p>
                        De data is al (deels) gedupliceerd. Als je de data wilt
                        verwijderen, klik dan op de knop hieronder.
                      </p>
                    )}

                    <div className="flex mt-4">
                      {duplicatedData?.rollbackSessionId && (
                        <Button
                          variant={'default'}
                          disabled={removePreviousDuplicatedDataInProgress}
                          onClick={() => removePreviousDuplicatedData()}
                          style={{ marginRight: '15px' }}>
                          {removePreviousDuplicatedDataInProgress
                            ? 'Bezig met verwijderen'
                            : 'Verwijder laatste duplicaat'}
                        </Button>
                      )}
                      <Button
                        style={{ backgroundColor: 'red', color: 'white' }}
                        onClick={() => setIsErrorsVisible(!isErrorsVisible)}>
                        {isErrorsVisible ? 'Verberg fouten' : 'Toon fouten'}
                      </Button>
                    </div>
                    {isErrorsVisible && (
                      <div className="mt-2 text-red-600">
                        <p style={{ color: 'black', marginBottom: '10px' }}>
                          Er zijn fouten opgetreden. Als de fouten niet
                          duidelijk zijn, neem dan contact op met de beheerders.
                        </p>
                        <ul>
                          {errors.map((error, index) => (
                            <li
                              key={
                                index
                              }>{`${error.step} - ${error.error}`}</li>
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
