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
import useNotificationTemplate from '@/hooks/use-notification-template'
import toast from 'react-hot-toast';

const formSchema = z.object({
  label: z.string(),
  subject: z.string(),
  body: z.string(),
});

export default function ProjectNotificationsAccountExpires() {
  const router = useRouter();
  const project = router.query.project as string;
  const [value, setValue] = React.useState<undefined | {id: any, label: any, subject: any, body: any}>();
  const { data, create, update } = useNotificationTemplate(project as string)

  const defaults = React.useCallback(
    () => ({
      label: value?.label || "Account verloopt",
      subject: value?.subject || "Beste {{user}},",
      body: value?.body || "Uw account voor de resource {{resource}} dreigt binnenkort te verlopen. Via de onderstaande link kunt u opnieuw inloggen, om te zorgen dat uw account behouden wordt.",
    }),
    [value]
  )

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver<any>(formSchema),
    defaultValues: defaults(),
  });

  React.useEffect(() => {
    form.reset(defaults());
  }, [form, defaults]);

  React.useEffect(() => {
    if (data !== undefined) {
      for (let i = 0; i < data.length; i++) {
        if (data[i]?.type === 'user account about to expire') {
          setValue(data[i])
        }
      }
    }
  }, [data]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (value !== undefined) {
      const template = await update(value.id, values.label, values.subject, values.body)
      if (template) {
        toast.success('Template aangepast!');
      } else {
        toast.error('Er is helaas iets mis gegaan.')
      }
    } else {
      const template = await create(project, 'email', 'user account about to expire', values.label, values.subject, values.body)
      if (template) {
        toast.success('Template aangemaakt!');
      } else {
        toast.error('Er is helaas iets mis gegaan.')
      }
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
            name: 'Notificaties',
            url: `/projects/${project}/notifications`,
          },
          {
            name: 'Account verloopt',
            url: `/projects${project}/notifications/accountexpires`
          }
        ]}>
        <div className="container py-6">
          <Form {...form} className="p-6 bg-white rounded-md">
            <Heading size="xl">Account verloopt instellingen</Heading>
            <Separator className="my-4" />
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-4 lg:w-1/2">
              <FormField
                control={form.control}
                name="label"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mailonderwerp</FormLabel>
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
                    <FormLabel>Aanhef/introductie</FormLabel>
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
                    <FormLabel>Body</FormLabel>
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
