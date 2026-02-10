import React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useForm } from 'react-hook-form';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';
import { PageLayout } from '@/components/ui/page-layout';
import { Heading } from '@/components/ui/typography';
import { Separator } from '@/components/ui/separator';
import { useCallback, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useProject } from '../../../../hooks/use-project';
import toast from 'react-hot-toast';
import * as Switch from '@radix-ui/react-switch';

const formSchema = z.object({
  canCreateNewUsers: z.boolean().optional(),
});

export default function ProjectSettingsUsers() {
  const router = useRouter();
  const { project } = router.query;
  const { data, updateProject } = useProject();

  const defaults = useCallback(
    () => ({
      canCreateNewUsers: data?.config?.users?.canCreateNewUsers !== false,
    }),
    [data?.config]
  );

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver<any>(formSchema),
    defaultValues: defaults(),
  });

  useEffect(() => {
    form.reset(defaults());
  }, [form, defaults]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      const project = await updateProject({
        users: {
          canCreateNewUsers: values.canCreateNewUsers,
        },
      });
      if (project) {
        toast.success('Project aangepast!');
      } else {
        toast.error('Er is helaas iets mis gegaan.');
      }
    } catch (error) {
      console.error('could not update', error);
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
            name: 'Instellingen',
            url: `/projects/${project}/settings`,
          },
          {
            name: 'Gebruikers',
            url: `/projects/${project}/settings/users`,
          },
        ]}>
        <div className="container py-6">
          <Form {...form} className="p-6 bg-white rounded-md">
            <Heading size="xl">Gebruikers</Heading>
            <Separator className="my-4" />
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="w-5/6 grid grid-cols-1 lg:grid-cols-1 gap-x-4 gap-y-8">
              <FormField
                control={form.control}
                name="canCreateNewUsers"
                render={({ field }) => (
                  <FormItem className="col-span-1">
                    <FormLabel>
                      Nieuwe gebruikers kunnen worden aangemaakt
                    </FormLabel>
                    <FormDescription>
                      Wanneer een project wordt beëindigd, wordt deze instelling automatisch uitgeschakeld
                    </FormDescription>
                    <Switch.Root
                      className="block w-[50px] h-[25px] bg-stone-300 rounded-full relative focus:shadow-[0_0_0_2px] focus:shadow-black data-[state=checked]:bg-primary outline-none cursor-default mt-2"
                      onCheckedChange={(e: boolean) => {
                        field.onChange(e);
                      }}
                      checked={field.value}>
                      <Switch.Thumb className="block w-[21px] h-[21px] bg-white rounded-full transition-transform duration-100 translate-x-0.5 will-change-transform data-[state=checked]:translate-x-[27px]" />
                    </Switch.Root>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-fit col-span-full mt-4">
                Opslaan
              </Button>
            </form>
          </Form>
        </div>
      </PageLayout>
    </div>
  );
}
