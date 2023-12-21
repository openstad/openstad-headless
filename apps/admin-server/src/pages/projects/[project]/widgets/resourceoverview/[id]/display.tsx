import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
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
import { Input } from '@/components/ui/input';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { useFieldDebounce } from '@/hooks/useFieldDebounce';

const formSchema = z.object({
  displayTitle: z.boolean(),
  titleMaxLength: z.coerce.number(),
  displayDescription: z.boolean(),
  descriptionMaxLength: z.coerce.number(),
  displaySummary: z.boolean(),
  summaryMaxLength: z.coerce.number(),

  displayArguments: z.boolean(),
  displayVote: z.boolean(),
  // displayRanking: z.boolean(),
  // displayLabel: z.boolean(),
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

  const { onFieldChange } = useFieldDebounce(props.onFieldChanged);

  const form = useForm<FormData>({
    resolver: zodResolver<any>(formSchema),
    defaultValues: {
      displayTitle: props?.displayTitle || false,
      titleMaxLength: props?.titleMaxLength || 20,
      displayDescription: props?.displayDescription || false,
      descriptionMaxLength: props?.descriptionMaxLength || 20,
      displaySummary: props?.displaySummary || false,
      summaryMaxLength: props?.summaryMaxLength || 30,
      displayArguments: props?.displayArguments || false,
      displayVote: props?.displayVote || false,
      // displayRanking: props?.displayRanking || false,
      // displayLabel: props?.displayLabel || false,
      // displaySummary: props?.displaySummary || false,
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

          <FormField
            control={form.control}
            name="titleMaxLength"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Hoeveelheid karakters van de titel die getoond wordt
                </FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    {...field}
                    onChange={(e) => {
                      onFieldChange(field.name, e.target.value);
                      field.onChange(e);
                    }}
                  />
                </FormControl>
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
            name="descriptionMaxLength"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Hoeveelheid karakters van de beschrijving die getoond wordt
                </FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    {...field}
                    onChange={(e) => {
                      onFieldChange(field.name, e.target.value);
                      field.onChange(e);
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="displaySummary"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Samenvatting weergeven</FormLabel>
                {YesNoSelect(field, props)}
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="summaryMaxLength"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Hoeveelheid karakters van de samenvatting die getoond wordt
                </FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    {...field}
                    onChange={(e) => {
                      onFieldChange(field.name, e.target.value);
                      field.onChange(e);
                    }}
                  />
                </FormControl>
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
