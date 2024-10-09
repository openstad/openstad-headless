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
import { ResourceOverviewWidgetProps } from '@openstad-headless/resource-overview/src/resource-overview';
import { Input } from '@/components/ui/input';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { useFieldDebounce } from '@/hooks/useFieldDebounce';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
const formSchema = z.object({
  displayBanner: z.boolean(),
  displayMap: z.boolean(),
  displayTitle: z.boolean(),
  titleMaxLength: z.coerce.number(),
  displayDescription: z.boolean(),
  descriptionMaxLength: z.coerce.number(),
  displaySummary: z.boolean(),
  summaryMaxLength: z.coerce.number(),
  displayStatusLabel: z.boolean(),
  displayArguments: z.boolean(),
  displayVote: z.boolean(),
  bannerText: z.string().optional(),
  displayDocuments: z.boolean(),
  documentsTitle: z.string().optional(),
  documentsDesc: z.string().optional(),
  displayVariant: z.string().optional(),
  applyText: z.string().optional(),
  resetText: z.string().optional(),
  displayLikeButton: z.boolean(),
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
      displayBanner: props?.displayBanner || false,
      displayMap: props?.displayMap || false,
      displayTitle: props?.displayTitle || false,
      bannerText: props?.bannerText,
      titleMaxLength: props?.titleMaxLength || 20,
      displayDescription: props?.displayDescription || false,
      descriptionMaxLength: props?.descriptionMaxLength || 20,
      displaySummary: props?.displaySummary || false,
      summaryMaxLength: props?.summaryMaxLength || 30,
      displayArguments: props?.displayArguments || false,
      displayVote: props?.displayVote || false,
      displayStatusLabel: props?.displayStatusLabel || false,
      displayDocuments: props?.displayDocuments || false,
      documentsTitle: props?.documentsTitle || '',
      documentsDesc: props?.documentsDesc || '',
      displayVariant: props?.displayVariant,
      applyText: props?.applyText || 'Toepassen',
      resetText: props?.resetText || 'Reset',
      displayLikeButton: props?.displayLikeButton || false,
      // displayRanking: props?.displayRanking || false,
      // displayLabel: props?.displayLabel || false,
      // displayShareButtons: props?.displayShareButtons || false,
      // displayEditLink: props?.displayEditLink || false,
      // displayCaption: props?.displayCaption || false,
    },
  });

  const { watch } = form;
  const displayBanner = watch('displayBanner');
  const displayMap = watch('displayMap');

  return (
    <div className="p-6 bg-white rounded-md">
      <Form {...form}>
        <Heading size="xl">Weergave</Heading>
        <Separator className="my-4" />
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="lg:w-3/4 grid grid-cols-1 lg:grid-cols-2 gap-x-4 gap-y-8">

          <div className='col-span-2 grid grid-cols-1 lg:grid-cols-2 gap-x-4 gap-y-8 w-full'>
            <FormField
              control={form.control}
              name="displayBanner"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Titel weergeven</FormLabel>
                  {YesNoSelect(field, props)}
                  <FormMessage />
                </FormItem>
              )}
            />
            {displayBanner && (
              <FormField
                control={form.control}
                name="bannerText"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Titel
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
            )}
          </div>

          <div className='col-span-2 grid grid-cols-1 lg:grid-cols-2 gap-x-4 gap-y-8 w-full'>
            <FormField
              control={form.control}
              name="displayMap"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Kaart weergeven</FormLabel>
                  {YesNoSelect(field, props)}
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="displayTitle"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Titel inzending weergeven</FormLabel>
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
            name="displaySummary"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Samenvatting inzending weergeven</FormLabel>
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
            name="displayDescription"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Beschrijving inzending weergeven</FormLabel>
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
                  Hoeveelheid stemmen weergeven
                </FormLabel>
                {YesNoSelect(field, props)}
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="displayStatusLabel"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Status label weergeven
                </FormLabel>
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

          <FormField
            control={form.control}
            name="displayVariant"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Weergave versie</FormLabel>
                <Select
                  onValueChange={(value) => {
                    field.onChange(value);
                    props.onFieldChanged(field.name, value);
                  }}
                  value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecteer een optie" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem
                      value={'default'}>
                      Standaard
                    </SelectItem>
                    <SelectItem
                      value={'compact'}>
                      Compact (3 koloms)
                    </SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <div></div>

          <FormField
            control={form.control}
            name="applyText"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Tekst voor het toepassen van de filters
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
            name="resetText"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Tekst voor het resetten van de filters
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
            name="displayLikeButton"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Like button weergeven in de dialog
                </FormLabel>
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
