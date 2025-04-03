import React, {useEffect, useState} from 'react';
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
import { getApiFetchMethodNames } from '@openstad-headless/data-store/src/api/index';
import useTag from '@/hooks/use-tags';
import toast from 'react-hot-toast';
import InfoDialog from '@/components/ui/info-hover';

const formSchema = z.object({
  name: z.string(),
  type: z.string(),
  seqnr: z.coerce.number(),
  addToNewResources: z.boolean(),
});

export default function ProjectTagCreate() {
  const router = useRouter();
  const project = router.query.project;
  const { createTag } = useTag(project as string);
  const [disabled, setDisabled]  = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver<any>(formSchema),
    defaultValues: {},
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const tag = await createTag(values.name, values.type, values.seqnr, values.addToNewResources);
    if (tag?.id) {
      toast.success('Tag aangemaakt!');
      router.push(`/projects/${project}/tags`);
    } else {
      toast.error('Er is helaas iets mis gegaan.')
    }
  }

  const apiFetchMethodNames = getApiFetchMethodNames();

  useEffect(() => {
    const type = form.watch('type');

    if ( !!apiFetchMethodNames && Array.isArray(apiFetchMethodNames) && apiFetchMethodNames.includes(type) ) {
      form.setError('type', {type: 'manual', message: `${type} valt onder de benamingen die niet gebruikt mag worden wegens mogelijke conflicten.`});
      setDisabled(true);
    } else {
      form.clearErrors(['type'])
      setDisabled(false);
    }

  }, [ form.watch('type') ] );

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
            name: 'Tags',
            url: `/projects/${project}/tags`,
          },
          {
            name: 'Tag toevoegen',
            url: `/projects/${project}/tags/create`,
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
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Type</FormLabel>
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
                    <FormLabel>
                      Sequence nummer
                      <InfoDialog content={'Dit nummer bepaalt de volgorde waarin de tags worden getoond. Automatisch worden tientallen gegenereerd, zodat je later ruimte hebt om tags tussen te voegen.'} />
                      </FormLabel>
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
              <Button
                className="w-fit col-span-full"
                disabled={disabled}
                type="submit"
              >
                Opslaan
              </Button>
            </form>
          </Form>
        </div>
      </PageLayout>
    </div>
  );
}
