import React from 'react';
import { Button } from '../../../../../../components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../../../../../../components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../../../../components/ui/select';
import { Input } from '../../../../../../components/ui/input';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Heading } from '@/components/ui/typography';
import { Separator } from '@/components/ui/separator';
import { LikeWidgetProps } from '@openstad-headless/likes/src/likes';
import { EditFieldProps } from '@/lib/form-widget-helpers/EditFieldProps';
import { useFieldDebounce } from '@/hooks/useFieldDebounce';
import { ObjectListSelect } from '@/components/ui/object-select';
import useResources from '@/hooks/use-resources';
import { FormObjectSelectField } from '@/components/ui/form-object-select-field';

const formSchema = z.object({
  title: z.string(),
  variant: z.enum(['small', 'medium', 'large']),
  yesLabel: z.string(),
  noLabel: z.string(),
  hideCounters: z.boolean(),
  resourceId: z.string().optional(),
});
type FormData = z.infer<typeof formSchema>;

export default function LikesDisplay(
  props: LikeWidgetProps & EditFieldProps<LikeWidgetProps>
) {
  const { onFieldChange } = useFieldDebounce(props.onFieldChanged);
  const { data, error } = useResources(props.projectId);
  // Force at least minimal typehinting
  const resources: Array<{ id: string | number; title: string }> = data || [];

  function onSubmit(values: FormData) {
    props.updateConfig({ ...props, ...values });
  }

  const form = useForm<FormData>({
    resolver: zodResolver<any>(formSchema),
    defaultValues: {
      resourceId: props?.resourceId,
      title: props?.title || 'Wat vindt u van dit plan',
      variant: props?.variant || 'medium',
      yesLabel: props?.yesLabel || 'Ja',
      noLabel: props?.noLabel || 'Nee',
      hideCounters: props?.hideCounters || false,
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
        <FormObjectSelectField
          form={form}
          fieldName="resourceId"
          fieldLabel="Koppel aan een specifieke resource"
          items={resources}
          keyForValue="id"
          label={(resource) => `${resource.id} ${resource.title}`}
          onFieldChanged={props.onFieldChanged}
          noSelection="Niet koppelen (gebruik queryparam openstadResourceId)"
        />

        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Titel</FormLabel>
              <FormControl>
                <Input
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
          name="yesLabel"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Label voor &quot;Ja&quot;</FormLabel>
              <FormControl>
                <Input
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
          name="noLabel"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Label voor &quot;Nee&quot;</FormLabel>
              <FormControl>
                <Input
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
          name="variant"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Variant type</FormLabel>
              <Select
                onValueChange={(value) => {
                  field.onChange(value);
                  props.onFieldChanged(field.name, value);
                }}
                value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Standaard" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="small">Compact</SelectItem>
                  <SelectItem value="medium">Standaard</SelectItem>
                  <SelectItem value="large">Groot</SelectItem>
                </SelectContent>
              </Select>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="hideCounters"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Moet het aantal stemmen verborgen worden?</FormLabel>
              <Select
                onValueChange={(e: string) => {
                  field.onChange(e === 'true');
                  props.onFieldChanged(field.name, e === 'true');
                }}
                value={field.value ? 'true' : 'false'}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Nee" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="true">Ja</SelectItem>
                  <SelectItem value="false">Nee</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">Opslaan</Button>
      </form>
    </Form>
  );
}
