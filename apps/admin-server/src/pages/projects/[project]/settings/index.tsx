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
import { Input } from '@/components/ui/input';
import { PageLayout } from '@/components/ui/page-layout';
import { Heading } from '@/components/ui/typography';
import { Separator } from '@/components/ui/separator';
import { useRouter } from 'next/router';
import { useProject } from '../../../../hooks/use-project';
import { SimpleCalendar } from '@/components/simple-calender-popup';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import toast from 'react-hot-toast';
import { Checkbox } from '@/components/ui/checkbox';
import * as Switch from '@radix-ui/react-switch';

const formSchema = z.object({
  name: z.string().min(1, {
    message: 'De naam van een project mag niet leeg zijn!',
  }),
  username: z.string().optional(),
  password: z.string().optional(),
  endDate: z.date().min(new Date(), {
    message: 'De datum moet nog niet geweest zijn!',
  }),
  // We don't want to restrict this URL too much
  url: z.string().regex(/^(?:([a-z0-9.:\-_\/]+))?$/g, {
    message: 'De URL mag alleen kleine letters, cijfers, punten, dubbele punten, koppeltekens, onderstrepingstekens en schuine strepen bevatten.'
  }).optional(),
  basicAuthActive: z.coerce.boolean().optional(),
});



export default function ProjectSettings() {

  const router = useRouter();
  const { project } = router.query;
  const { data, isLoading, updateProject } = useProject();

  const [checkboxInitial, setCheckboxInitial] = useState(true);
  const [showUrl, setShowUrl] = useState(false);
  const [projectHasEnded, setProjectHasEnded] = useState(false);
  const [basicAuthActive, setBasicAuthActive] = useState(false);
  const [basicAuthInitial, setBasicAuthInitial] = useState(true);

  const defaults = useCallback(
    () => {
      const currentDate = new Date();


      return {
      name: data?.name || '',
      endDate: data?.config?.project?.endDate
        ? new Date(data?.config?.project?.endDate)
        : new Date(currentDate.getFullYear(), currentDate.getMonth() + 3),
      url: data?.url || '',
      basicAuthActive: data?.config?.basicAuth?.active || false,
      username: data?.config?.basicAuth?.username || '',
      password: data?.config?.basicAuth?.password || '',
    }
    },
    [data]
  );

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver<any>(formSchema),
    defaultValues: defaults(),
  });

  useEffect(() => {
    form.reset(defaults());
    // if(basicAuthActive !== data?.config?.basicAuth?.active)
    //   setBasicAuthActive(data?.config?.basicAuth?.active);
  }, [form, defaults]);

  useEffect(() => {
    if (checkboxInitial) {
      if (data?.url) {
        setShowUrl(true)
        setCheckboxInitial(false)
      }
      setProjectHasEnded(data?.config?.project?.projectHasEnded)
    }

    if (basicAuthInitial) {
      setBasicAuthActive(data?.config?.basicAuth?.active)
      setBasicAuthInitial(false)
    }
  }, [data, checkboxInitial]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      const project = await updateProject(
        {
          project: {
            endDate: values.endDate
          },
          basicAuth: {
            active: values.basicAuthActive,
            username: values.username,
            password: values.password
          }
        },
        values.name,
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

  async function saveProjectHasEnded(value: boolean) {
    try {
      const project = await updateProject(
        {
          project: {
            projectHasEnded: value
          }
        }
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
              <TabsTrigger value="projecthasended">Project beëindigen</TabsTrigger>
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
                    className="grid grid-cols-2 gap-x-4 gap-y-8">
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
                      fieldInfo="Na deze datum is het automatisch niet meer mogelijk om plannen in te dienen, reacties te plaatsen en te stemmen."
                    />

                    <div>
                      <FormLabel>
                        Wil je een website voor dit project?
                      </FormLabel>
                      <Switch.Root
                        className="block w-[50px] h-[25px] bg-stone-300 rounded-full relative focus:shadow-[0_0_0_2px] focus:shadow-black data-[state=checked]:bg-primary outline-none cursor-default mt-2"
                        onCheckedChange={(e: boolean) => {
                          setShowUrl(!showUrl)
                        }}
                        checked={showUrl}>
                        <Switch.Thumb className="block w-[21px] h-[21px] bg-white rounded-full transition-transform duration-100 translate-x-0.5 will-change-transform data-[state=checked]:translate-x-[27px]" />
                      </Switch.Root>
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
                    <div>
                    <FormField
                        control={form.control}
                        name="basicAuthActive"
                        render={ function ({ field }) {
                          setBasicAuthActive(field.value ?? false);
                          return(
                          <FormItem className="col-span-full md:col-span-1 flex flex-col">
                            <FormLabel>
                              Wil je de website beveiligen met een gebruikersnaam en wachtwoord?
                            </FormLabel>
                            <Switch.Root
                              className="block w-[50px] h-[25px] bg-stone-300 rounded-full relative focus:shadow-[0_0_0_2px] focus:shadow-black data-[state=checked]:bg-primary outline-none cursor-default mt-2"
                              onCheckedChange={(e: boolean) => {
                                setBasicAuthActive(!basicAuthActive)
                                field.onChange(e);
                              }}
                              checked={field.value}>
                              <Switch.Thumb className="block w-[21px] h-[21px] bg-white rounded-full transition-transform duration-100 translate-x-0.5 will-change-transform data-[state=checked]:translate-x-[27px]" />
                            </Switch.Root>
                        </FormItem>)
                      }}
                    />
                    </div>
                    {basicAuthActive ? (
                      <>
                        <FormField
                          control={form.control}
                          name="username"
                          render={({ field }) => (
                            <FormItem className="col-span-full md:col-span-1 flex flex-col">
                              <FormLabel>Gebruikersnaam</FormLabel>
                              <FormControl>
                                <Input placeholder="Gebruikersnaam" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="password"
                          render={({ field }) => (
                            <FormItem className="col-span-full md:col-span-1 flex flex-col">
                              <FormLabel>Wachtwoord</FormLabel>
                              <FormControl>
                                <Input placeholder="Wachtwoord" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </>
                    ) : null}
                    <Button className="w-fit col-span-full" type="submit">
                      Opslaan
                    </Button>
                  </form>
                </Form>
              </div>
            </TabsContent>
            <TabsContent value="projecthasended" className="p-0">
              <div className="p-6 bg-white rounded-md">
                <Heading size="xl">Project beëindigen</Heading>
                <Separator className="my-4" />
                <div className="space-y-4">
                  <div>
                    Wanneer je het project beëindigt, sluiten automatisch de mogelijkheden om plannen in te dienen, reacties te plaatsen en te stemmen.
                  </div>
                  <div>
                    Project beëindigen
                    <Switch.Root
                      className="block w-[50px] h-[25px] bg-stone-300 rounded-full relative focus:shadow-[0_0_0_2px] focus:shadow-black data-[state=checked]:bg-primary outline-none cursor-default mt-2"
                      onCheckedChange={(e: boolean) => {
                        setProjectHasEnded(!projectHasEnded)
                      }}
                      checked={projectHasEnded}>
                      <Switch.Thumb className="block w-[21px] h-[21px] bg-white rounded-full transition-transform duration-100 translate-x-0.5 will-change-transform data-[state=checked]:translate-x-[27px]" />
                    </Switch.Root>
                  </div>
                  <Button
                    className="mt-4 w-fit"
                    onClick={() => saveProjectHasEnded(projectHasEnded)}>
                    Opslaan
                  </Button>
                </div>
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
                  Het project moet eerst zijn beëindigd voordat deze actie uitgevoerd kan worden.
                  </div>
                  <Button
                    variant={'destructive'}
                    className="mt-4 w-fit"
                    onClick={() => { }}>
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
