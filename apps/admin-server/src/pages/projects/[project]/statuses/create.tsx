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
import { PageLayout } from '@/components/ui/page-layout';
import {
  errorMessageOf,
  validateForSave,
} from '@/components/ui/save-controller';
import { Separator } from '@/components/ui/separator';
import { Heading } from '@/components/ui/typography';
import useStatus from '@/hooks/use-statuses';
import { YesNoSelect } from '@/lib/form-widget-helpers';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/router';
import React, { useCallback } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import * as z from 'zod';

const formSchema = z.object({
  name: z.string(),
  seqnr: z.coerce.number(),
  addToNewResources: z.boolean(),
});

export default function ProjectStatusCreate() {
  const router = useRouter();
  const project = router.query.project;
  const { createStatus } = useStatus(project as string);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver<any>(formSchema),
    defaultValues: { addToNewResources: false },
  });

  const save = useCallback(async () => {
    const valid = await validateForSave(form);
    if (!valid) {
      throw new Error('Controleer de gemarkeerde velden.');
    }
    const values = formSchema.parse(form.getValues());
    const status = await createStatus(
      values.name,
      values.seqnr,
      values.addToNewResources
    );
    if (!status?.id) {
      throw new Error('Er is helaas iets mis gegaan.');
    }

    toast.success('Status aangemaakt!');
    router.push(`/projects/${project}/statuses`);
  }, [form, createStatus, router, project]);

  async function submit() {
    try {
      await save();
    } catch (error) {
      toast.error(errorMessageOf(error));
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
            name: 'Statuses',
            url: `/projects/${project}/statuses`,
          },
          {
            name: 'Status toevoegen',
            url: `/projects/${project}/statuses/create`,
          },
        ]}>
        <div className="p-6 bg-white rounded-md">
          <Form {...form}>
            <Heading size="xl">Toevoegen</Heading>
            <Separator className="my-4" />
            <form
              onSubmit={(event) => {
                event.preventDefault();
                submit();
              }}
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
                name="seqnr"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sequence nummer</FormLabel>
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
