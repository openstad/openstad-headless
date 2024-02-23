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
import { Textarea } from '@/components/ui/textarea';
import { PageLayout } from '@/components/ui/page-layout';
import { Heading } from '@/components/ui/typography';
import { Separator } from '@/components/ui/separator';
import { useRouter } from 'next/router';
import { useProject } from '@/hooks/use-project';
import useNotificationTemplate from '@/hooks/use-notification-template'

const formSchema = z.object({
  label: z.string(),
  subject: z.string(),
  body: z.string(),
});

export default function ProjectNotificationsLoginSms() {
  const router = useRouter();
  const project = router.query.project as string;
  const [value, setValue] = React.useState();

  const { data } = useProject();
  const { data: templateData, create } = useNotificationTemplate(project as string)

  const defaults = React.useCallback(
    () => ({
      label: data?.config?.email?.label || "Inlogmail aangevraagd",
      subject: data?.config?.email?.subject || "Beste {{user}},",
      body: data?.config?.email?.body || "Voor Admin panel is een inlogcode aangevraagd voor dit telefoonnummer. Vul de code hieronder in op het scherm. De code is 10 minuten geldig.",
    }),
    [data?.config]
  )

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver<any>(formSchema),
    defaultValues: defaults(),
  });

  React.useEffect(() => {
    form.reset(defaults());
  }, [form, defaults]);

  React.useEffect(() => {
    if (templateData !== undefined) {
      for (let i = 0; i < templateData.length; i++) {
        if (templateData[i]?.type === 'login sms') {
          setValue(templateData[i])
        }
      }
    }
  }, [templateData]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const template = await create(project, 'sms', 'login sms', values.label, values.subject, values.body)
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
            name: 'Notificaties',
            url: `/projects/${project}/notifications`,
          },
          {
            name: 'SMS Verificatie',
            url: `/projects/${project}/notifications/smsverification`,
          },
        ]}>
        <div className="container py-6">
          <Form {...form} className="p-6 bg-white rounded-md">
            <Heading size="xl">Login sms instellingen</Heading>
            <Separator className="my-4" />
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-4 lg:w-1/2">
              <FormField
                control={form.control}
                name="label"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>SMS onderwerp</FormLabel>
                    <FormControl>
                      <Input placeholder="" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="subject"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Aanname/introductie</FormLabel>
                    <FormControl>
                      <Input placeholder="" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="body"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Beschrijving</FormLabel>
                    <FormControl>
                      <Textarea placeholder="" {...field} />
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
