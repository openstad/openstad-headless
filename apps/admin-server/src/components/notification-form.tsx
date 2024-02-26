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

type Props = {
  type:
    | 'login email'
    | 'login sms'
    | 'new published resource - user feedback'
    | 'updated resource - user feedback'
    | 'user account about to expire';
  engine: string;
  id?: string;
  label?: string;
  subject?: string;
  body?: string;
}

const formSchema = z.object({
  label: z.string(),
  subject: z.string(),
  body: z.string(),
});

export function NotificationForm({ type, engine, id, label, subject, body }: Props) {
  const router = useRouter();
  const project = router.query.project as string;
  const { create, update } = useNotificationTemplate(project as string)

  const defaults = React.useCallback(
    () => ({
      label: label || "Label van de mail",
      subject: subject || "Onderwerp van de mail",
      body: body || "Inhoud van de mail...",
    }),
    [label, subject, body]
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
      const template = await create(project, engine, type, values.label, values.subject, values.body)
      if (template) {
        toast.success('Template aangemaakt!');
      } else {
        toast.error('Er is helaas iets mis gegaan.')
      }
    }
  }

  return (
    <div>
        <div className="container py-6">
          <Form {...form} className="p-6 bg-white rounded-md">
            <Heading size="xl">{type}</Heading>
            <Separator className="my-4" />
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-4 lg:w-1/2">
              <FormField
                control={form.control}
                name="label"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Label (Type mail)</FormLabel>
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
                    <FormLabel>Onderwerp</FormLabel>
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
                    <FormLabel>Inhoud</FormLabel>
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
    </div>
  );
}
