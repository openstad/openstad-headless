import React, { ReactNode } from 'react';
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
import { YesNoSelect } from '@/lib/form-widget-helpers';
import { LikeWidgetTabProps } from '.';
import * as Switch from '@radix-ui/react-switch';

const formSchema = z.object({
  title: z.string(),
  variant: z.enum(['small', 'medium', 'large']),
  yesLabel: z.string(),
  noLabel: z.string(),
  hideCounters: z.boolean(),
  showProgressBar: z.boolean(),
  displayDislike: z.boolean().optional(),
  progressBarDescription: z.string().optional(),
  resourceId: z.string().optional(),
});
type FormData = z.infer<typeof formSchema>;
type SchemaKey = keyof FormData;

export default function LikesDisplay({
  omitSchemaKeys = [],
  ...props
}: LikeWidgetTabProps &
  EditFieldProps<LikeWidgetTabProps> & {
    omitSchemaKeys?: Array<SchemaKey>;
  }) {
  const finalSchema = formSchema.omit(
    omitSchemaKeys.reduce(
      (prev, key) => Object.assign(prev, { [key]: true }),
      {}
    )
  );

  type FinalSchemaInfer = z.infer<typeof finalSchema>;

  const conditionallyRenderField = (key: SchemaKey, field: ReactNode) => {
    return key in finalSchema.shape ? field : null;
  };

  const { onFieldChange } = useFieldDebounce(props.onFieldChanged);
  const { data, error } = useResources(props.projectId);
  // Force at least minimal typehinting
  const resources: Array<{ id: string | number; title: string }> = data || [];

  function onSubmit(values: FinalSchemaInfer) {
    props.updateConfig({ ...props, ...values });
  }

  const form = useForm<FinalSchemaInfer>({
    resolver: zodResolver<any>(finalSchema),
    defaultValues: {
      resourceId: props?.resourceId,
      title: props?.title,
      variant: props?.variant || 'medium',
      yesLabel: props?.yesLabel || 'Ja',
      noLabel: props?.noLabel || 'Nee',
      displayDislike: props?.displayDislike || false,
      hideCounters: props?.hideCounters || false,
      showProgressBar: props?.showProgressBar || true,
      progressBarDescription: props?.progressBarDescription || '',
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
          'title',
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
        )}

        {conditionallyRenderField(
          'yesLabel',
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
        )}

        {conditionallyRenderField(
          'noLabel',
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
        )}

        {conditionallyRenderField(
          'variant',
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
        )}

        {conditionallyRenderField(
          'hideCounters',
          <FormField
            control={form.control}
            name="hideCounters"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Moet het aantal stemmen verborgen worden?</FormLabel>
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
        )}

        {conditionallyRenderField(
          'displayDislike',
          <FormField
            control={form.control}
            name="displayDislike"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Wil je de dislike button tonen?</FormLabel>
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
        )}

        {conditionallyRenderField(
          'showProgressBar',
          <FormField
            control={form.control}
            name="showProgressBar"
            render={({ field }) => (
              <FormItem className="col-span-1">
                <FormLabel>Voortgang balk weergeven</FormLabel>
                {YesNoSelect(field, props)}
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {conditionallyRenderField(
          'progressBarDescription',
          <FormField
            control={form.control}
            name="progressBarDescription"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Voortgang balk informatie</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Wat representeert de progressie balk?"
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
        )}

        <Button type="submit">Opslaan</Button>
      </form>
    </Form>
  );
}
