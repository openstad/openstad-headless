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
import { useRouter } from 'next/router';
import useArea from '@/hooks/use-areas';
import toast from 'react-hot-toast';

const formSchema = z.object({
  name: z.string(),
  geoJSON: z.string(),
});

export default function ProjectAreaCreate() {
  const router = useRouter();
  const projectId = router.query.project;
  const { createArea } = useArea();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver<any>(formSchema),
    defaultValues: {},
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const area = await createArea(values.name, values.geoJSON);
    if (area) {
      toast.success('Polygoon aangemaakt!');
      router.push(`/projects/${projectId}/areas`);
    } else {
      toast.error('De polygoon die is meegegeven lijkt niet helemaal te kloppen.')
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
            name: 'Polygon toevoegen',
            url: `/projects/${projectId}/areas/create`,
          },
        ]}>
        <div className="p-6 bg-white rounded-md">
          <Form {...form}>
            <Heading size="xl">Toevoegen</Heading>
            <Separator className="my-4" />
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="lg:w-1/2 grid grid-cols-1 gap-x-4 gap-y-8">
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
                name="geoJSON"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Polygoon</FormLabel>
                    <p>
                      Je kan hier een polygoon aanmaken om een gebied op te
                      geven waar je kaarten op zullen focussen. Voor deze
                      polygoon kan je de waarden ophalen vanaf de volgende
                      pagina: https://geojson.io
                    </p>
                    <FormControl>
                      <Textarea placeholder="" {...field} />
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
