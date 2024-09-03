import * as React from 'react';
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
import { useCallback, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useProject } from '../../../../hooks/use-project';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import toast from 'react-hot-toast';
import InfoDialog from '@/components/ui/info-hover';

const formSchema = z.object({
  anonymizeUsersXDaysAfterEndDate: z.coerce.number(),
  warnUsersAfterXDaysOfInactivity: z.coerce.number(),
  anonymizeUsersAfterXDaysOfInactivity: z.coerce.number(),
});

const emailFormSchema = z.object({
  subject: z.string(),
  template: z.string(),
});

export default function ProjectSettingsAnonymization() {
  const category = 'anonymize';

  const router = useRouter();
  const { project } = router.query;
  const {
    data,
    isLoading,
    updateProject,
    updateProjectEmails,
    anonymizeUsersOfProject,
  } = useProject();
  const defaults = useCallback(
    () => ({
      anonymizeUsersXDaysAfterEndDate:
        data?.config?.[category]?.anonymizeUsersXDaysAfterEndDate || null,
      warnUsersAfterXDaysOfInactivity:
        data?.config?.[category]?.warnUsersAfterXDaysOfInactivity || null,
      anonymizeUsersAfterXDaysOfInactivity:
        data?.config?.[category]?.anonymizeUsersAfterXDaysOfInactivity || null,
    }),
    [data?.config]
  );

  const emailDefaults = useCallback(
    () => ({
      subject:
        data?.emailConfig?.[category]?.inactiveWarningEmail?.subject || null,
      template:
        data?.emailConfig?.[category]?.inactiveWarningEmail?.template || null,
    }),
    [data?.emailConfig]
  );

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver<any>(formSchema),
    defaultValues: defaults(),
  });

  const emailForm = useForm<z.infer<typeof emailFormSchema>>({
    resolver: zodResolver<any>(emailFormSchema),
    defaultValues: emailDefaults(),
  });

  useEffect(() => {
    form.reset(defaults()), emailForm.reset(emailDefaults());
  }, [form, defaults, emailForm, emailDefaults]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      const project = await updateProject({
        [category]: values,
      });
      if (project) {
        toast.success('Project aangepast!');
      } else {
        toast.error('Er is helaas iets mis gegaan.')
      }
    } catch (error) {
      console.error('Could not update', error);
    }
  }

  async function onSubmitEmail(values: z.infer<typeof emailFormSchema>) {
    try {
      await updateProjectEmails({
        [category]: {
          inactiveWarningEmail: {
            subject: values.subject,
            template: values.template,
          },
        },
      });
    } catch (error) {
      console.error('Could not update', error);
    }
  }

  async function anonymizeAllUsers() {
    try {
      await anonymizeUsersOfProject();
    } catch (error) {
      console.error('Could not anonymize the users', error);
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
            name: 'Anonimiseer gebruikers',
            url: `/projects/${project}/settings/anonymization`,
          },
        ]}>
        <div className="container py-6">
          <Tabs defaultValue="general">
            <TabsList className="w-full bg-white border-b-0 mb-4 rounded-md">
              <TabsTrigger value="general">Algemene instellingen</TabsTrigger>
              <TabsTrigger value="advanced">
                Geavanceerde instellingen
              </TabsTrigger>
            </TabsList>
            <TabsContent value="general" className="p-0">
              <div className="p-6 bg-white rounded-md">
                <Form {...form}>
                  <Heading size="xl">Anonimiseer gebruikers</Heading>
                  <Separator className="my-4" />
                  <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="space-y-4 lg:w-1/2">
                    <FormField
                      control={form.control}
                      name="anonymizeUsersXDaysAfterEndDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            Na hoeveel dagen na het einde van het project worden gebruikers geanonimiseerd?
                            <InfoDialog content={'Na het aantal ingevoerde dagen worden automatisch alle voor- en achternamen van gebruikers van de website aangepast naar "gebruiker verwijderd".'} />
                          </FormLabel>
                          <FormControl>
                            <Input type="number" placeholder="60" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="warnUsersAfterXDaysOfInactivity"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            Na hoeveel dagen inactiviteit krijgen gebruikers een waarschuwing?
                            <InfoDialog content={'Na het ingevoerde aantal dagen krijgen geregistreerde gebruikers van het project automatisch een mailtje dat hun account geanonimiseerd gaat worden. De tekst van deze mail kun je hieronder aanpassen.'} />
                          </FormLabel>
                          <FormControl>
                            <Input type="number" placeholder="180" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="anonymizeUsersAfterXDaysOfInactivity"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            Na hoeveel dagen aan inactiviteit worden gebruikers
                            automatisch geanonimiseerd?
                          </FormLabel>
                          <FormControl>
                            <Input type="number" placeholder="200" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button type="submit">Opslaan</Button>
                  </form>
                </Form>
              </div>
              <div className="p-6 bg-white rounded-md mt-4">
                <Form {...emailForm}>
                  <Heading size="xl">Waarschuwingsmail inactiviteit<InfoDialog content={'Content voor een waarschuwings email'} /></Heading>
                  

                  <Separator className="my-4" />
                  <form
                    onSubmit={emailForm.handleSubmit(onSubmitEmail)}
                    className="space-y-4 lg:w-1/2">
                    <FormField
                      control={emailForm.control}
                      name="subject"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>E-mail template onderwerp</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={emailForm.control}
                      name="template"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>E-mail template tekst</FormLabel>
                          <FormControl>
                            <Textarea rows={12} {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button type="submit">Opslaan</Button>
                  </form>
                </Form>
              </div>
            </TabsContent>
            <TabsContent value="advanced" className="p-0">
              <div className="p-6 bg-white rounded-md">
                <Heading size="xl">Gebruikersgegevens anonimiseren</Heading>
                <Separator className="my-4" />
                <div>
                  Let op! Deze actie is <b>definitief</b> en
                  <b> kan niet ongedaan gemaakt worden</b>.
                </div>
                <div className="mt-2">
                  Het project moet eerst zijn beëindigd voordat deze actie uitgevoerd kan worden.
                </div>
                <Button
                  variant={'destructive'}
                  className="mt-4 w-fit"
                  onClick={() => {
                    anonymizeAllUsers();
                  }}>
                  Gebruikersgegevens anonimiseren
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </PageLayout>
    </div>
  );
}
