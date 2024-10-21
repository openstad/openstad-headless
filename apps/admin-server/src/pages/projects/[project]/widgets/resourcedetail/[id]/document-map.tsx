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
import { Heading } from '@/components/ui/typography';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { ResourceDetailWidgetProps } from '@openstad-headless/resource-detail/src/resource-detail';
import { EditFieldProps } from '@/lib/form-widget-helpers/EditFieldProps';
import { useCallback, useEffect, useState } from 'react';
import { useFieldDebounce } from '@/hooks/useFieldDebounce';
import * as React from "react";

const formSchema = z.object({
  backUrlText: z.string().optional(),
  backUrlIdRelativePath: z
    .string()
    .optional()
    .refine(
      (value) => !value || value.includes('[id]'),
      'Specificeer een [id] veld'
    ),
});

export default function WidgetResourceDetailDocumentMap(
  props: ResourceDetailWidgetProps & EditFieldProps<ResourceDetailWidgetProps>
) {

  type FormData = z.infer<typeof formSchema>;
  async function onSubmit(values: FormData) {
    props.updateConfig({ ...props, ...values });
  }

  const { onFieldChange } = useFieldDebounce(props.onFieldChanged);

  const defaults = useCallback(
    () => ({
      backUrlText: props?.backUrlText || 'Terug naar het document',
      backUrlIdRelativePath: props?.backUrlIdRelativePath || undefined
    }),
    [props?.backUrlText, props?.backUrlIdRelativePath]
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
        <Heading size="xl">Instellingen interactieve afbeelding.</Heading>
        <FormDescription>Pas de instellingen van de interactieve afbeelding aan.</FormDescription>
        <Separator className="my-4" />
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-4 lg:w-1/2">

          <FormField
            control={form.control}
            name="backUrlText"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tekst van de terug knop</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Terug naar het document"
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
            name="backUrlIdRelativePath"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Relatief pad naar document
                </FormLabel>
                <em className="text-xs">Beschrijf hoe de inzending gehaald wordt uit de url: (/pad/naar/[id]) of laat leeg om terug te vallen op ?openstadResourceId</em>
                <FormControl>
                  <Input {...field} onChange={(e) => {
                    onFieldChange(field.name, e.target.value);
                    field.onChange(e);
                  }} />
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
