import { Button } from '@/components/ui/button';
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Separator } from '@/components/ui/separator';
import { Heading } from '@/components/ui/typography';
import { YesNoSelect } from '@/lib/form-widget-helpers';
import { EditFieldProps } from '@/lib/form-widget-helpers/EditFieldProps';
import { zodResolver } from '@hookform/resolvers/zod';
import { ResourceOverviewWidgetProps } from '@openstad/resource-overview/src/resource-overview';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

const formSchema = z.object({
  displayTitle: z.boolean(),
  // displayRanking: z.boolean(),
  // displayLabel: z.boolean(),
  // displaySummary: z.boolean(),
  displayDescription: z.boolean(),
  displayArguments: z.boolean(),
  displayVote: z.boolean(),
  // displayShareButtons: z.boolean(),
  // displayEditLink: z.boolean(),
  // displayCaption: z.boolean(),
});

export default function WidgetResourceOverviewDisplay(
  props: ResourceOverviewWidgetProps &
    EditFieldProps<ResourceOverviewWidgetProps>
) {
  type FormData = z.infer<typeof formSchema>;

  async function onSubmit(values: FormData) {
    props.updateConfig({ ...props, ...values });
  }

  const form = useForm<FormData>({
    resolver: zodResolver<any>(formSchema),
    defaultValues: {
      displayTitle: props?.displayTitle || false,
      // displayRanking: props?.displayRanking || false,
      // displayLabel: props?.displayLabel || false,
      // displaySummary: props?.displaySummary || false,
      displayDescription: props?.displayDescription || false,
      displayArguments: props?.displayArguments || false,
      displayVote: props?.displayVote || false,
      // displayShareButtons: props?.displayShareButtons || false,
      // displayEditLink: props?.displayEditLink || false,
      // displayCaption: props?.displayCaption || false,
    },
  });

  return (
    <div className="p-6 bg-white rounded-md">
      <Form {...form}>
        <Heading size="xl">Display</Heading>
        <Separator className="my-4" />
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="lg:w-3/4 grid grid-cols-1 lg:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="displayTitle"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Titel weergeven</FormLabel>
                {YesNoSelect(field, props)}
                <FormMessage />
              </FormItem>
            )}
          />
          {/* <FormField
            control={form.control}
            name="displayRanking"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Ranking weergeven</FormLabel>
                {YesNoSelect(field, props)}
                <FormMessage />
              </FormItem>
            )}
          /> */}
          {/* <FormField
            control={form.control}
            name="displayLabel"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Label weergeven</FormLabel>
                {YesNoSelect(field, props)}
                <FormMessage />
              </FormItem>
            )}
          /> */}
          {/* <FormField
            control={form.control}
            name="displaySummary"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Samenvatting weergeven</FormLabel>
                {YesNoSelect(field, props)}
                <FormMessage />
              </FormItem>
            )}
          /> */}
          <FormField
            control={form.control}
            name="displayDescription"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Beschrijving weergeven</FormLabel>
                {YesNoSelect(field, props)}
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="displayArguments"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Hoeveelheid aan argumenten weergeven</FormLabel>
                {YesNoSelect(field, props)}
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="displayVote"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Hoeveelheid stemmen weergeven (voor Gridder)
                </FormLabel>
                {YesNoSelect(field, props)}
                <FormMessage />
              </FormItem>
            )}
          />
          {/* <FormField
            control={form.control}
            name="displayShareButtons"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Deel knoppen weergeven</FormLabel>
                {YesNoSelect(field, props)}
                <FormMessage />
              </FormItem>
            )}
          /> */}
          {/* <FormField
            control={form.control}
            name="displayEditLink"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Aanpas-link weergeven voor moderators</FormLabel>
                {YesNoSelect(field, props)}
                <FormMessage />
              </FormItem>
            )}
          /> */}
          <Button className="w-fit col-span-full" type="submit">
            Opslaan
          </Button>
        </form>
      </Form>
    </div>
  );
}
