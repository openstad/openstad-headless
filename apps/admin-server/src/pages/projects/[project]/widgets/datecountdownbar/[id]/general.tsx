import React from 'react';
import { Button } from '../../../../../../components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from '../../../../../../components/ui/form';
import { Input } from '../../../../../../components/ui/input';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Heading } from '@/components/ui/typography';
import { Separator } from '@/components/ui/separator';
import { EditFieldProps } from '@/lib/form-widget-helpers/EditFieldProps';
import { useFieldDebounce } from '@/hooks/useFieldDebounce';
import type { DateCountdownBarWidgetProps } from '@openstad/date-countdown-bar/src/date-countdown-bar';

const formSchema = z.object({
  beforeText: z.string().optional(),
  afterText:z.string().optional(),
  date: z.string().optional()

});
type FormData = z.infer<typeof formSchema>;

export default function CountdownBarGeneral(props: DateCountdownBarWidgetProps & EditFieldProps<DateCountdownBarWidgetProps>) {
  const { onFieldChange } = useFieldDebounce(props.onFieldChanged);

  function onSubmit(values: FormData) {
    props.updateConfig({...props, ...values});
  }

  const form = useForm<FormData>({
    resolver: zodResolver<any>(formSchema),
    defaultValues: {
      beforeText: props.beforeText || "",
      afterText: props.afterText || "",
      date: props.date
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
          name="beforeText"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Text links van de dagen kaart(en)</FormLabel>
              <FormControl>
                <Input
                  placeholder='Bijv: Het is voorbij over'
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

        <FormField
          control={form.control}
          name="afterText"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Text rechts van de dagen kaart(en)</FormLabel>
              <FormControl>
                <Input
                  placeholder='Bijv: dagen'
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

        <FormField
          control={form.control}
          name="date"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Datum</FormLabel>
              <FormControl>
                <>  
                <Input
                  placeholder='Bijv: 24-01-2024'
                  defaultValue={field.value}
                  onChange={(e) => {
                    field.onChange(e);
                    onFieldChange(field.name, e.target.value);
                  }}
                />
                </>
              </FormControl>
            </FormItem>
          )}
        />

        <Button type="submit">Opslaan</Button>
      </form>
    </Form>
  );
}
