import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl, FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { Heading } from '@/components/ui/typography';
import { useFieldDebounce } from '@/hooks/useFieldDebounce';
import { EditFieldProps } from '@/lib/form-widget-helpers/EditFieldProps';
import { zodResolver } from '@hookform/resolvers/zod';
import { EnqueteWidgetProps } from '@openstad-headless/enquete/src/enquete';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";
import React from "react";
import InfoDialog from "@/components/ui/info-hover";

const formSchema = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  afterSubmitUrl: z.string().optional(),
  formVisibility: z.string().optional(),
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
      formVisibility: props?.formVisibility || 'always',
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
          className="flex flex-col w-full lg:w-2/3"
          style={{rowGap: '1.8rem'}}>
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Titel</FormLabel>
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
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Beschrijving</FormLabel>
                <FormDescription>
                  Dit veld ondersteunt HTML-opmaak. Je kunt bijvoorbeeld:

                  <ul>
                    <li><strong>Vetgedrukte tekst</strong>: &lt;strong&gt;tekst&lt;/strong&gt;</li>
                    <li><strong>Lijsten maken</strong>: &lt;ul&gt;&lt;li&gt;Item 1&lt;/li&gt;&lt;li&gt;Item
                      2&lt;/li&gt;&lt;/ul&gt;</li>
                    <li><strong>Links toevoegen</strong>: &lt;a href="https://voorbeeld.com"&gt;Klik hier&lt;/a&gt;</li>
                  </ul>
                </FormDescription>
                <FormControl>
                  <Textarea
                    rows={6}
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

          <FormField
            control={form.control}
            name="afterSubmitUrl"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Url voor redirecten na opslaan (optioneel)</FormLabel>
                <FormDescription>
                  Geef een pad op waar de gebruiker na het invullen van de enquête naartoe wordt gestuurd.
                  Bijvoorbeeld /bedankt of laat leeg voor geen redirect.
                  Als er geen redirect is, wordt de gebruiker op de pagina gelaten en krijgt de gebruiker enkel kort een melding te zien dat de enquête is ingevuld.
                </FormDescription>
                <FormControl>
                  <Input
                    {...field}
                    placeholder=''
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
