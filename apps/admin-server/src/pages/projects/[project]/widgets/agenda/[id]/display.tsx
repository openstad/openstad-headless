import { Button } from '@/components/ui/button';
import {
  Form, FormControl,
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
import { AgendaWidgetProps } from '@openstad-headless/agenda/src/agenda';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";
import * as React from "react";
import {Input} from "@/components/ui/input";
import {useFieldDebounce} from "@/hooks/useFieldDebounce";

const formSchema = z.object({
  displayTitle: z.boolean(),
  displayToggle: z.boolean().optional(),
  toggleDefaultClosed: z.boolean().optional(),
  toggleShowText: z.string().optional(),
  toggleHideText: z.string().optional(),
  defaultClosedFromBreakpoint: z.enum(['not', '480', '640', '768', '1024']).optional()
});

export default function WidgetAgendaDisplay(
  props: AgendaWidgetProps & EditFieldProps<AgendaWidgetProps>
) {
  type FormData = z.infer<typeof formSchema>;
  const { onFieldChange } = useFieldDebounce(props.onFieldChanged);

  async function onSubmit(values: FormData) {
    props.updateConfig({ ...props, ...values });
  }

  const form = useForm<FormData>({
    resolver: zodResolver<any>(formSchema),
    defaultValues: {
      displayTitle: props?.displayTitle || false,
      displayToggle: props?.displayToggle || false,
      toggleDefaultClosed: props?.toggleDefaultClosed || false,
      toggleShowText: props?.toggleShowText || 'Lees meer',
      toggleHideText: props?.toggleHideText || 'Lees minder',
      defaultClosedFromBreakpoint: props?.defaultClosedFromBreakpoint || 'not',
    },
  });

  return (
    <div className="p-6 bg-white rounded-md">
      <Form {...form}>
        <Heading size="xl">Weergave</Heading>
        <Separator className="my-4" />
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="lg:w-3/4 grid grid-cols-1 lg:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="displayTitle"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Titel weergeven</FormLabel>
                {YesNoSelect(field, props)}
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="displayToggle"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Toon een knop om de agenda in/uit te klappen
                </FormLabel>
                {YesNoSelect(field, props)}
                <FormMessage />
              </FormItem>
            )}
          />

          { form.watch('displayToggle') && (
            <>
              <FormField
                control={form.control}
                name="toggleDefaultClosed"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Standaard de agenda ingeklapt weergeven
                    </FormLabel>
                    {YesNoSelect(field, props)}
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="toggleShowText"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Tekst voor de knop om de agenda te tonen
                    </FormLabel>
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
                name="toggleHideText"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Tekst voor de knop om de agenda te verbergen
                    </FormLabel>
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

              { !form.watch('toggleDefaultClosed') && (
                <FormField
                  control={form.control}
                  name="defaultClosedFromBreakpoint"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Breekpunt vanaf wanneer de agenda standaard ingeklapt wordt weergegeven
                      </FormLabel>
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
                          <SelectItem value="not">
                            Nooit automatisch inklappen
                          </SelectItem>
                          <SelectItem value="480">
                            <b>480 px</b>: Zeer kleine schermen en kleiner
                          </SelectItem>
                          <SelectItem value="640">
                            <b>640 px</b>: Kleine schermen (mobiel) en kleiner
                          </SelectItem>
                          <SelectItem value="768">
                            <b>768 px</b>: Middelgrote schermen (tablet) en kleiner
                          </SelectItem>
                          <SelectItem value="1024">
                            <b>1024 px</b>: Grote schermen (laptop/desktop) en kleiner
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />
              )}

            </>
          )}


          <Button className="w-fit col-span-full" type="submit">
            Opslaan
          </Button>
        </form>
      </Form>
    </div>
  );
}
