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
import toast from 'react-hot-toast';
import useDatalayers from "@/hooks/use-datalayers";

const formSchema = z.object({
  name: z.string(),
  layer: z.string(),
});

export default function ProjectDatalayerCreate() {
  const router = useRouter();
  const projectId = router.query.project;
  const { createDatalayer } = useDatalayers();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver<any>(formSchema),
    defaultValues: {},
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const area = await createDatalayer(values.name, values.layer);
    if (area) {
      toast.success('Kaartlaag aangemaakt!');
      router.push(`/projects/${projectId}/areas`);
    } else {
      toast.error('De kaartlaag die is meegegeven lijkt niet helemaal te kloppen.')
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
