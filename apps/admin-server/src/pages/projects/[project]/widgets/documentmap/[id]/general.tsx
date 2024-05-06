import { Calendar } from '@/components/ui/calendar';
import { Separator } from '@/components/ui/separator';
import { Heading } from '@/components/ui/typography';
import { useFieldDebounce } from '@/hooks/useFieldDebounce';
import { EditFieldProps } from '@/lib/form-widget-helpers/EditFieldProps';
import type { DocumentMapProps } from '@openstad-headless/documentMap/src/documentMap';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '../../../../../../components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from '../../../../../../components/ui/form';
import { Input } from '../../../../../../components/ui/input';
import { useState, useEffect } from 'react';

const formSchema = z.object({
  documentUrl: z.string().optional(),
});
type FormData = z.infer<typeof formSchema>;

export default function CountdownBarGeneral(
  props: DocumentMapProps &
    EditFieldProps<DocumentMapProps>
) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const { onFieldChange } = useFieldDebounce(props.onFieldChanged);

  function onSubmit(values: FormData) {
    props.updateConfig({ ...props, ...values });
  }

  const form = useForm<DocumentMapProps>({
    defaultValues: {
      documentUrl: props.documentUrl || '',
    },
  });

  return (
    <Form {...form} className="p-6 bg-white rounded-md">
      <Heading size="xl" className="mb-4">
        Instellingen
      </Heading>
      <Separator className="mb-4" />
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-4 lg:w-1/2">
        <FormField
          control={form.control}
          name="documentUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Text links van de dagen kaart(en)</FormLabel>
              <FormControl>
                <Input
                  placeholder="test"
                  defaultValue={field.value}
                  onChange={(e) => {
                    field.onChange(e);
                    onFieldChange(field.name, e.target.value);
                  }}
                />
              </FormControl>
            </FormItem>
          )}
        />

        <Button type="submit">Opslaan</Button>
      </form>
    </Form>
  );
}
