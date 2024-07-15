import React from 'react';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Heading } from '@/components/ui/typography';
import { Separator } from '@/components/ui/separator';
import { ActivityWidgetProps } from '@openstad-headless/activity/src/activity';
import { EditFieldProps } from '@/lib/form-widget-helpers/EditFieldProps';
import { useFieldDebounce } from '@/hooks/useFieldDebounce';
import { useRouter } from 'next/router';
import useChoiceGuides from '@/hooks/use-choiceguides';
import useResources from '@/hooks/use-resources';

const formSchema = z.object({
  currentSite: z.array(z.object({})).optional(),
  otherSites: z.array(z.object({})).optional(),
  currentTitle: z.string().optional(),
  otherTitle: z.string().optional(),
  noActivityTextCurrent: z.string().optional(),
  noActivityTextOther: z.string().optional(),
  truncate: z.number().optional(),
  resourceId: z.string().optional(),
});
type Formdata = z.infer<typeof formSchema>;

export default function ActivityDisplay(
  props: ActivityWidgetProps & EditFieldProps<ActivityWidgetProps>
) {
  const { onFieldChange } = useFieldDebounce(props.onFieldChanged);

  const router = useRouter();

  const projectId = router.query.project as string;
  const { data: resourceList } = useResources(projectId as string);

  function onSubmit(values: Formdata) {
    props.updateConfig({ ...props, ...values });
  }

  const form = useForm<Formdata>({
    resolver: zodResolver<any>(formSchema),
    defaultValues: {
      currentSite: props.currentSite,
      otherSites: props.otherSites,
      currentTitle: props.currentTitle || 'Activiteit op deze website',
      otherTitle: props.otherTitle || 'Activiteit op andere websites',
      noActivityTextCurrent: props.noActivityTextCurrent || 'U heeft geen activiteit op deze website.',
      noActivityTextOther: props.noActivityTextOther || 'U heeft geen activiteit op andere websites.',
    },
  });

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
          name="currentTitle"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Titel voor huidige site</FormLabel>
              <FormControl>
                <Input
                  defaultValue={field.value}
                  onChange={(e) => {
                    field.onChange(e);
                    onFieldChange(field.name, e.target.value);
                  }}
                />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="noActivityTextCurrent"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tekst wanneer er geen activiteit op de huidige site is geweest</FormLabel>
              <FormControl>
                <Input
                  defaultValue={field.value}
                  onChange={(e) => {
                    field.onChange(e);
                    onFieldChange(field.name, e.target.value);
                  }}
                />
              </FormControl>
            </FormItem>
          )}
        />
        
        <hr />

        <FormField
          control={form.control}
          name="otherTitle"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Titel voor externe sites</FormLabel>
              <FormControl>
                <Input
                  defaultValue={field.value}
                  onChange={(e) => {
                    field.onChange(e);
                    onFieldChange(field.name, e.target.value);
                  }}
                />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="noActivityTextOther"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tekst wanneer er geen activiteit op andere sites is geweest</FormLabel>
              <FormControl>
                <Input
                  defaultValue={field.value}
                  onChange={(e) => {
                    field.onChange(e);
                    onFieldChange(field.name, e.target.value);
                  }}
                />
              </FormControl>
            </FormItem>
          )}
        />



        <Button className="w-fit col-span-full" type="submit">
          Opslaan
        </Button>
      </form>
    </Form>
  );
}
