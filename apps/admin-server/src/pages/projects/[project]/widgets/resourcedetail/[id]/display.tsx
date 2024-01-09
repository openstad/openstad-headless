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
import { ResourceDetailWidgetProps } from '@openstad/resource-detail/src/resource-detail';
import { Input } from '@/components/ui/input';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { useFieldDebounce } from '@/hooks/useFieldDebounce';

const formSchema = z.object({
  displayTitle: z.boolean(),
  titleMaxLength: z.coerce.number(),
  displayDescription: z.boolean(),
  displaySummary: z.boolean(),
  displayUser: z.boolean(),
  displayDate: z.boolean(),
  displayLocation: z.boolean(),
});

export default function WidgetResourceDetailDisplay(
  props: ResourceDetailWidgetProps & EditFieldProps<ResourceDetailWidgetProps>
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
      displaySummary: props?.displaySummary || false,
      displayUser: props?.displayUser || false,
      displayDate: props?.displayDate || false,
      displayLocation: props?.displayLocation || false,
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
            name="displayTags"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tags weergeven</FormLabel>
                {YesNoSelect(field, props)}
                <FormMessage />
              </FormItem>
            )}
          /> */}
          <FormField
            control={form.control}
            name="displayUser"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Gebruiker weergeven</FormLabel>
                {YesNoSelect(field, props)}
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="displayDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Publicatiedatum weergeven</FormLabel>
                {YesNoSelect(field, props)}
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="displayLocation"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Plaats weergeven</FormLabel>
                {YesNoSelect(field, props)}
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
            name="displayDescription"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Beschrijving weergeven</FormLabel>
                {YesNoSelect(field, props)}
                <FormMessage />
              </FormItem>
            )}
          />

          <Button className="w-fit col-span-full" type="submit">
            Opslaan
          </Button>
        </form>
      </Form>
    </div>
  );
}
