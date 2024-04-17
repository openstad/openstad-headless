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
import { Heading } from '@/components/ui/typography';
import { Separator } from '@/components/ui/separator';
import { useRouter } from 'next/router';
import useNotificationTemplate from '@/hooks/use-notification-template'
import toast from 'react-hot-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

type Props = {
  type:
  | 'login email'
  | 'login sms'
  | 'new published resource - user feedback'
  | 'updated resource - user feedback'
  | 'user account about to expire';
  engine?: 'email' | 'sms';
  id?: string;
  label?: string;
  subject?: string;
  body?: string;
}

const notificationTypes = {
    'login email': 'Inloggen via e-mail',
    'login sms': 'Inloggen via sms',
    'new published resource - user feedback': 'Nieuwe resource gepubliceerd - Notificatie naar de gebruiker',
    'updated resource - user feedback': 'Resource bijgewerkt - Notificatie naar de gebruiker',
    'user account about to expire': 'Gebruikersaccount staat op het punt te verlopen'
};

const formSchema = z.object({
  engine: z.enum(['email', 'sms']),
  label: z.string().min(1, {
    message: 'De label mag niet leeg zijn!',
  }).max(255, {
    message: 'De label mag niet langer dan 255 karakters zijn!',
  }),
  subject: z.string().min(1, {
    message: 'Het onderwerp mag niet leeg zijn!',
  }).max(255, {
    message: 'Het onderwerp mag niet langer dan 255 karakters zijn!',
  }),
  body: z.string().min(1, {
    message: 'De inhoud mag niet leeg zijn!',
  }),
});

export function NotificationForm({ type, engine, id, label, subject, body }: Props) {
  const router = useRouter();
  const project = router.query.project as string;
  const { data, create, update } = useNotificationTemplate(project as string)
  const notificationTitle = notificationTypes[type];

  const defaults = React.useCallback(
    () => ({
      engine: engine || "email",
      label: label || "",
      subject: subject || "",
      body: body || "",
    }),
    [engine, label, subject, body]
  )

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver<any>(formSchema),
    defaultValues: defaults(),
  });

  React.useEffect(() => {
    form.reset(defaults());
  }, [form, defaults]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (label && subject && body !== undefined) {
      const template = await update(id as string, values.label, values.subject, values.body)
      if (template) {
        toast.success('Template aangepast!');
      } else {
        toast.error('Er is helaas iets mis gegaan.')
      }
    } else {
      const template = await create(project, values.engine, type, values.label, values.subject, values.body)
      if (template) {
        toast.success('Template aangemaakt!');
      } else {
        toast.error('Er is helaas iets mis gegaan.')
      }
    }
  }

  return (
    <div>
      <div className="container px-0 py-6">
        <Form {...form} className="px-0 py-6 bg-white rounded-md">
          <Heading size="xl">{notificationTitle}</Heading>
          <Separator className="my-4" />
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4 lg:w-1/2">
            {label && subject && body !== undefined ? null :
              <FormField
                control={form.control}
                name="engine"
                render={({ field }) => (
                  <FormItem className="col-span-1">
                    <FormLabel>
                      Wat voor client gaat gebruikt worden voor dit onderdeel?
                    </FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="email" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="email">
                          Email
                        </SelectItem>
                        <SelectItem value="sms">
                          SMS
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            }
            <FormField
              control={form.control}
              name="label"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Label (Type bericht)</FormLabel>
                  <FormControl>
                    <Input placeholder="Label van de mail" {...field} />
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
                  <FormLabel>Onderwerp</FormLabel>
                  <FormControl>
                    <Input placeholder="Onderwerp van de mail" {...field} />
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
                  <FormLabel>Inhoud</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Inhoud van de mail..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit">Opslaan</Button>
          </form>
        </Form>
      </div>
    </div>
  );
}
