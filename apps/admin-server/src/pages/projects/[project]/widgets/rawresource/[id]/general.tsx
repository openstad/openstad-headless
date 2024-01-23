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
import { Textarea } from '@/components/ui/textarea';
import { Heading } from '@/components/ui/typography';
import { useFieldDebounce } from '@/hooks/useFieldDebounce';
import { EditFieldProps } from '@/lib/form-widget-helpers/EditFieldProps';
import { zodResolver } from '@hookform/resolvers/zod';
import { RawResourceWidgetProps } from '@openstad/raw-resource/src/raw-resource';
import { useCallback, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

const formSchema = z.object({
  rawInput: z.string(),
});

export default function WidgetRawGeneral(
  props: RawResourceWidgetProps & EditFieldProps<RawResourceWidgetProps>
) {
  type FormData = z.infer<typeof formSchema>;
  async function onSubmit(values: FormData) {
    props.updateConfig({ ...props, ...values });
  }
  const { onFieldChange } = useFieldDebounce(props.onFieldChanged);

  const defaults = useCallback(
    () => ({
      rawInput: props?.rawInput || '',
    }),
    [props?.rawInput]
  );

  const form = useForm<FormData>({
    resolver: zodResolver<any>(formSchema),
    defaultValues: defaults(),
  });

  useEffect(() => {
    form.reset(defaults());
  }, [form, defaults]);

  return (
    <div className="p-6 bg-white rounded-md">
      <Form {...form}>
        <Heading size="xl">Algemeen</Heading>
        <Separator className="my-4" />
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="rawInput"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Template</FormLabel>
                <div className="text-xs pb-4">
                  <h2>Te gebruiken variabelen:</h2>
                  <ul className="list-disc">
                    <li className="ml-4">{`{{projectId}}`}</li>
                  </ul>
                </div>
                <FormControl>
                  <Textarea
                    rows={5}
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
          <Button className="w-fit col-span-full" type="submit">
            Opslaan
          </Button>
        </form>
      </Form>
    </div>
  );
}
