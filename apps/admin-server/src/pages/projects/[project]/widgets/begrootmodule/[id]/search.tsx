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
import { useFieldDebounce } from '@/hooks/useFieldDebounce';
import { YesNoSelect } from '@/lib/form-widget-helpers';
import { EditFieldProps } from '@/lib/form-widget-helpers/EditFieldProps';
import { zodResolver } from '@hookform/resolvers/zod';
import { StemBegrootWidgetProps } from '@openstad-headless/stem-begroot/src/stem-begroot';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

const formSchema = z.object({
  displaySearch: z.boolean(),
  displaySearchText: z.boolean(),
  textActiveSearch: z.string(),
  searchLabel: z.string().optional(),
  displaySearchHint: z.boolean().optional(),
  searchHint: z.string().optional(),
  displaySearchPlaceholder: z.boolean().optional(),
  searchPlaceholder: z.string().optional(),
});

export default function WidgetResourceOverviewSearch(
  props: StemBegrootWidgetProps & EditFieldProps<StemBegrootWidgetProps>
) {
  type FormData = z.infer<typeof formSchema>;

  async function onSubmit(values: FormData) {
    props.updateConfig({ ...props, ...values });
  }

  const form = useForm<FormData>({
    resolver: zodResolver<any>(formSchema),
    defaultValues: {
      displaySearch: props.displaySearch || false,
      displaySearchText: props.displaySearchText || false,
      textActiveSearch:
        props.textActiveSearch || 'Bekijk de tekstresultaten voor [zoekterm]',
      searchLabel: props.searchLabel || 'Zoeken',
      displaySearchHint: props.displaySearchHint || false,
      searchHint: props.searchHint || '',
      displaySearchPlaceholder: props.displaySearchPlaceholder !== false,
      searchPlaceholder: props.searchPlaceholder || 'Zoeken',
    },
  });

  const { onFieldChange } = useFieldDebounce(props.onFieldChanged);

  const displaySearchPlaceholder = form.watch('displaySearchPlaceholder');

  return (
    <div className="p-6 bg-white rounded-md">
      <Form {...form}>
        <Heading size="xl">Zoeken</Heading>
        <Separator className="my-4" />
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="lg:w-1/3 grid grid-cols-1 gap-4">
          <FormField
            control={form.control}
            name="displaySearch"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Zoekveld weergeven</FormLabel>
                {YesNoSelect(field, props)}
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="displaySearchText"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Zoektekst weergeven</FormLabel>
                {YesNoSelect(field, props)}
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="textActiveSearch"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tekst voor actieve resultaten</FormLabel>
                <FormControl>
                  <Input
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
            name="searchLabel"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Label voor het zoekveld</FormLabel>
                <FormControl>
                  <Input
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
            name="displaySearchHint"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Hint onder het zoekveld weergeven</FormLabel>
                {YesNoSelect(field, props)}
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="searchHint"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Hinttekst voor het zoekveld</FormLabel>
                <FormControl>
                  <Input
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
            name="displaySearchPlaceholder"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Placeholder in het zoekveld weergeven</FormLabel>
                {YesNoSelect(field, props)}
                <FormMessage />
              </FormItem>
            )}
          />

          {displaySearchPlaceholder !== false && (
            <FormField
              control={form.control}
              name="searchPlaceholder"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tekst voor zoekveld placeholder</FormLabel>
                  <FormControl>
                    <Input
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
          <Button className="w-fit col-span-full" type="submit">
            Opslaan
          </Button>
        </form>
      </Form>
    </div>
  );
}
