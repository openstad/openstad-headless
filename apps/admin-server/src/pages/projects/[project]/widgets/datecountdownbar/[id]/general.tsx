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
  FormMessage
} from '../../../../../../components/ui/form';
import { Input } from '../../../../../../components/ui/input';
import { useState, useEffect } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import * as Switch from '@radix-ui/react-switch';


const formSchema = z.object({
  beforeText: z.string().optional(),
  afterText: z.string().optional(),
  date: z.string().optional(),
  direction: z.string().optional(),
  showLabels: z.boolean().optional(),
  showHours: z.boolean().optional(),
  showMinutes: z.boolean().optional(),
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
    } else if (props && (!props.date && !selectedDate)) {
      setSelectedDate(new Date());
    }
  }, [selectedDate, props.date, props]);

  function onSubmit(values: FormData) {
    props.updateConfig({ ...props, ...values, direction: values.direction as "horizontal" | "vertical" });
  }

  const form = useForm<FormData>({
    resolver: zodResolver<any>(formSchema),
    defaultValues: {
      beforeText: props.beforeText || '',
      afterText: props.afterText || '',
      date: props.date,
      direction: props.direction || 'horizontal',
      showLabels: props.showLabels,
      showHours: props.showHours,
      showMinutes: props.showMinutes,
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
              <FormLabel>Tekst links van de dagen kaart(en)</FormLabel>
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
              <FormLabel>Tekst rechts van de dagen kaart(en)</FormLabel>
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
          name="direction"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Selecteer weergave</FormLabel>
              <Select onValueChange={(e) => {
                field.onChange(e);
                props.onFieldChanged(field.name, e);
              }} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecteer weergave" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent className='overflow-y-auto max-h-[16rem]'>
                  <SelectItem key={1} value={'horizontal'}>
                    Naast elkaar
                  </SelectItem>
                  <SelectItem key={2} value={'vertical'}>
                    Onder elkaar
                  </SelectItem>
                </SelectContent>
              </Select>
            </FormItem>
          )}
        />
        <div className='grid grid-cols-3'>
          <FormField
            control={form.control}
            name="showLabels"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Toon labels</FormLabel>
                <Switch.Root
                  className="block w-[50px] h-[25px] bg-stone-300 rounded-full relative focus:shadow-[0_0_0_2px] focus:shadow-black data-[state=checked]:bg-primary outline-none cursor-default"
                  onCheckedChange={(e: boolean) => {
                    field.onChange(e);
                    props.onFieldChanged(field.name, e);
                  }}
                  checked={field.value}>
                  <Switch.Thumb className="block w-[21px] h-[21px] bg-white rounded-full transition-transform duration-100 translate-x-0.5 will-change-transform data-[state=checked]:translate-x-[27px]" />
                </Switch.Root>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="showHours"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Toon uren</FormLabel>
                <Switch.Root
                  className="block w-[50px] h-[25px] bg-stone-300 rounded-full relative focus:shadow-[0_0_0_2px] focus:shadow-black data-[state=checked]:bg-primary outline-none cursor-default"
                  onCheckedChange={(e: boolean) => {
                    field.onChange(e);
                    props.onFieldChanged(field.name, e);
                  }}
                  checked={field.value}>
                  <Switch.Thumb className="block w-[21px] h-[21px] bg-white rounded-full transition-transform duration-100 translate-x-0.5 will-change-transform data-[state=checked]:translate-x-[27px]" />
                </Switch.Root>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="showMinutes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Toon minuten</FormLabel>
                <Switch.Root
                  className="block w-[50px] h-[25px] bg-stone-300 rounded-full relative focus:shadow-[0_0_0_2px] focus:shadow-black data-[state=checked]:bg-primary outline-none cursor-default"
                  onCheckedChange={(e: boolean) => {
                    field.onChange(e);
                    props.onFieldChanged(field.name, e);
                  }}
                  checked={field.value}>
                  <Switch.Thumb className="block w-[21px] h-[21px] bg-white rounded-full transition-transform duration-100 translate-x-0.5 will-change-transform data-[state=checked]:translate-x-[27px]" />
                </Switch.Root>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
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
