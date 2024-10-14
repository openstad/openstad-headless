import React, { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {useFieldArray, useForm} from 'react-hook-form';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl, FormDescription,
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
import { useRouter } from 'next/router';
import toast from 'react-hot-toast';
import useDatalayers from "@/hooks/use-datalayers";
import {ImageUploader} from "@/components/image-uploader";
import {X} from "lucide-react";
import {YesNoSelect} from "@/lib/form-widget-helpers";

const formSchema = z.object({
  name: z.string(),
  layer: z.string().optional(),
  icon: z
    .array(z.object({ url: z.string() }))
    .optional()
    .default([]),
  iconUploader: z.string().optional(),
  webserviceUrl: z.string().optional(),
  useRealtimeWebservice: z.boolean().default(false),
});

export default function ProjectDatalayerCreate(props: any) {
  const router = useRouter();
  const projectId = router.query.project;
  const { createDatalayer } = useDatalayers();
  const [isLoading, setIsLoading] = useState(false);
  const [fetchError, setFetchError] = useState('');
  const [progress, setProgress] = useState(0);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver<any>(formSchema),
    defaultValues: {},
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const area = await createDatalayer( {...values} );
    if (area) {
      toast.success('Kaartlaag aangemaakt!');
      router.push(`/projects/${projectId}/areas`);
    } else {
      toast.error('De kaartlaag die is meegegeven lijkt niet helemaal te kloppen.')
    }
  }

  const { fields: iconField, remove: removeImage } = useFieldArray({
    control: form.control,
    name: 'icon',
  });

  function updateProgress(value: number) {
    setProgress((prev) => Math.min(prev + value, 100));
  }

  function sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Add default parameters to the URL to fetch all data
  async function getSupportedParams(url: string) {
    const testParams = [
      { key: 'limit', value: 999999 },
      { key: 'page_size', value: 999999 },
      { key: 'all', value: true },
      { key: 'fetch_all', value: true },
      { key: 'offset', value: 0 },
      { key: 'page', value: 1 },
      { key: 'sort', value: 'created_at desc' }
    ];

    const supportedParams = {};
    const increment = 100 / (testParams.length - 1);

    for (const param of testParams) {
      // Wait a bit to prevent rate limiting (and to make the progress bar more interesting)
      await sleep(200);

      const testUrl = new URL(url, 'http://localhost');
      testUrl.searchParams.append(param.key, String(param.value));

      const encodedUrl = encodeURIComponent(testUrl.toString());
      const proxyUrl = `/api/openstad/api/proxy?url=${encodedUrl}`;

      try {
        const response = await fetch(proxyUrl);
        if (response.ok) {
          // Parameter wordt ondersteund
          supportedParams[param.key] = param.value;
        }
      } catch (error) {
      }

      updateProgress(increment);
    }

    return supportedParams;
  }

  async function getWebserviceData() {
    const webserviceUrl = form.getValues('webserviceUrl');
    if (!webserviceUrl) {
      toast.error('Voer eerst een geldige Webservice URL in.');
      return;
    }

    setIsLoading(true);
    setFetchError('');
    setProgress(0);

    try {
      const supportedParams = await getSupportedParams(webserviceUrl);
      const urlObj = new URL(webserviceUrl, 'http://localhost');

      for (const [key, value] of Object.entries(supportedParams)) {
        urlObj.searchParams.append(key, String(value));
      }

      const encodedUrl = encodeURIComponent(urlObj.toString());

      const response = await fetch(`/api/openstad/api/proxy?url=${encodedUrl}`);
      if (!response.ok) {
        throw new Error('Fout bij het ophalen van de data.');
      }
      const data = await response.json();
      form.setValue('layer', JSON.stringify(data, null, 2));
      toast.success('Webservice succesvol opgehaald!');
    } catch (error) {
      setFetchError('Kan de webservice niet bereiken.');
    } finally {
      setIsLoading(false);
      setTimeout(() => setProgress(0), 1000);
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
            name: 'Polygonen',
            url: `/projects/${projectId}/areas`,
          },
          {
            name: 'Kaartlaag toevoegen',
            url: `/projects/${projectId}/areas/create-datalayer`,
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

              <ImageUploader
                form={form}
                fieldName="iconUploader"
                imageLabel="Icoon op de kaart"
                description="De ideale afmetingen voor een icoon zijn 30x40 pixels."
                allowedTypes={['image/*']}
                onImageUploaded={(imageResult) => {
                  let array = [...(form.getValues('icon') || [])];
                  array.push(imageResult);
                  form.setValue('icon', array);
                  form.resetField('iconUploader');
                  form.trigger('icon');
                }}
              />
              <div className="space-y-2 col-span-full md:col-span-1 flex flex-col">
                {iconField.length > 0 && (
                  <>
                    <label
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Geüpload icoon</label>
                    <section className="grid col-span-full grid-cols-3 gap-x-4 gap-y-8 ">
                      {iconField.map(({id, url}, index) => {
                        return (
                          <div key={id} className="relative">
                            <img src={url} alt={url}/>
                            <Button
                              color="red"
                              onClick={() => {
                                removeImage(index);
                              }}
                              className="absolute right-0 top-0">
                              <X size={24}/>
                            </Button>
                          </div>
                        );
                      })}
                    </section>
                  </>
                )}
              </div>

              <FormField
                control={form.control}
                name="useRealtimeWebservice"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Wil je dat de data wordt opgehaald via een webservice?
                    </FormLabel>
                    {YesNoSelect(field, {})}
                  </FormItem>
                )}
              />

              { form.watch('useRealtimeWebservice') && (
                <>
                <FormField
                  control={form.control}
                  name="webserviceUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Webservice URL</FormLabel>
                      <FormDescription>
                        Vul hier de URL in van de webservice die je wilt gebruiken om realtime data op te halen.
                        Wanneer deze optie is ingeschakeld, zal de webservice automatisch gegevens blijven ophalen en bijwerken.
                        De opgegeven URL moet verwijzen naar een API of andere service die actuele gegevens levert.
                        Zorg ervoor dat de URL correct is en dat de webservice beschikbaar is, zodat de data succesvol kan worden opgehaald en weergegeven.
                        Je kunt controleren of de webservice correct werkt door op de knop 'Haal data op' te klikken.
                      </FormDescription>
                      <FormControl>
                        <Input placeholder="" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button
                  type="button"
                  onClick={getWebserviceData}
                  disabled={isLoading}
                  className="mt-2"
                >
                  {isLoading ? 'Laden...' : 'Haal data op'}
                </Button>
                  {isLoading && (
                    <div className="relative w-full h-2 bg-gray-200 rounded">
                      <div
                        className="absolute top-0 left-0 h-full bg-blue-500 rounded transition-width duration-500"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  )}
                  {fetchError && <p className="text-red-500 mt-2">{fetchError}</p>}
                </>
              )}

              <FormField
                control={form.control}
                name="layer"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Kaartlaag</FormLabel>
                    <p>
                      Hier kun je een kaartlaag toevoegen. Een kaartlaag is een extra set informatie die je op de kaart wilt tonen, bijvoorbeeld een route, punten of gebieden. Om deze kaartlaag te maken, moet je een JSON-bestand uploaden.
                    </p>
                    <FormControl>
                      <Textarea placeholder="" {...field} rows={12}/>
                    </FormControl>
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
