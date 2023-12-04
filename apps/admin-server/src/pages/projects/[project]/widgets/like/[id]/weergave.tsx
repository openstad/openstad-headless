import React, { useEffect } from 'react';
import { PageLayout } from '../../../../../../components/ui/page-layout';
import { Button } from '../../../../../../components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from '../../../../../../components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../../../../components/ui/select';
import { Input } from '../../../../../../components/ui/input';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Heading } from '@/components/ui/typography';
import { Separator } from '@/components/ui/separator';
import { useRouter } from 'next/router';
import { useWidgetConfig } from '@/hooks/use-widget-config';

const formSchema = z.object({
  display: z.enum(['claps']),
  yesLabel: z.string(),
  noLabel: z.string(),
});
type FormData = z.infer<typeof formSchema>;

export default function LikesDisplay() {
  const category = 'like';
  const router = useRouter();
  const id = router.query.id;
  const projectId = router.query.project;

  const {
    data: widget,
    isLoading: isLoadingWidget,
    updateConfig,
    mutateData
  } = useWidgetConfig();

  const defaults = () => ({
    display: widget?.config?.[category]?.display || 'claps',
    yesLabel: widget?.config?.[category]?.yesLabel || 'Ik ben voor',
    noLabel: widget?.config?.[category]?.noLabel || 'Ik ben tegen',
  });

  async function onSubmit(values: FormData) {
    console.log ('values', values);
    try {
      await updateConfig({ [category]: values });
    } catch (error) {
      console.error('could not update', error);
    }
  }

  const form = useForm<FormData>({
    resolver: zodResolver<any>(formSchema),
    defaultValues: defaults(),
  });

  useEffect(() => {
    form.reset(defaults());
  }, [widget]);

  return (
    <Form {...form} className="p-6 bg-white rounded-md">
      <Heading size="xl" className="mb-4">
        Instellingen
      </Heading>
      <Separator className="mb-4" />
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-4 lg:w-1/2">
        <FormField
          control={form.control}
          name="display"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Weergave type</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Claps" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="claps">Claps</SelectItem>
                </SelectContent>
              </Select>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="yesLabel"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Label voor "Ja"</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
            </FormItem>
          )}
        /><FormField
          control={form.control}
          name="noLabel"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Label voor "Nee"</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
            </FormItem>
          )}
        />
        <Button type="submit">Opslaan</Button>
      </form>
    </Form>
  );
}
