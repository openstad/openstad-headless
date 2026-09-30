import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import InfoDialog from '@/components/ui/info-hover';
import { Input } from '@/components/ui/input';
import { PageLayout } from '@/components/ui/page-layout';
import {
  useRegisterFormSave,
  useSaveController,
} from '@/components/ui/save-controller';
import { Separator } from '@/components/ui/separator';
import { Heading } from '@/components/ui/typography';
import useTag from '@/hooks/use-tags';
import { YesNoSelect } from '@/lib/form-widget-helpers';
import { zodResolver } from '@hookform/resolvers/zod';
import { getApiFetchMethodNames } from '@openstad-headless/data-store/src/api/index';
import { useRouter } from 'next/router';
import React, { useCallback, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import * as z from 'zod';

const formSchema = z.object({
  name: z.string(),
  type: z.string(),
  seqnr: z.coerce.number(),
  addToNewResources: z.boolean().optional(),
});

export default function ProjectTagCreate({ preset }: { preset?: string }) {
  const isGlobal = !!preset && preset === 'global';

  const router = useRouter();
  const project = router.query.project;
  const { createTag } = useTag(isGlobal ? '0' : (project as string));
  const [disabled, setDisabled] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver<any>(formSchema),
    defaultValues: {},
  });

  const { allowNextNavigation } = useSaveController();

  const save = useCallback(async () => {
    if (disabled) {
      throw new Error(
        'Deze benaming mag niet gebruikt worden wegens mogelijke conflicten.'
      );
    }
    const valid = await form.trigger();
    if (!valid) {
      throw new Error('Controleer de gemarkeerde velden.');
    }
    const values = formSchema.parse(form.getValues());

    const tag = await createTag(
      values.name,
      values.type,
      values.seqnr,
      values.addToNewResources || false
    );
    if (!tag?.id) {
      throw new Error('Er is helaas iets mis gegaan.');
    }

    // A freshly created record is not an unsaved edit, so leaving this page
    // must not prompt. useRegisterFormSave re-baselines the form afterwards,
    // but that only reaches the controller on a later render -- the push
    // starts now, so the guard has to be told directly.
    allowNextNavigation();
    toast.success('Tag aangemaakt!');
    router.push(isGlobal ? '/settings' : `/projects/${project}/tags`);
  }, [
    form,
    createTag,
    router,
    project,
    isGlobal,
    disabled,
    allowNextNavigation,
  ]);

  useRegisterFormSave(form, save, { label: 'Aanmaken' });

  const apiFetchMethodNames = getApiFetchMethodNames();

  useEffect(() => {
    const type = form.watch('type');

    if (
      !!apiFetchMethodNames &&
      Array.isArray(apiFetchMethodNames) &&
      apiFetchMethodNames.includes(type)
    ) {
      form.setError('type', {
        type: 'manual',
        message: `${type} valt onder de benamingen die niet gebruikt mag worden wegens mogelijke conflicten.`,
      });
      setDisabled(true);
    } else {
      form.clearErrors(['type']);
      setDisabled(false);
    }
  }, [form.watch('type')]);

  return (
    <div>
      <PageLayout
        pageHeader={isGlobal ? 'Instellingen' : 'Projecten'}
        breadcrumbs={
          isGlobal
            ? [
                {
                  name: 'Instellingen',
                  url: '/settings',
                },
                {
                  name: 'Tag toevoegen',
                  url: `/settings/globaltags/create`,
                },
              ]
            : [
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
              ]
        }>
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
                      <InfoDialog
                        content={
                          'Dit nummer bepaalt de volgorde waarin de tags worden getoond. Automatisch worden tientallen gegenereerd, zodat je later ruimte hebt om tags tussen te voegen.'
                        }
                      />
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
            </form>
          </Form>
        </div>
      </PageLayout>
    </div>
  );
}
