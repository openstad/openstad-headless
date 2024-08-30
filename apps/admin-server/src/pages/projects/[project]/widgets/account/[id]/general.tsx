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

const formSchema = z.object({
  allowNickname: z.boolean(),
  minLength: z.number().optional(),
  maxLength: z.number().optional(),
  allowUserEdit: z.boolean().optional(),
});
type Formdata = z.infer<typeof formSchema>;

export default function AccountDisplay(
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
      allowNickname: props.allowNickname,
      minLength: props.minLength,
      maxLength: props.maxLength,
      allowUserEdit: props.allowUserEdit,
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

        {/* Issues when saving the form, commented for now since they are not mandatory */}
        {/* <FormField
          control={form.control}
          name="minLength"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Minimum aantal tekens</FormLabel>
              <FormControl>
                <Input
                  defaultValue={field.value}
                  onChange={(e) => {
                    field.onChange(e);
                  }}
                />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="maxLength"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Maximum aantal tekens</FormLabel>
              <FormControl>
                <Input
                  defaultValue={field.value}
                  onChange={(e) => {
                    field.onChange(e);
                  }}
                />
              </FormControl>
            </FormItem>
          )}
        /> */}

        <FormField
          control={form.control}
          name="allowNickname"
          render={({ field }) => (
            <FormItem className="col-span-1">
              <FormLabel>Gebruikersnaam toestaan</FormLabel>
              {YesNoSelect(field, props)}
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="allowUserEdit"
          render={({ field }) => (
            <FormItem className="col-span-1">
              <FormLabel>Bewerken toestaan</FormLabel>
              {YesNoSelect(field, props)}
              <FormMessage />
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
