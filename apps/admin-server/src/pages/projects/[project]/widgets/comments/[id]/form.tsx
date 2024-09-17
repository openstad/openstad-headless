import { Button } from '@/components/ui/button';
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
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { EditFieldProps } from '@/lib/form-widget-helpers/EditFieldProps';
import { useFieldDebounce } from '@/hooks/useFieldDebounce';
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
      formIntro: props.formIntro || 'Typ hier de intro tekst',
      loginText: props.loginText || 'Inloggen om deel te nemen aan de discussie.',
      placeholder: props?.placeholder || 'Typ hier uw reactie.',
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    props.updateConfig({ ...props, ...values });
  }

  const { onFieldChange } = useFieldDebounce(props.onFieldChanged);

  return (
    <div className="p-6 bg-white rounded-md">
      <Form {...form}>
        <Heading size="xl">{props.customTitle || 'Formulier'}</Heading>
        <Separator className="my-4" />
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-4">
          <FormField
            control={form.control}
            name="formIntro"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Formulier intro</FormLabel>
                <FormControl>
                  <Input
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
          <Button type="submit">Opslaan</Button>
        </form>
      </Form>
    </div>
  );
}
