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
import { EnqueteWidgetProps } from '@openstad-headless/enquete/src/enquete';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";
import React from "react";

const formSchema = z.object({
  displayTitle: z.boolean(),
  displayDescription: z.boolean().optional(),
  formVisibility: z.string().optional(),
});

export default function WidgetEnqueteDisplay(
  props: EnqueteWidgetProps & EditFieldProps<EnqueteWidgetProps>
) {
  type FormData = z.infer<typeof formSchema>;

  async function onSubmit(values: FormData) {
    props.updateConfig({ ...props, ...values });
  }

  const form = useForm<FormData>({
    resolver: zodResolver<any>(formSchema),
    defaultValues: {
      displayTitle: props?.displayTitle || false,
      formVisibility: props?.formVisibility || 'always',
    },
  });

  return (
    <div className="p-6 bg-white rounded-md">
      <Form {...form}>
        <Heading size="xl">Weergave</Heading>
        <Separator className="my-4" />
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="lg:w-3/4 grid grid-cols-1 lg:grid-cols-2 gap-x-4 gap-y-8">
          <FormField
            control={form.control}
            name="displayTitle"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Enquête titel weergeven</FormLabel>
                {YesNoSelect(field, props)}
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="displayDescription"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Enquête beschrijving weergeven</FormLabel>
                {YesNoSelect(field, props)}
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
              control={form.control}
              name="formVisibility"
              render={({ field }) => (
                  <FormItem>
                    <FormLabel>Voor wie is de enquête zichtbaar?</FormLabel>
                    <Select
                        value={field.value}
                        onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Kies een optie" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="always">Iedereen</SelectItem>
                        <SelectItem value="users">Ingelogde gebruikers en admins</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
              )}></FormField>

          <Button className="w-fit col-span-full" type="submit">
            Opslaan
          </Button>
        </form>
      </Form>
    </div>
  );
}
