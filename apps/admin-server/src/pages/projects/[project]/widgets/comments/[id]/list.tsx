import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Heading } from '@/components/ui/typography';
import { useFieldDebounce } from '@/hooks/useFieldDebounce';
import { EditFieldProps } from '@/lib/form-widget-helpers/EditFieldProps';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { ArgumentWidgetTabProps } from '.';

const formSchema = z.object({
  title: z.string(),
  emptyListText: z.string(),
  closedText: z.string(),
});

type SchemaKey = keyof typeof formSchema.shape;

export default function ArgumentsList({
  omitSchemaKeys = [],
  ...props
}:ArgumentWidgetTabProps &
  EditFieldProps<ArgumentWidgetTabProps> & { omitSchemaKeys?: Array<SchemaKey> }) {
  const finalSchema = formSchema.omit(
    omitSchemaKeys.reduce(
      (prev, key) => Object.assign(prev, { [key]: true }),
      {}
    )
  );

  type FinalSchemaInfer = z.infer<typeof finalSchema>;

  const form = useForm<FinalSchemaInfer>({
    resolver: zodResolver<any>(finalSchema),
    defaultValues: {
      title: props?.title || '',
      emptyListText: props?.emptyListText || 'Nog geen reacties geplaatst.',
      closedText: props?.closedText || 'Het insturen van reacties is gesloten, u kunt niet meer reageren',
    },
  });

  const { onFieldChange } = useFieldDebounce(props.onFieldChanged);

  function onSubmit(values: FinalSchemaInfer) {
    props.updateConfig({ ...props, ...values });
  }

  return (
    <div className="p-6 bg-white rounded-md">
      <Form {...form}>
        <Heading size="xl">{props.customTitle || 'Titel'}</Heading>
        <Separator className="my-4" />
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-4">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Titel</FormLabel>
                <FormControl>
                  <Input
                    placeholder='[[nr]] reacties'
                    {...field}
                    onChange={(e) => {
                      onFieldChange(field.name, e.target.value);
                      field.onChange(e);
                    }}
                  />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="emptyListText"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Placeholder</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Dit wordt weergegeven wanneer er geen reacties zijn."
                    {...field}
                    onChange={(e) => {
                      onFieldChange(field.name, e.target.value);
                      field.onChange(e);
                    }}
                  />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="closedText"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Welke tekst wil je tonen wanneer het niet meer mogelijk is om te reageren?</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Dit wordt weergegeven wanneer het reageren niet meer mogelijk is."
                    {...field}
                    onChange={(e) => {
                      onFieldChange(field.name, e.target.value);
                      field.onChange(e);
                    }}
                  />
                </FormControl>
              </FormItem>
            )}
          />
          <Button type="submit">Opslaan</Button>
        </form>
      </Form>
    </div>
  );
}
