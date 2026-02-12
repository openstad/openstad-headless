import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { Heading } from '@/components/ui/typography';
import useComments from '@/hooks/use-comments';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/router';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import * as z from 'zod';

const formSchema = z.object({
  description: z.string().min(1, 'Reactie is verplicht'),
  sentiment: z.enum(['for', 'no sentiment', 'against']),
  confirmation: z.boolean().optional(),
  parentId: z.string().optional(),
});
type Formdata = z.infer<typeof formSchema>;
type CreateCommentData = {
  description: string;
  sentiment: 'for' | 'no sentiment' | 'against';
  confirmation?: boolean;
  projectId: string;
  resourceId: number;
  parentId?: string;
  confirmationReplies?: boolean;
};

export default function ProjectResourceCreateArgument() {
  const router = useRouter();
  const { project } = router.query;
  const { data, createComment } = useComments(project as string);
  const [disableSubmit, setDisableSubmit] = useState(false);

  const notifySuccess = () => toast.success('Reactie succesvol geplaatst');
  const notifyFailed = (err?: string) =>
    toast.error(err || 'Reactie plaatsen mislukt');
  const notifyError = () => toast.error('Er is een fout opgetreden');
  const notify = (message: string, icon: any) =>
    toast(message, { icon, duration: 8000 });

  async function onSubmit(values: Formdata) {
    setDisableSubmit(false);
    let commentData: CreateCommentData = {
      ...values,
      projectId: project as string,
      resourceId: Number(router.query.id),
    };

    if (values.confirmation) {
      commentData.confirmationReplies = true;
    }

    try {
      const newComment = await createComment(commentData);

      if (!newComment?.error) {
        notifySuccess();

        if (values.confirmation) {
          let icon = '✅',
            text = 'Notificatie naar gebruiker is verzonden';
          if (newComment.confirmationSent === false) {
            ((icon = '⚠️'),
              (text =
                'Notificatie naar gebruiker is niet verzonden, omdat de gebruiker geen toestemming heeft gegeven voor e-mailnotificaties.'));
          } else if (newComment.confirmationSent === undefined) {
            ((icon = '❌'),
              (text = 'Notificatie naar gebruiker kon niet worden verzonden'));
          }

          notify(text, icon);
        }
      } else {
        notifyFailed(newComment?.error);
      }
    } catch (err: any) {
      console.log(err);
      notifyError();
    } finally {
      setDisableSubmit(false);
    }
  }

  const form = useForm<Formdata>({
    resolver: zodResolver<any>(formSchema),
    defaultValues: {
      description: '',
      sentiment: 'for',
      confirmation: false,
      parentId: '',
    },
  });

  return (
    <div className="p-6 bg-white rounded-md">
      <Form {...form}>
        <Heading size="xl">Plaats een reactie</Heading>
        <Separator className="my-4" />
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-4 lg:w-2/3">
          <FormField
            control={form.control}
            name="sentiment"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Sentiment</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  value={field.value || 'for'}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Voor" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="for">Voor</SelectItem>
                    <SelectItem value="no sentiment">Neutraal</SelectItem>
                    <SelectItem value="against">Tegen</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="confirmation"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Bevestingingsmail verzenden?</FormLabel>
                <FormDescription>
                  Wil je een bevestigingsmail sturen naar de gebruiker die de
                  inzending heeft ingediend? De gebruiker ontvangt dit alleen
                  als hij/zij toestemming heeft gegeven voor e-mailnotificaties.
                </FormDescription>
                <Select
                  onValueChange={(e: string) => field.onChange(e === 'true')}
                  value={field.value ? 'true' : 'false'}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Nee" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="false">Nee</SelectItem>
                    <SelectItem value="true">Ja</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="parentId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Reageer op reactie ID</FormLabel>
                <FormDescription>
                  Vul hier het ID in van de reactie waarop je wilt reageren.
                </FormDescription>
                <FormControl>
                  <Input {...field} type="number" placeholder="0" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem className="col-span-full sm:col-span-2 md:col-span-2 lg:col-span-2">
                <FormLabel>Reactie</FormLabel>
                <FormControl>
                  <Textarea rows={6} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button
            className="w-fit col-span-full"
            type="submit"
            disabled={disableSubmit}>
            Opslaan
          </Button>
        </form>
      </Form>
    </div>
  );
}
