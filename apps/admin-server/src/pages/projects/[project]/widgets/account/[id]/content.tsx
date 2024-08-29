import React from 'react';
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
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Heading } from '@/components/ui/typography';
import { Separator } from '@/components/ui/separator';
import { AccountWidgetProps } from '@openstad-headless/account/src/account';
import { EditFieldProps } from '@/lib/form-widget-helpers/EditFieldProps';
import { useFieldDebounce } from '@/hooks/useFieldDebounce';
import { useRouter } from 'next/router';
import { YesNoSelect } from '@/lib/form-widget-helpers';
import { over } from 'lodash';

const formSchema = z.object({
  overview_title: z.string().optional(),
  overview_description: z.string().optional(),
  info_title: z.string().optional(),
  info_description: z.string().optional(),
  user_title: z.string().optional(),
  user_description: z.string().optional(),
});
type Formdata = z.infer<typeof formSchema>;

export default function AccountContent(
  props: AccountWidgetProps & EditFieldProps<AccountWidgetProps>
) {
  const { onFieldChange } = useFieldDebounce(props.onFieldChanged);

  const router = useRouter();

  const projectId = router.query.project as string;

  function onSubmit(values: Formdata) {
    props.updateConfig({ ...props, ...values });
  }

  const form = useForm<Formdata>({
    resolver: zodResolver<any>(formSchema),
    defaultValues: {
      overview_title: props.overview_title,
      overview_description: props.overview_description,
      info_title: props.info_title,
      info_description: props.info_description,
      user_title: props.user_title  || 'Mijn gegevens voor deze site',
      user_description: props.user_description || 'Deze gegevens zijn alleen van toepassing op deze website.',
    },
  });

  return (
    <Form {...form} className="p-6 bg-white rounded-md">
      <Heading size="xl" className="mb-4">
        Content
      </Heading>
      <Separator className="mb-4" />
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-4 lg:w-1/2">

        <FormField
          control={form.control}
          name="overview_title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Overzicht titel</FormLabel>
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
          name="overview_description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Overzicht beschrijving</FormLabel>
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
          name="info_title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Persoonlijke gegevens titel</FormLabel>
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
          name="info_description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Persoonlijke gegevens beschrijving</FormLabel>
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
          name="user_title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Gebruikersnaam titel </FormLabel>
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
          name="user_description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Gebruikersnaam beschrijving</FormLabel>
              <FormControl>
                <Input
                  defaultValue={field.value }
                  onChange={(e) => {
                    field.onChange(e);
                    onFieldChange(field.name, e.target.value);
                  }}
                />
              </FormControl>
            </FormItem>
          )}
        />
        <Button className="w-fit col-span-full" type="submit">
          Opslaan
        </Button>
      </form>
    </Form>
  );
}
