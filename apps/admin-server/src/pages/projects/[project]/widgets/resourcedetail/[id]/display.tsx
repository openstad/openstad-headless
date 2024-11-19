import { Button } from '@/components/ui/button';
import {
  Form, FormControl, FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Separator } from '@/components/ui/separator';
import { Heading } from '@/components/ui/typography';
import { YesNoSelect, undefinedToTrueOrProp } from '@/lib/form-widget-helpers';
import { EditFieldProps } from '@/lib/form-widget-helpers/EditFieldProps';
import { zodResolver } from '@hookform/resolvers/zod';
import { ResourceDetailWidgetProps } from '@openstad-headless/resource-detail/src/resource-detail';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import {Input} from "@/components/ui/input";
import {useFieldDebounce} from "@/hooks/useFieldDebounce";

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
  displayTags: z.boolean(),
  displaySocials: z.boolean(),
  displayStatus: z.boolean(),
  displayStatusBar: z.boolean(),
  displayLikes: z.boolean(),
  displayDocuments: z.boolean(),
  documentsTitle: z.string().optional(),
  documentsDesc: z.string().optional(),
  clickableImage: z.boolean(),
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
      displayImage: undefinedToTrueOrProp(props?.displayImage),
      displayTitle: undefinedToTrueOrProp(props?.displayTitle),
      displayDescription: undefinedToTrueOrProp(props?.displayDescription),
      displaySummary: undefinedToTrueOrProp(props?.displaySummary),
      displayUser: undefinedToTrueOrProp(props?.displayUser),
      displayDate: undefinedToTrueOrProp(props?.displayDate),
      displayBudget: undefinedToTrueOrProp(props?.displayBudget),
      displayBudgetDocuments: undefinedToTrueOrProp(
        props?.displayBudgetDocuments
      ),
      displayLocation: undefinedToTrueOrProp(props?.displayLocation),
      displayTags: undefinedToTrueOrProp(props?.displayTags),
      displaySocials: undefinedToTrueOrProp(props?.displaySocials),
      displayStatus: undefinedToTrueOrProp(props?.displayStatus),
      displayStatusBar: undefinedToTrueOrProp(props?.displayStatusBar),
      displayLikes: undefinedToTrueOrProp(props?.displayLikes),
      displayDocuments: undefinedToTrueOrProp(props?.displayDocuments),
      clickableImage: props?.clickableImage || false,
      documentsTitle: props?.documentsTitle || '',
      documentsDesc: props?.documentsDesc || '',
    },
  });

  return (
    <div className="p-6 bg-white rounded-md">
      <Form {...form}>
        <Heading size="xl">Weergave</Heading>
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
            name="displayStatus"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Gekoppelde statussen weergeven</FormLabel>
                {YesNoSelect(field, props)}
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="displayStatusBar"
            render={({ field }) => (
              <FormItem>
                <FormLabel>De balk met statussen weergeven bij de afbeelding?</FormLabel>
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
                <FormLabel>Delen via social media opties weergeven</FormLabel>
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
                <FormLabel>Toon de likes widget</FormLabel>
                {YesNoSelect(field, props)}
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="displayDocuments"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Geüploade documenten weergeven
                </FormLabel>
                {YesNoSelect(field, props)}
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="clickableImage"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Moet de afbeelding in de dialog klikbaar zijn?
                </FormLabel>
                <FormDescription>
                  Als je dit aanvinkt, wordt de afbeelding in de dialog klikbaar en wordt de afbeelding geopend in een nieuw tabblad.
                </FormDescription>
                {YesNoSelect(field, props)}
                <FormMessage />
              </FormItem>
            )}
          />

          {form.watch("displayDocuments") && (
            <>
              <FormField
                control={form.control}
                name="documentsTitle"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Welke titel moet er boven de download knop(pen) komen?
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="text"
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
                name="documentsDesc"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Welke beschrijving moet er boven de download knop(pen) komen?
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="text"
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
            </>
          )}

          <Button className="w-fit col-span-full" type="submit">
            Opslaan
          </Button>
        </form>
      </Form>
    </div>
  );
}
