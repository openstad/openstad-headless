import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Heading } from '@/components/ui/typography';
import { useFieldDebounce } from '@/hooks/useFieldDebounce';
import { useSyncDraftForm } from '@/hooks/useWidgetDraft';
import { EditFieldProps } from '@/lib/form-widget-helpers/EditFieldProps';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

import { ArgumentWidgetTabProps } from '.';

const formSchema = z.object({
  formIntro: z.string(),
  placeholder: z.string(),
  loginText: z.string().optional(),
});

export default function ArgumentsForm(
  props: ArgumentWidgetTabProps & EditFieldProps<ArgumentWidgetTabProps>
) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver<any>(formSchema),
    defaultValues: {
      // Hardcoded fallbacks would show text that is not in the config: emptying
      // such a field then produces no change against the stored value, so the
      // save bar stays disabled and the field can never be cleared.
      formIntro: props.formIntro ?? '',
      loginText: props.loginText ?? '',
      placeholder: props?.placeholder ?? '',
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    props.updateConfig({ ...props, ...values });
  }

  const { onFieldChange } = useFieldDebounce(props.onFieldChanged);
  useSyncDraftForm(form, props.onFieldChanged, {
    schema: formSchema,
    label: props.customTitle || 'Formulier',
  });

  return (
    <div className="p-6 bg-white rounded-md">
      <Form {...form}>
        <Heading size="xl">{props.customTitle || 'Formulier'}</Heading>
        <Separator className="my-4" />
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="formIntro"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Formulier intro</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Typ hier de intro tekst"
                    {...field}
                    onChange={(e) => {
                      onFieldChange(field.name, e.target.value);
                      field.onChange(e);
                    }}
                  />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="placeholder"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Placeholder tekst</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Dit wordt weergegeven wanneer er nog niets is ingevuld door de gebruiker."
                    {...field}
                    onChange={(e) => {
                      onFieldChange(field.name, e.target.value);
                      field.onChange(e);
                    }}
                  />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="loginText"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Placeholder tekst</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Dit wordt weergegeven wanneer de gebruiker nog niet is ingelogd."
                    {...field}
                    onChange={(e) => {
                      onFieldChange(field.name, e.target.value);
                      field.onChange(e);
                    }}
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </form>
      </Form>
    </div>
  );
}
