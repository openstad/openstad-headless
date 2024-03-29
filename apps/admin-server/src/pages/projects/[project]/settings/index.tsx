import * as React from 'react';
import { useCallback, useEffect, useState } from 'react';
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
import { FormObjectSelectField } from '@/components/ui/form-object-select-field';
import { Input } from '@/components/ui/input';
import { PageLayout } from '@/components/ui/page-layout';
import { Heading } from '@/components/ui/typography';
import { Separator } from '@/components/ui/separator';
import { useRouter } from 'next/router';
import useArea from '@/hooks/use-areas';
import { useProject } from '../../../../hooks/use-project';
import { SimpleCalendar } from '@/components/simple-calender-popup';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import toast from 'react-hot-toast';
import { Checkbox } from '@/components/ui/checkbox';

const formSchema = z.object({
  name: z.string().min(1, {
    message: 'De naam van een project mag niet leeg zijn!',
  }),
  endDate: z.date().min(new Date(), {
    message: 'De datum moet nog niet geweest zijn!',
  }),
  enableReactions: z.boolean(),
  cssUrl: z.string().optional(),
  areaId: z.string().optional(),
  // This URL regex is not perfect, but we don't want to restrict too much.
  // The main thing is that we want some text and a dot in the URL, and that we
  // don't want the protocol.
  url: z.string().regex(/^([a-z0-9]+\.[a-z0-9.]+)$/g, {
    message: 'De URL mag alleen kleine letters, cijfers en punten bevatten. Tip: gebruik geen https:// voor de URL'
  }).optional(),
});

export default function ProjectSettings() {

  const router = useRouter();
  const { project } = router.query;
  const { data, isLoading, updateProject } = useProject();
  const { data: areas } = useArea(project as string);

  let currentDate = new Date();
  const [checkboxInitial, setCheckboxInitial] = useState(true);
  const [showUrl, setShowUrl] = useState(false);

  const defaults = useCallback(
    () => ({
      name: data?.name || '',
      endDate: data?.config?.project?.endDate
        ? new Date(data?.config?.project?.endDate)
        : new Date(currentDate.getFullYear(), currentDate.getMonth()+3),
      enableReactions: data?.config?.resources?.enableReactions || false,
      cssUrl: data?.config?.project?.cssUrl || '',
      areaId: data?.areaId || '',
      url: data?.url || '',
    }),
    [data, areas]
  );

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver<any>(formSchema),
    defaultValues: defaults(),
  });

  useEffect(() => {
    form.reset(defaults());
  }, [form, defaults]);

  useEffect(() => {
    if (checkboxInitial) {
      if (data?.url) {
        setShowUrl(true)
        setCheckboxInitial(false)
      }
    }
  }, [data]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      const project = await updateProject(
        {
          project: {
            endDate: values.endDate,
            cssUrl: values.cssUrl,
          },
          resources: {
            enableReactions: values.enableReactions,
          },
        },
        values.name,
        values.areaId,
        values.url,
      );
      if (project) {
        toast.success('Project aangepast!');
      } else {
        toast.error('Er is helaas iets mis gegaan.')
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
        ]}>
        <div className="container py-6">
          <Tabs defaultValue="general">
            <TabsList className="w-full bg-white border-b-0 mb-4 rounded-md">
              <TabsTrigger value="general">Projectinformatie</TabsTrigger>
              <TabsTrigger value="advanced">
                Project archiveren
              </TabsTrigger>
            </TabsList>
            <TabsContent value="general" className="p-0">
              <div className="p-6 bg-white rounded-md">
                <Form {...form}>
                  <Heading size="xl">Projectinformatie</Heading>
                  <Separator className="my-4" />
                  <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem className="col-span-full md:col-span-1 flex flex-col">
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
                    <FormField
                      control={form.control}
                      name="enableReactions"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            Is het mogelijk om reacties te plaatsen?
                          </FormLabel>
                          <Select
                            onValueChange={(e: string) =>
                              field.onChange(e === 'true')
                            }
                            value={field.value ? 'true' : 'false'}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Nee" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="true">Ja</SelectItem>
                              <SelectItem value="false">Nee</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="cssUrl"
                      render={({ field }) => (
                        <FormItem className="col-span-full md:col-span-1 flex flex-col">
                          <FormLabel>URL voor CSS imports (optioneel)</FormLabel>
                          <FormControl>
                            <Input placeholder="Url" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormObjectSelectField
                      form={form}
                      fieldName="areaId"
                      fieldLabel="Polygon voor kaarten"
                      items={areas}
                      keyForValue="id"
                      label={(area:any) => `${area.name}`}
                      noSelection="&nbsp;"
                  />

                    <div>
                      <Checkbox checked={showUrl} onClick={(e) => setShowUrl(!showUrl)} className='mr-2'/>
                        <FormLabel>
                          Wil je een CMS URL instellen?
                        </FormLabel>
                    </div>
                    {showUrl ? (
                      <FormField
                      control={form.control}
                      name="url"
                      render={({ field }) => (
                        <FormItem className="col-span-full md:col-span-1 flex flex-col">
                          <FormLabel>Project URL</FormLabel>
                          <em className="text-xs">Let op: voer de URL in zonder https:// ervoor, bijv. &apos;plannen.openstad.org&apos;</em>
                          <FormControl>
                            <Input placeholder="Url" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    ) : null}
                    <Button className="w-fit col-span-full" type="submit">
                      Opslaan
                    </Button>
                  </form>
                </Form>
              </div>
            </TabsContent>
            <TabsContent value="advanced" className="p-0">
              <div className="p-6 bg-white rounded-md">
                <Heading size="xl">Project archiveren</Heading>
                <Separator className="my-4" />
                <div className="space-y-4">
                  <div>
                    Let op! Deze actie is <b>definitief</b> en
                    <b> kan niet ongedaan gemaakt worden</b>.
                  </div>
                  <div className="space-y-2">
                    Het project moet eerst aangemerkt staan als beëindigd
                    voordat deze actie uitgevoerd kan worden.
                  </div>
                  <Button
                    variant={'destructive'}
                    className="mt-4 w-fit"
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
