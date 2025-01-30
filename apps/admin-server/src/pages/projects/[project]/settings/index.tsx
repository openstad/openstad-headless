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
import { Dialog, DialogTrigger, DialogContent, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';

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
  projectToggle: z.boolean().optional(),
});



export default function ProjectSettings() {

  const router = useRouter();
  const { project } = router.query;
  const { data, isLoading, updateProject } = useProject(['includeInstallationUrls']);

  const [checkboxInitial, setCheckboxInitial] = useState(true);
  const [showUrl, setShowUrl] = useState(false);
  const [projectHasEnded, setProjectHasEnded] = useState(false);
  const [basicAuthActive, setBasicAuthActive] = useState(false);
  const [basicAuthInitial, setBasicAuthInitial] = useState(true);

  const [isDialogOpen, setIsDialogOpen] = useState(false);

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
        projectToggle: data?.config?.project?.projectToggle || false,
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
      if (data?.config?.project?.projectToggle) {
        setShowUrl(true);
        setCheckboxInitial(false);
      }

      if (data?.url) {
        form.setValue('projectToggle', true);
        setShowUrl(true);
        setCheckboxInitial(false);
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
            endDate: values.endDate,
            projectToggle: values.projectToggle,
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
  async function archiveProject() {
    if (!data?.config?.project?.projectHasEnded) {
      toast.error('Het project moet eerst beëindigd worden voordat deze actie uitgevoerd kan worden.');
      return;
    }

    try {
      const res = await fetch(`/api/openstad/api/project/${project as string}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (res.ok) {
        toast.success('Project gearchiveerd!');
        router.push('/projects');
      } else {
        toast.error('Er is helaas iets mis gegaan.');
      }
    } catch (error) {
      console.error('could not delete', error);
    }
  }

  const onCopy = (textToBeCopied: string, toastStart: string) => {
    navigator.clipboard.writeText(textToBeCopied);
    toast.success(`${toastStart} gekopieerd naar klembord`);
  };

  const [apiUrl, setApiUrl] = useState('');
  const [imgUrl, setImgUrl] = useState('');
  const [cdnUrls, setCdnUrls] = useState<string[]>([]);
  const [cssUrl, setCssUrl] = useState('');

  useEffect(() => {
    if (!data || typeof data == 'undefined') return;

    const cssUrl = data?.config?.project?.cssUrl;

    try {
      const url = new URL(cssUrl);
      if (url.hostname !== 'openstad-cdn.nl') {
        setCssUrl(cssUrl);
      }
    } catch (e) {}

    setApiUrl(data.installationUrls?.api || '');
    setImgUrl(data.installationUrls?.img || '');

    const cdns = [
      'https://openstad-cdn.nl'
    ];

    if (process.env.REACT_CDN) {
      let reactCdn = process.env.REACT_CDN;
      if (!reactCdn.startsWith('http')) {
        reactCdn = `https://${reactCdn}`;
      }
      cdns.push(reactCdn);
    }

    if (process.env.REACT_DOM_CDN) {
      let reactDomCdn = process.env.REACT_DOM_CDN;
      if (!reactDomCdn.startsWith('http')) {
        reactDomCdn = `https://${reactDomCdn}`;
      }
      cdns.push(reactDomCdn);
    }

    setCdnUrls(cdns);
  }, [data]);

  const cspHeader = `Content-Security-Policy: 
  default-src 'self'; 
  script-src 'self' ${apiUrl} ${cdnUrls.join(' ')}; 
  style-src 'self' ${apiUrl} ${cdnUrls.join(' ')} ${cssUrl}; 
  style-src-elem 'self' ${apiUrl} ${cdnUrls.join(' ')} ${cssUrl}; 
  img-src 'self' ${imgUrl} https://service.pdok.nl/ data:; 
  form-action 'self' ${apiUrl};
  font-src ${cdnUrls.join(' ')} 'self' data:;
  connect-src ${apiUrl} 'self';`;

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
              <TabsTrigger value="csp">Beveiligingsheaders</TabsTrigger>
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

                    <FormField
                      control={form.control}
                      name="projectToggle"
                      render={({ field }) => (
                        <FormItem className="col-span-1">
                          <FormLabel>
                            Wil je een website voor dit project?
                          </FormLabel>
                          <Switch.Root
                            className="block w-[50px] h-[25px] bg-stone-300 rounded-full relative focus:shadow-[0_0_0_2px] focus:shadow-black data-[state=checked]:bg-primary outline-none cursor-default"
                            onCheckedChange={(e: boolean) => {
                              field.onChange(e);
                              setShowUrl(!showUrl)
                            }}
                            checked={field.value}>
                            <Switch.Thumb className="block w-[21px] h-[21px] bg-white rounded-full transition-transform duration-100 translate-x-0.5 will-change-transform data-[state=checked]:translate-x-[27px]" />
                          </Switch.Root>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

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
            <TabsContent value={'csp'} className="p-0">
              <div className={'p-6 bg-white rounded-md'}>
                <Heading size={'xl'}>Content-Security-Policy header</Heading>
                <Separator className="my-4" />
                <div className="space-y-4">
                  <div>
                    Indien je gebruik wilt maken van de Content-Security-Policy header, dan vind je hieronder de standaardheader die je kunt gebruiken. Deze kun je naar wens aanpassen.
                  </div>

                  <div>
                    <p>
                      <Textarea disabled={true} value={cspHeader} rows={14}/>
                    </p>
                  </div>
                  <div className="flex gap-4 p-0">
                    <Button onClick={() => onCopy(cspHeader, 'Content-Security-Policy header')}>Kopieer Content-Security-Policy header</Button>
                  </div>
                </div>
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

                  <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                      <Button variant="destructive">Project archiveren</Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogTitle>Bevestiging</DialogTitle>
                      <DialogDescription>
                        Weet je zeker dat je dit project wilt archiveren? Deze actie kan niet ongedaan gemaakt worden.
                      </DialogDescription>
                      <DialogFooter>
                        <Button variant="secondary" onClick={() => setIsDialogOpen(false)}>
                          Annuleren
                        </Button>
                        <Button
                          variant="destructive"
                          onClick={() => {
                            setIsDialogOpen(false);
                            archiveProject();
                          }}
                        >
                          Bevestigen
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>

              </div>
            </TabsContent>
          </Tabs>
        </div>
      </PageLayout>
    </div>
  );
}
