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
import {
  useRegisterFormSave,
  useSaveController,
} from '@/components/ui/save-controller';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { Heading } from '@/components/ui/typography';
import useDatalayers from '@/hooks/use-datalayers';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/router';
import React, { useCallback } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import * as z from 'zod';

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

  const { allowNextNavigation } = useSaveController();

  const save = useCallback(async () => {
    const valid = await form.trigger();
    if (!valid) {
      throw new Error('Controleer de gemarkeerde velden.');
    }
    const values = formSchema.parse(form.getValues());

    const area = await createDatalayer(values.name, values.layer);
    if (!area) {
      throw new Error(
        'De kaartlaag die is meegegeven lijkt niet helemaal te kloppen.'
      );
    }

    // A freshly created record is not an unsaved edit, so leaving this page
    // must not prompt. useRegisterFormSave re-baselines the form afterwards,
    // but that only reaches the controller on a later render -- the push
    // starts now, so the guard has to be told directly.
    allowNextNavigation();
    toast.success('Kaartlaag aangemaakt!');
    router.push(`/projects/${projectId}/areas`);
  }, [form, createDatalayer, router, projectId, allowNextNavigation]);

  useRegisterFormSave(form, save, { label: 'Aanmaken' });

  return (
    <div>
      <PageLayout
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
              onSubmit={(event) => event.preventDefault()}
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
                      Hier kun je een kaartlaag toevoegen. Een kaartlaag is een
                      extra set informatie die je op de kaart wilt tonen,
                      bijvoorbeeld een route, punten of gebieden. Om deze
                      kaartlaag te maken, moet je een JSON-bestand uploaden.
                    </p>
                    <FormControl>
                      <Textarea placeholder="" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </form>
          </Form>
        </div>
      </PageLayout>
    </div>
  );
}
