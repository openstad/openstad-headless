import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Heading } from '@/components/ui/typography';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { EditFieldProps } from '@/lib/form-widget-helpers/EditFieldProps';
import { FormObjectSelectField } from '@/components/ui/form-object-select-field';
import useResources from '@/hooks/use-resources';
import React, { ReactNode } from 'react';
import { ArgumentWidgetTabProps } from '.';
import * as Switch from "@radix-ui/react-switch";
import {Input} from "@/components/ui/input";
import {useFieldDebounce} from "@/hooks/useFieldDebounce";
import {YesNoSelect} from "@/lib/form-widget-helpers";

const formSchema = z.object({
  resourceId: z.string().optional(),
  sentiment: z.string(),
  useSentiments: z.string().optional(),
  itemsPerPage: z.coerce.number(),
  displayPagination: z.boolean().optional(),
  displaySearchBar: z.boolean().optional(),
  extraReplyButton: z.boolean().optional(),
});

type SchemaKey = keyof typeof formSchema.shape;

export default function ArgumentsGeneral({
  omitSchemaKeys = [],
  ...props
}: ArgumentWidgetTabProps &
  EditFieldProps<ArgumentWidgetTabProps> & {
    omitSchemaKeys?: Array<SchemaKey>;
  }) {
  const finalSchema = formSchema.omit(
    omitSchemaKeys.reduce(
      (prev, key) => Object.assign(prev, { [key]: true }),
      {}
    )
  );

  type finalSchemaInfer = z.infer<typeof finalSchema>;

  const conditionallyRenderField = (key: SchemaKey, field: ReactNode) => {
    return key in finalSchema.shape ? field : null;
  };

  const { onFieldChange } = useFieldDebounce(props.onFieldChanged);

  const form = useForm<finalSchemaInfer>({
    resolver: zodResolver<any>(finalSchema),
    defaultValues: {
      resourceId: props.resourceId,
      sentiment: props.sentiment || 'for',
      useSentiments: JSON.stringify(props.useSentiments || ["for","against"]),
      itemsPerPage: props?.itemsPerPage || 9999,
      displayPagination: props?.displayPagination || false,
      displaySearchBar: props?.displaySearchBar || false,
      extraReplyButton: props?.extraReplyButton || false,
    },
  });

  function onSubmit(values: finalSchemaInfer) {
    let useSentiments;
    try {
      useSentiments = JSON.parse(values.useSentiments || '');
    } catch(err) {}
    props.updateConfig({ ...props, ...values, useSentiments });
  }

  const { data } = useResources(props.projectId);
  const resources: Array<{ id: string | number; title: string }> = data || [];

  return (
    <div className="p-6 bg-white rounded-md">
      <Form {...form}>
        <Heading size="xl">Algemeen</Heading>
        <Separator className="my-4" />

        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-4 lg:w-1/2">
          {conditionallyRenderField(
            'resourceId',
            <FormObjectSelectField
              form={form}
              fieldName="resourceId"
              fieldLabel="Koppel aan een specifieke inzending"
              items={resources}
              keyForValue="id"
              label={(resource) => `${resource.id} ${resource.title}`}
              onFieldChanged={props.onFieldChanged}
              noSelection="Niet koppelen (gebruik queryparam openstadResourceId)"
            />
          )}

          {conditionallyRenderField(
            'sentiment',
            <FormField
              control={form.control}
              name="sentiment"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Sentiment</FormLabel>
                  <Select
                    value={field.value}
                    onValueChange={(value) => {
                      field.onChange(value);
                      props.onFieldChanged(field.name, value);
                    }}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Voor" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="for">Voor</SelectItem>
                      <SelectItem value="against">Tegen</SelectItem>
                      <SelectItem value="none">Geen sentiment</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          {conditionallyRenderField(
            'useSentiments',
            <FormField
              control={form.control}
              name="useSentiments"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tonen van reacties:</FormLabel>
                  <Select
                    value={field.value}
                    onValueChange={(value) => {
                      field.onChange(value);
                      props.onFieldChanged(field.name, value);
                    }}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Voor" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value='[]'>Toon geen reacties</SelectItem>
                      <SelectItem value='["for","against"]'>Voor en tegen</SelectItem>
                      <SelectItem value='["no sentiment"]'>Eén lijst, geen sentiment</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          <FormField
            control={form.control}
            name="displayPagination"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Paginering tonen</FormLabel>
                <FormControl>
                  <Switch.Root
                    className="block w-[50px] h-[25px] bg-stone-300 rounded-full relative focus:shadow-[0_0_0_2px] focus:shadow-black data-[state=checked]:bg-primary outline-none cursor-default"
                    onCheckedChange={(e: boolean) => {
                      props.onFieldChanged(field.name, e);
                      field.onChange(e);
                    }}
                    checked={field.value}>
                    <Switch.Thumb className="block w-[21px] h-[21px] bg-white rounded-full transition-transform duration-100 translate-x-0.5 will-change-transform data-[state=checked]:translate-x-[27px]" />
                  </Switch.Root>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          { !!form.watch('displayPagination') && (
            <FormField
              control={form.control}
              name="itemsPerPage"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Hoeveelheid items per pagina</FormLabel>
                  <FormControl>
                    <Input type="number" {...field}
                           placeholder="9999"
                           {...field}
                           onChange={(e) => {
                             onFieldChange(field.name, e.target.value);
                             field.onChange(e);
                           }} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          <FormField
            control={form.control}
            name="displaySearchBar"
            render={({ field }) => (
              <FormItem className="col-span-1">
                <FormLabel>
                  Zoekbalk tonen
                </FormLabel>
                {YesNoSelect(field, props)}
                <FormMessage />
              </FormItem>
            )}
          />

                    <FormField
            control={form.control}
            name="extraReplyButton"
            render={({ field }) => (
              <FormItem className="col-span-1">
                <FormLabel>
                  Extra reageer knop
                </FormLabel>
                <FormDescription>
                  Hiermee wordt er onder de lijst met reacties een extra knop "Reageer" getoond, naast de standaard knop boven de lijst.
                </FormDescription>
                {YesNoSelect(field, props)}
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit">Opslaan</Button>
        </form>
      </Form>
    </div>
  );
}
