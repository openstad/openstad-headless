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
import {YesNoSelect} from "@/lib/form-widget-helpers";
import {EditFieldProps} from "@/lib/form-widget-helpers/EditFieldProps";
import {NotificationForm} from "@/components/notification-form";
import useNotificationTemplate from "@/hooks/use-notification-template";

const formSchema = z.object({
  anonymizeUsersXDaysAfterEndDate: z.coerce.number(),
  warnUsersAfterXDaysOfInactivity: z.coerce.number(),
  anonymizeUsersAfterXDaysOfInactivity: z.coerce.number(),
  anonymizeUserName: z.string().optional(),
  allowAnonymizeUsersAfterEndDate: z.boolean().optional(),
});

const emailFormSchema = z.object({
  subject: z.string(),
  template: z.string(),
});

type ProjectSettingsAnonymizationProps = {
  anonymizeUsersXDaysAfterEndDate?: number;
  warnUsersAfterXDaysOfInactivity?: number;
  anonymizeUsersAfterXDaysOfInactivity?: number;
  anonymizeUserName?: string;
  allowAnonymizeUsersAfterEndDate?: boolean;
};

export default function ProjectSettingsAnonymization(
  props: ProjectSettingsAnonymizationProps &
    EditFieldProps<ProjectSettingsAnonymizationProps>
) {
  const category = 'anonymize';

  const router = useRouter();
  const { project } = router.query;
  const {
    data,
    isLoading,
    updateProject,
    anonymizeUsersOfProject,
  } = useProject();
  const defaults = useCallback(
    () => ({
      allowAnonymizeUsersAfterEndDate: data?.config?.[category]?.allowAnonymizeUsersAfterEndDate || false,
      anonymizeUsersXDaysAfterEndDate:
        data?.config?.[category]?.anonymizeUsersXDaysAfterEndDate || null,
      warnUsersAfterXDaysOfInactivity:
        data?.config?.[category]?.warnUsersAfterXDaysOfInactivity || null,
      anonymizeUsersAfterXDaysOfInactivity:
        data?.config?.[category]?.anonymizeUsersAfterXDaysOfInactivity || null,
      anonymizeUserName:
        data?.config?.[category]?.anonymizeUserName || 'Gebruiker is geanonimiseerd'
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

  async function anonymizeAllUsers() {
    try {
      await anonymizeUsersOfProject();
      toast.success('Alle gebruikers zijn geanonimiseerd!');
    } catch (error) {
      toast.error("Het project moet eerst zijn beëindigd voordat gebruikers geanonimiseerd kunnen worden.")
    }
  }

  const { data: notificationTemplates } = useNotificationTemplate(project as string);
  const template = notificationTemplates?.find((t: {type: string}) => t.type === 'user account about to expire');

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
                      name={`allowAnonymizeUsersAfterEndDate`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            Gebruikers automatisch anonimiseren na het beëindigen van het project?
                            <InfoDialog content={`Als je deze optie aanzet worden gebruikers na het aantal dagen dat je hieronder instelt automatisch geanonimiseerd. Dit gebeurt alleen als het project een einddatum heeft en deze datum is verstreken.`} />
                          </FormLabel>
                          {YesNoSelect(field, props)}
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    { !!form.watch("allowAnonymizeUsersAfterEndDate") && (
                      <FormField
                        control={form.control}
                        name="anonymizeUsersXDaysAfterEndDate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              Na hoeveel dagen na het einde van het project worden gebruikers geanonimiseerd?
                              <InfoDialog content={`Na het aantal ingevoerde dagen worden automatisch alle voor- en achternamen van gebruikers van de website aangepast naar "${ form.watch("anonymizeUserName") || "Gebruiker is geanonimiseerd" }".`} />
                            </FormLabel>
                            <FormControl>
                              <Input type="number" placeholder="60" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}

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
                    <FormField
                      control={form.control}
                      name="anonymizeUserName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            Hoe worden gebruikers genoemd na anonimisering?
                            <InfoDialog content={'Standaard wordt de naam van de gebruiker aangepast naar "Gebruiker is geanonimiseerd". Je kunt dit hier aanpassen naar een andere tekst.'} />
                          </FormLabel>
                          <FormControl>
                            <Input type="text" {...field} />
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
                  <NotificationForm
                    type="user account about to expire"
                    label="Gebruikersaccount staat op het punt te verlopen"
                    engine={template.engine}
                    id={template.id}
                    subject={template.subject}
                    body={template.body}
                  />

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
