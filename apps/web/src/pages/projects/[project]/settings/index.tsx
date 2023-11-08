import * as React from 'react';
import { useEffect } from 'react';
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
import { PageLayout } from '@/components/ui/page-layout';
import { Heading } from '@/components/ui/typography';
import { Separator } from '@/components/ui/separator';
import { useRouter } from 'next/router';
import { useProject } from '../../../../hooks/use-project';
import { SimpleCalendar } from '@/components/simple-calender-popup';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const formSchema = z.object({
  name: z.string().min(1, {
    message: 'De naam van een project mag niet leeg zijn!',
  }),
  endDate: z.date().min(new Date(), {
    message: 'De datum moet nog niet geweest zijn!',
  }),
});

export default function ProjectSettings() {
  const category = 'project';

  const router = useRouter();
  const { project } = router.query;
  const { data, isLoading, updateProject } = useProject();
  const defaults = () => ({
    name: data?.name || null,
    endDate: data?.config?.[category]?.endDate
      ? new Date(data?.config?.[category]?.endDate)
      : new Date(),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver<any>(formSchema),
    defaultValues: defaults(),
  });

  useEffect(() => {
    form.reset(defaults());
  }, [data?.config]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const name = values.name;
    try {
      await updateProject(
        {
          [category]: {
            endDate: values.endDate,
          },
        },
        name
      );
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
        ]}>
        <div className="container py-6">
          <Tabs defaultValue="general">
            <TabsList className="w-full bg-white border-b-0 mb-4 rounded-md">
              <TabsTrigger value="general">Projectinformatie</TabsTrigger>
              <TabsTrigger value="advanced">
                Geadvanceerde instellingen
              </TabsTrigger>
            </TabsList>
            <TabsContent value="general" className="p-0">
              <div className="p-6 bg-white rounded-md">
                <Form {...form}>
                  <Heading size="xl">Projectinformatie</Heading>
                  <Separator className="my-4" />
                  <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="space-y-4">
                    <div className="grid grid-cols-2 gap-y-2 gap-x-4">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem className="col-span-2 md:col-span-1 flex flex-col">
                            <FormLabel>Projectnaam</FormLabel>
                            <FormControl>
                              <Input placeholder="Naam" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <SimpleCalendar
                        form={form}
                        fieldName="endDate"
                        label="Einddatum"
                      />
                    </div>
                    <Button className="self-end" type="submit">
                      Opslaan
                    </Button>
                  </form>
                </Form>
              </div>
            </TabsContent>
            <TabsContent value="advanced" className="p-0">
              <div className="p-6 bg-white rounded-md">
                <Heading size="xl" className="mb-4">
                  Project archiveren
                </Heading>
                <Separator className="my-4" />
                <div className="space-y-4">
                  <div>
                    Let op! Deze actie is <b>definitief</b> en
                    <b> kan niet ongedaan gemaakt worden</b>.
                  </div>
                  <div className="space-y-2">
                    Het project moet eerst aangemerkt staan als 'beëindigd'
                    voordat deze actie uitgevoerd kan worden.
                  </div>
                  <Button
                    variant={'destructive'}
                    className="mt-4 w-fit self-end"
                    onClick={() => {}}>
                    Project archiveren
                  </Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </PageLayout>
    </div>
  );
}
