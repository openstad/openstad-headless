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
import { Separator } from '@/components/ui/separator';
import { Heading } from '@/components/ui/typography';
import { YesNoSelect } from '@/lib/form-widget-helpers';
import { EditFieldProps } from '@/lib/form-widget-helpers/EditFieldProps';
import { zodResolver } from '@hookform/resolvers/zod';
import { ResourceDetailWidgetProps } from '@openstad-headless/resource-detail/src/resource-detail';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

const formSchema = z.object({
  displayImage: z.boolean(),
  displayTitle: z.boolean(),
  displayDescription: z.boolean(),
  displaySummary: z.boolean(),
  displayUser: z.boolean(),
  displayDate: z.boolean(),
  displayBudget: z.boolean(),
  displayBudgetDocuments: z.boolean(),
  displayLocation: z.boolean(),
  displayLikes: z.boolean(),
  likeWidgetProgressBarText: z.string().optional(),
  displayTags: z.boolean(),
  displaySocials: z.boolean(),
});

export default function WidgetResourceDetailDisplay(
  props: ResourceDetailWidgetProps & EditFieldProps<ResourceDetailWidgetProps>
) {
  type FormData = z.infer<typeof formSchema>;

  async function onSubmit(values: FormData) {
    props.updateConfig({ ...props, ...values });
  }

  const form = useForm<FormData>({
    resolver: zodResolver<any>(formSchema),
    defaultValues: {
      displayImage: props?.displayImage || true,
      displayTitle: props?.displayTitle || true,
      displayDescription: props?.displayDescription || true,
      displaySummary: props?.displaySummary || true,
      displayUser: props?.displayUser || true,
      displayDate: props?.displayDate || true,
      displayBudget: props?.displayBudget || true,
      displayBudgetDocuments: props?.displayBudgetDocuments || true,
      displayLocation: props?.displayLocation || true,
      displayLikes: props?.displayLikes || true,
      likeWidgetProgressBarText: props?.likeWidgetProgressBarText || '',
      displayTags: props?.displayTags || true,
      displaySocials: props?.displaySocials || true,
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
            name="displayImage"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Afbeelding weergeven</FormLabel>
                {YesNoSelect(field, props)}
                <FormMessage />
              </FormItem>
            )}
          />
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
            name="displayBudget"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Budget weergeven</FormLabel>
                {YesNoSelect(field, props)}
                <FormMessage />
              </FormItem>
            )}
          />
          {/* <FormField
            control={form.control}
            name="displayBudgetDocuments"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Budget bestanden weergeven</FormLabel>
                {YesNoSelect(field, props)}
                <FormMessage />
              </FormItem>
            )}
          /> */}
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
            name="displayLikes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Like widget weergeven</FormLabel>
                {YesNoSelect(field, props)}
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="likeWidgetProgressBarText"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Text onder de likewidget progressie balk
                </FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    onChange={(e) => {
                      props.onFieldChanged(field.name, e.target.value);
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
            name="displayTags"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Gekoppelde tags weergeven</FormLabel>
                {YesNoSelect(field, props)}
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="displaySocials"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Social share opties weergeven</FormLabel>
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
