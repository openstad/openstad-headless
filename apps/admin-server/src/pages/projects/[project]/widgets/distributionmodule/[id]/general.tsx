import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
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
import { YesNoSelect } from '@/lib/form-widget-helpers';
import { EditFieldProps } from '@/lib/form-widget-helpers/EditFieldProps';
import { zodResolver } from '@hookform/resolvers/zod';
import { DistributionModuleProps } from '@openstad-headless/distribution-module/src/distribution-module';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";
import React from "react";

const formSchema = z.object({
  title: z.string(),
  description: z.string(),
  afterSubmitUrl: z.string().optional(),
  showProgress: z.boolean().optional(),
  formVisibility: z.string().optional(),
});

export default function WidgetDistributionModuleGeneral(
  props: DistributionModuleProps & EditFieldProps<DistributionModuleProps>
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
      showProgress: props.showProgress || false,
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
          className="flex flex-col gap-y-2 w-full lg:w-1/3">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Verdeel module titel</FormLabel>
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
                <FormLabel>Verdeel module beschrijving</FormLabel>
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
                <FormControl>
                  <Input
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
            name="showProgress"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Progressiebalk tonen?</FormLabel>
                <FormControl>
                  {YesNoSelect(field, props)}
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
                <FormLabel>Voor wie is de module zichtbaar?</FormLabel>
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
