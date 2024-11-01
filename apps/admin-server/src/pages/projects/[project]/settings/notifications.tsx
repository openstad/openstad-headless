import * as React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useForm } from 'react-hook-form';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl, FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { PageLayout } from '@/components/ui/page-layout';
import { Heading } from '@/components/ui/typography';
import { Separator } from '@/components/ui/separator';
import { useCallback, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useProject } from '../../../../hooks/use-project';
import toast from 'react-hot-toast';
import InfoDialog from '@/components/ui/info-hover';

const formSchema = z.object({
  fromAddress: z.string().email(),
  projectmanagerAddress: z.string().email(),
  fromName: z.string().optional(),
});

export default function ProjectSettingsNotifications() {
  const category = 'notifications';

  const router = useRouter();
  const { project } = router.query;
  const { data, isLoading, updateProjectEmails } = useProject();
  const defaults = useCallback(
    () => ({
      fromAddress: data?.emailConfig?.[category]?.fromAddress || null,
      fromName: data?.emailConfig?.[category]?.fromName || '',
      projectmanagerAddress:
        data?.emailConfig?.[category]?.projectmanagerAddress || null,
    }),
    [data?.emailConfig]
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
      const project = await updateProjectEmails({
        [category]: {
          fromAddress: values.fromAddress,
          projectmanagerAddress: values.projectmanagerAddress,
          fromName: values.fromName,
        },
      });
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
          {
            name: 'E-mail instellingen',
            url: `'/projects/${project}/settings/notifications'`,
          },
        ]}>
        <div className="container py-6">
          <Form {...form} className="p-6 bg-white rounded-md">
            <Heading size="xl">E-mail instellingen</Heading>
            <Separator className="my-4" />
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="lg:w-fit grid grid-cols-1 gap-4">
              <FormField
                control={form.control}
                name="fromAddress"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Vanaf welk mailadres worden de notificaties verstuurd?
                      <InfoDialog content={'Let op: dit werkt alleen als de domeininstellingen voor dit e-mailadres correct geconfigureerd zijn. Tip: maak hiervoor gebruik van Flowmailer of Sendgrid.'} />
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="fromName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Wil je een naam toevoegen aan het e-mailadres waarvandaan de notificaties worden verstuurd?
                      <InfoDialog content={'Let op: dit werkt alleen als de domeininstellingen voor dit e-mailadres correct geconfigureerd zijn. Tip: maak hiervoor gebruik van Flowmailer of Sendgrid.'} />
                    </FormLabel>
                    <FormDescription>Als je hier een naam invult komt dit voor het e-mailadres van de afzender te staan, bijvoorbeeld: OpenStad site &#60;info@openstad.nl&#62;</FormDescription>
                    <FormControl>
                      <Input placeholder="" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="projectmanagerAddress"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Naar welk e-mailadres moeten de reacties op de notificaties gestuurd worden?
                      <InfoDialog content={'Dit is het e-mailadres waarop reacties op automatische e-mails van OpenStad binnenkomen. Denk aan: inlogmails en bevestigingsmails na indienen resource. Dit e-mailadres wordt ook getoond op de loginpagina van OpenStad.'} />
                      </FormLabel>
                    <FormControl>
                      <Input placeholder="" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit">Opslaan</Button>
            </form>
          </Form>
        </div>
      </PageLayout>
    </div>
  );
}
