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
import { Separator } from '@/components/ui/separator';
import { Spacer } from '@/components/ui/spacer';
import { Heading } from '@/components/ui/typography';
import { useFieldDebounce } from '@/hooks/useFieldDebounce';
import { YesNoSelect } from '@/lib/form-widget-helpers';
import { EditFieldProps } from '@/lib/form-widget-helpers/EditFieldProps';
import { zodResolver } from '@hookform/resolvers/zod';
import { EnqueteWidgetProps } from '@openstad-headless/enquete/src/enquete';
import dynamic from 'next/dynamic';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

const TrixEditor = dynamic(
  () =>
    import('@openstad-headless/ui/src/form-elements/text/index').then(
      (mod) => mod.TrixEditor
    ),
  {
    ssr: false,
    loading: () => (
      <div className="h-32 bg-gray-100 animate-pulse rounded border" />
    ),
  }
);

const formSchema = z.object({
  title: z.string(),
  description: z.string(),
  afterSubmitUrl: z.string().optional(),
  minCharactersWarning: z
    .string()
    .optional()
    .default('Nog minimaal {minCharacters} tekens'),
  maxCharactersWarning: z
    .string()
    .optional()
    .default('Je hebt nog {maxCharacters} tekens over'),
  minCharactersError: z
    .string()
    .optional()
    .default('Tekst moet minimaal {minCharacters} karakters bevatten'),
  maxCharactersError: z
    .string()
    .optional()
    .default('Tekst moet maximaal {maxCharacters} karakters bevatten'),
  enableDraftPersistence: z.boolean().optional(),
  draftRetentionHours: z.coerce.number().optional(),
  showMinMaxAfterBlur: z
    .boolean()
    .optional()
    .default(false),
  maxCharactersOverWarning: z
    .string()
    .optional()
    .default("Je hebt {overCharacters} tekens teveel"),
});

export default function WidgetEnqueteGeneral(
  props: EnqueteWidgetProps & EditFieldProps<EnqueteWidgetProps>
) {
  type FormData = z.infer<typeof formSchema>;
  async function onSubmit(values: FormData) {
    props.updateConfig({ ...props, ...values });
  }

  const form = useForm<FormData>({
    resolver: zodResolver<any>(formSchema),
    defaultValues: {
      title: props?.title || '',
      description: props?.description || '',
      afterSubmitUrl: props.afterSubmitUrl || '',
      minCharactersWarning:
        props.minCharactersWarning || 'Nog minimaal {minCharacters} tekens',
      maxCharactersWarning:
        props.maxCharactersWarning || 'Je hebt nog {maxCharacters} tekens over',
      minCharactersError:
        props.minCharactersError ||
        'Tekst moet minimaal {minCharacters} karakters bevatten',
      maxCharactersError:
        props.maxCharactersError ||
        'Tekst moet maximaal {maxCharacters} karakters bevatten',
      enableDraftPersistence: props.enableDraftPersistence ?? false,
      draftRetentionHours: props.draftRetentionHours ?? 24,
      maxCharactersOverWarning:
        props.maxCharactersOverWarning ||
        'Je hebt {overCharacters} tekens teveel',
      showMinMaxAfterBlur: props.showMinMaxAfterBlur || false,
    },
  });

  const { onFieldChange } = useFieldDebounce(props.onFieldChanged);

  return (
    <div className="p-6 bg-white rounded-md">
      <Form {...form}>
        <Heading size="xl">Algemeen</Heading>
        <Separator className="my-4" />
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="grid flex-col w-full lg:w-full grid-cols-1 lg:grid-cols-2 gap-x-4 gap-y-8">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Enquête titel</FormLabel>
                <FormControl>
                  <TrixEditor
                    value={field.value || ''}
                    onChange={(e) => {
                      field.onChange(e);
                      onFieldChange(field.name, e.target.value);
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="afterSubmitUrl"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Url voor redirecten na opslaan (optioneel)
                </FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder="bijvoorbeeld /enquetes/[id] of laat leeg voor geen redirect"
                    onChange={(e) => {
                      field.onChange(e);
                      onFieldChange(field.name, e.target.value);
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Enquête beschrijving</FormLabel>
                <FormControl>
                  <TrixEditor
                    value={field.value || ''}
                    onChange={(e) => {
                      field.onChange(e);
                      onFieldChange(field.name, e.target.value);
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="enableDraftPersistence"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Concept automatisch opslaan</FormLabel>
                <FormDescription>
                  Sla ingevulde antwoorden automatisch op in de browser, zodat
                  gebruikers later kunnen verdergaan.
                </FormDescription>
                {YesNoSelect(field, props)}
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="draftRetentionHours"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Bewaartijd concept (uren)</FormLabel>
                <FormDescription>
                  Aantal uren dat een concept bewaard blijft in de browser.
                </FormDescription>
                <FormControl>
                  <Input
                    type="number"
                    min={1}
                    {...field}
                    onChange={(e) => {
                      field.onChange(e);
                      onFieldChange(field.name, e.target.value);
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Spacer />

          <FormField
            control={form.control}
            name="minCharactersWarning"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Waarschuwing voor minimaal aantal karakters
                </FormLabel>
                <FormDescription>
                  {`Dit is de tekst die getoond wordt als het aantal karakters onder de minimum waarde ligt. Gebruik {minCharacters} zodat het aantal karakters automatisch wordt ingevuld.`}
                </FormDescription>
                <Input {...field} />
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="maxCharactersWarning"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Waarschuwing voor maximaal aantal karakters
                </FormLabel>
                <FormDescription>
                  {`Dit is de tekst die getoond wordt als het aantal karakters boven de maximum waarde ligt. Gebruik {maxCharacters} zodat het aantal karakters automatisch wordt ingevuld.`}
                </FormDescription>
                <Input {...field} />
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="maxCharactersOverWarning"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Waarschuwing bij overschrijden maximaal aantal karakters
                </FormLabel>
                <FormDescription>
                  {`Dit is de tekst die getoond wordt als het aantal karakters over de maximum waarde heen gaat. Gebruik {overCharacters} zodat het aantal karakters automatisch wordt ingevuld.`}
                </FormDescription>
                <Input
                  {...field}
                />
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="minCharactersError"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Foutmelding voor minimaal aantal karakters
                </FormLabel>
                <FormDescription>
                  {`Dit is de tekst van de foutmelding die getoond wordt als het aantal karakters onder de minimum waarde ligt na het versturen van het formulier. Gebruik {minCharacters} zodat het aantal karakters automatisch wordt ingevuld.`}
                </FormDescription>
                <Input {...field} />
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="maxCharactersError"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Foutmelding voor maximaal aantal karakters
                </FormLabel>
                <FormDescription>
                  {`Dit is de tekst van de foutmelding die getoond wordt als het aantal karakters boven de maximum waarde ligt na het versturen van het formulier. Gebruik {maxCharacters} zodat het aantal karakters automatisch wordt ingevuld.`}
                </FormDescription>
                <Input {...field} />
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="showMinMaxAfterBlur"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Toon min/max waarschuwing na verlaten van het veld
                </FormLabel>
                {/*@ts-ignore*/}
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
