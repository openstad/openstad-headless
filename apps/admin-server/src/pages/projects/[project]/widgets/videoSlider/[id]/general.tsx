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
import { Textarea } from '@/components/ui/textarea';
import { Heading } from '@/components/ui/typography';
import { useFieldDebounce } from '@/hooks/useFieldDebounce';
import { EditFieldProps } from '@/lib/form-widget-helpers/EditFieldProps';
import { zodResolver } from '@hookform/resolvers/zod';
import { EnqueteWidgetProps } from '@openstad-headless/enquete/src/enquete';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

const formSchema = z.object({
  title: z.string(),
  description: z.string(),
  afterSubmitUrl: z.string().optional(),
  finalSlideTitle: z.string().optional(),
  finalSlideDescription: z.string().optional(),
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
      // @ts-ignore
      finalSlideTitle: props.finalSlideTitle || '',
      // @ts-ignore
      finalSlideDescription: props.finalSlideDescription || '',
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
                <FormLabel>Video slider titel</FormLabel>
                <Input
                  {...field}
                  onChange={(e) => {
                    field.onChange(e);
                    onFieldChange(field.name, e.target.value);
                  }}
                />
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
            name="finalSlideTitle"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Bevestiging -- titel</FormLabel>
                <Input
                  {...field}
                  onChange={(e) => {
                    field.onChange(e);
                    onFieldChange(field.name, e.target.value);
                  }}
                />
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="finalSlideDescription"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Bevestiging -- beschrijving</FormLabel>
                <Input
                  {...field}
                  onChange={(e) => {
                    field.onChange(e);
                    onFieldChange(field.name, e.target.value);
                  }}
                />
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
