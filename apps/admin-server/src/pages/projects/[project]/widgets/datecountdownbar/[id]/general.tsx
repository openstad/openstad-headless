import { Calendar } from '@/components/ui/calendar';
import { Separator } from '@/components/ui/separator';
import { Heading } from '@/components/ui/typography';
import { useFieldDebounce } from '@/hooks/useFieldDebounce';
import { EditFieldProps } from '@/lib/form-widget-helpers/EditFieldProps';
import { zodResolver } from '@hookform/resolvers/zod';
import type { DateCountdownBarWidgetProps } from '@openstad-headless/date-countdown-bar/src/date-countdown-bar';
import { parseISO } from 'date-fns';
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
  beforeText: z.string().optional(),
  afterText: z.string().optional(),
  date: z.string().optional(),
});
type FormData = z.infer<typeof formSchema>;

export default function CountdownBarGeneral(
  props: DateCountdownBarWidgetProps &
    EditFieldProps<DateCountdownBarWidgetProps>
) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const { onFieldChange } = useFieldDebounce(props.onFieldChanged);

  useEffect(() => {
    if (!selectedDate && props.date) {
      setSelectedDate(parseISO(props.date));
    } else if(props && (!props.date && !selectedDate)) {
      setSelectedDate(new Date());
    }
  }, [selectedDate, props.date]);

  function onSubmit(values: FormData) {
    props.updateConfig({ ...props, ...values });
  }

  const form = useForm<FormData>({
    resolver: zodResolver<any>(formSchema),
    defaultValues: {
      beforeText: props.beforeText || '',
      afterText: props.afterText || '',
      date: props.date,
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
                  placeholder="Bijv: Het is voorbij over"
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
                  placeholder="Bijv: dagen"
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
              <FormLabel>Einddatum</FormLabel>
              <FormControl>
                <>
                  {selectedDate ? (
                    <Calendar
                      selected={selectedDate}
                      fromDate={new Date()}
                      defaultMonth={selectedDate}
                      onDayClick={(day) => {
                        setSelectedDate(day);
                        field.onChange(day.toISOString());
                        onFieldChange(field.name, day.toISOString());
                      }}
                    />
                  ) : null}
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
