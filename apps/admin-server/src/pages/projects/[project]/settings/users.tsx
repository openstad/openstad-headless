import { NotificationForm } from '@/components/notification-form';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import InfoDialog from '@/components/ui/info-hover';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PageLayout } from '@/components/ui/page-layout';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Heading } from '@/components/ui/typography';
import useNotificationTemplate from '@/hooks/use-notification-template';
import { YesNoSelect } from '@/lib/form-widget-helpers';
import { EditFieldProps } from '@/lib/form-widget-helpers/EditFieldProps';
import { zodResolver } from '@hookform/resolvers/zod';
import * as Switch from '@radix-ui/react-switch';
import { useRouter } from 'next/router';
import React from 'react';
import { useCallback, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import * as z from 'zod';

import { useProject } from '../../../../hooks/use-project';

const usersFormSchema = z.object({
  canCreateNewUsers: z.boolean().optional(),
});

const anonymizeFormSchema = z.object({
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

type ProjectSettingsUsersProps = {
  canCreateNewUsers?: boolean;
  anonymizeUsersXDaysAfterEndDate?: number;
  warnUsersAfterXDaysOfInactivity?: number;
  anonymizeUsersAfterXDaysOfInactivity?: number;
  anonymizeUserName?: string;
  allowAnonymizeUsersAfterEndDate?: boolean;
};

export default function ProjectSettingsUsers(
  props: ProjectSettingsUsersProps & EditFieldProps<ProjectSettingsUsersProps>
) {
  const router = useRouter();
  const { project } = router.query;
  const { data, updateProject, anonymizeUsersOfProject } = useProject();

  const anonymizeCategory = 'anonymize';

  const usersDefaults = useCallback(
    () => ({
      canCreateNewUsers: data?.config?.users?.canCreateNewUsers !== false,
    }),
    [data?.config]
  );

  const anonymizeDefaults = useCallback(
    () => ({
      allowAnonymizeUsersAfterEndDate:
        data?.config?.[anonymizeCategory]?.allowAnonymizeUsersAfterEndDate ||
        false,
      anonymizeUsersXDaysAfterEndDate:
        data?.config?.[anonymizeCategory]?.anonymizeUsersXDaysAfterEndDate ||
        null,
      warnUsersAfterXDaysOfInactivity:
        data?.config?.[anonymizeCategory]?.warnUsersAfterXDaysOfInactivity ||
        null,
      anonymizeUsersAfterXDaysOfInactivity:
        data?.config?.[anonymizeCategory]
          ?.anonymizeUsersAfterXDaysOfInactivity || null,
      anonymizeUserName:
        data?.config?.[anonymizeCategory]?.anonymizeUserName ||
        'Gebruiker is geanonimiseerd',
    }),
    [data?.config]
  );

  const emailDefaults = useCallback(
    () => ({
      subject:
        data?.emailConfig?.[anonymizeCategory]?.inactiveWarningEmail?.subject ||
        null,
      template:
        data?.emailConfig?.[anonymizeCategory]?.inactiveWarningEmail
          ?.template || null,
    }),
    [data?.emailConfig]
  );

  const usersForm = useForm<z.infer<typeof usersFormSchema>>({
    resolver: zodResolver<any>(usersFormSchema),
    defaultValues: usersDefaults(),
  });

  const anonymizeForm = useForm<z.infer<typeof anonymizeFormSchema>>({
    resolver: zodResolver<any>(anonymizeFormSchema),
    defaultValues: anonymizeDefaults(),
  });

  const emailForm = useForm<z.infer<typeof emailFormSchema>>({
    resolver: zodResolver<any>(emailFormSchema),
    defaultValues: emailDefaults(),
  });

  useEffect(() => {
    usersForm.reset(usersDefaults());
  }, [usersForm, usersDefaults]);

  useEffect(() => {
    anonymizeForm.reset(anonymizeDefaults());
    emailForm.reset(emailDefaults());
  }, [anonymizeForm, anonymizeDefaults, emailForm, emailDefaults]);

  async function onUsersSubmit(values: z.infer<typeof usersFormSchema>) {
    try {
      await updateProject({
        users: {
          canCreateNewUsers: values.canCreateNewUsers,
        },
      });
      toast.success('Project aangepast!');
    } catch (error) {
      toast.error('Er is helaas iets mis gegaan.');
      console.error('could not update', error);
    }
  }

  async function onAnonymizeSubmit(
    values: z.infer<typeof anonymizeFormSchema>
  ) {
    try {
      await updateProject({
        [anonymizeCategory]: values,
      });
      toast.success('Project aangepast!');
    } catch (error) {
      toast.error('Er is helaas iets mis gegaan.');
      console.error('Could not update', error);
    }
  }

  async function anonymizeAllUsers() {
    try {
      await anonymizeUsersOfProject();
      toast.success('Alle gebruikers zijn geanonimiseerd!');
    } catch (error) {
      toast.error(
        'Het project moet eerst zijn beëindigd voordat gebruikers geanonimiseerd kunnen worden.'
      );
    }
  }

  const [dangerZoneEnabled, setDangerZoneEnabled] = useState(false);

  const { data: notificationTemplates } = useNotificationTemplate(
    project as string
  );
  const template = notificationTemplates?.find(
    (t: { type: string }) => t.type === 'user account about to expire'
  );

  const sendEmail = data?.emailConfig?.notifications?.fromAddress;
  const isSendEmailNotSet = sendEmail === '' || sendEmail === 'email@not.set';

  return (
    <div>
      <PageLayout
        breadcrumbs={[
          { name: 'Projecten', url: '/projects' },
          { name: 'Instellingen', url: `/projects/${project}/settings` },
          { name: 'Archivering', url: `/projects/${project}/settings/users` },
        ]}>
        <div className="container py-6">
          <Tabs defaultValue="anonymize" className="w-full">
            <TabsList className="w-full bg-white border-b-0 mb-4 rounded-md">
              <TabsTrigger value="anonymize">Anonimiseren</TabsTrigger>
              <TabsTrigger value="users">Archivering</TabsTrigger>
            </TabsList>

            <TabsContent value="users" className="p-0">
              <Form {...usersForm} className="p-6 bg-white rounded-md">
                <Heading size="xl">Archivering</Heading>
                <Separator className="my-4" />
                <form
                  onSubmit={usersForm.handleSubmit(onUsersSubmit)}
                  className="w-5/6 grid grid-cols-1 lg:grid-cols-1 gap-x-4 gap-y-8">
                  <FormField
                    control={usersForm.control}
                    name="canCreateNewUsers"
                    render={({ field }) => (
                      <FormItem className="col-span-1">
                        <FormLabel>
                          Nieuwe gebruikers kunnen worden aangemaakt
                        </FormLabel>
                        <FormDescription>
                          Wanneer een project wordt beëindigd, wordt deze
                          instelling automatisch uitgeschakeld
                        </FormDescription>
                        <Switch.Root
                          className="block w-[50px] h-[25px] bg-stone-300 rounded-full relative focus:shadow-[0_0_0_2px] focus:shadow-black data-[state=checked]:bg-primary outline-none cursor-default mt-2"
                          onCheckedChange={(e: boolean) => field.onChange(e)}
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
            </TabsContent>

            <TabsContent value="anonymize" className="p-0">
              <div className="p-6 bg-white rounded-md">
                <Form {...anonymizeForm}>
                  <Heading size="xl">Anonimiseer gebruikers</Heading>
                  <Separator className="my-4" />
                  <form
                    onSubmit={anonymizeForm.handleSubmit(onAnonymizeSubmit)}
                    className="space-y-4 lg:w-1/2">
                    <FormField
                      control={anonymizeForm.control}
                      name="allowAnonymizeUsersAfterEndDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            Gebruikers automatisch anonimiseren na het
                            beëindigen van het project?
                            <InfoDialog content="Als je deze optie aanzet worden gebruikers na het aantal dagen dat je hieronder instelt automatisch geanonimiseerd. Dit gebeurt alleen als het project een einddatum heeft en deze datum is verstreken." />
                          </FormLabel>
                          {YesNoSelect(field, props)}
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    {!!anonymizeForm.watch(
                      'allowAnonymizeUsersAfterEndDate'
                    ) && (
                      <FormField
                        control={anonymizeForm.control}
                        name="anonymizeUsersXDaysAfterEndDate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              Na hoeveel dagen na het einde van het project
                              worden gebruikers geanonimiseerd?
                              <InfoDialog
                                content={`Na het aantal ingevoerde dagen worden automatisch alle voor- en achternamen van gebruikers van de website aangepast naar "${anonymizeForm.watch('anonymizeUserName') || 'Gebruiker is geanonimiseerd'}".`}
                              />
                            </FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                placeholder="60"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}
                    {isSendEmailNotSet && (
                      <Alert variant="error" className="mb-4">
                        <AlertTitle>Let op!</AlertTitle>
                        <AlertDescription>
                          Het e-mailadres voor het versturen van notificaties is
                          nog niet ingesteld. Stel deze eerst in bij de{' '}
                          <a
                            href={`/projects/${project}/settings/notifications`}
                            className="underline">
                            e-mail instellingen
                          </a>
                          . Zonder een juist ingesteld e-mailadres kunnen er
                          geen waarschuwingsmails worden verstuurd en zullen
                          gebruikers worden geanonimiseerd zonder waarschuwing.
                        </AlertDescription>
                      </Alert>
                    )}
                    <FormField
                      control={anonymizeForm.control}
                      name="warnUsersAfterXDaysOfInactivity"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            Na hoeveel dagen inactiviteit krijgen gebruikers een
                            waarschuwing?
                            <InfoDialog content="Na het ingevoerde aantal dagen krijgen geregistreerde gebruikers van het project automatisch een mailtje dat hun account geanonimiseerd gaat worden. De tekst van deze mail kun je hieronder aanpassen." />
                          </FormLabel>
                          <FormControl>
                            <Input type="number" placeholder="180" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={anonymizeForm.control}
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
                      control={anonymizeForm.control}
                      name="anonymizeUserName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            Hoe worden gebruikers genoemd na anonimisering?
                            <InfoDialog content='Standaard wordt de naam van de gebruiker aangepast naar "Gebruiker is geanonimiseerd". Je kunt dit hier aanpassen naar een andere tekst.' />
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
                  <Heading size="xl">
                    Waarschuwingsmail inactiviteit
                    <InfoDialog content="Content voor een waarschuwings email" />
                  </Heading>
                  <Separator className="my-4" />
                  <NotificationForm
                    type="user account about to expire"
                    label="Gebruikersaccount staat op het punt te verlopen"
                    engine={template?.engine}
                    id={template?.id}
                    subject={template?.subject}
                    body={template?.body}
                  />
                </Form>
              </div>

              <div className="relative p-6 rounded-md mt-4 border-2 border-destructive/50 bg-white overflow-hidden">
                <div
                  className="absolute inset-0 bg-destructive/5 pointer-events-none"
                  aria-hidden
                />
                <Heading size="xl" className="text-destructive relative">
                  Gebruikersgegevens anonimiseren
                </Heading>
                <Separator className="my-4" />
                <div>
                  Let op! Deze actie is <b>definitief</b> en
                  <b> kan niet ongedaan gemaakt worden</b>.
                </div>
                <div className="mt-2">
                  Het project moet eerst zijn beëindigd voordat deze actie
                  uitgevoerd kan worden.
                </div>
                <div className="flex items-center gap-2 mt-4">
                  <Checkbox
                    id="danger-zone-confirm"
                    checked={dangerZoneEnabled}
                    onCheckedChange={(checked) =>
                      setDangerZoneEnabled(checked === true)
                    }
                  />
                  <Label
                    htmlFor="danger-zone-confirm"
                    className="text-sm font-medium cursor-pointer">
                    Ik begrijp de gevolgen en wil doorgaan
                  </Label>
                </div>
                <Button
                  variant="destructive"
                  className="mt-4 w-fit"
                  disabled={!dangerZoneEnabled}
                  onClick={() => anonymizeAllUsers()}>
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
