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
import { Heading } from '@/components/ui/typography';
import { useSyncDraftForm } from '@/hooks/useWidgetDraft';
import { EditFieldProps } from '@/lib/form-widget-helpers/EditFieldProps';
import { zodResolver } from '@hookform/resolvers/zod';
import { ResourceFormWidgetProps } from '@openstad-headless/resource-form/src/props';
import * as Switch from '@radix-ui/react-switch';
import { useCallback } from 'react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

const formSchema = z.object({
  allowAnonymousSubmissions: z.boolean(),
  loginText: z.string(),
  loginButtonText: z.string(),
});

export default function WidgetResourceFormInfo(
  props: ResourceFormWidgetProps & EditFieldProps<ResourceFormWidgetProps>
) {
  type FormData = z.infer<typeof formSchema>;
  const category = 'info';

  const info = (props as any)[category] || {};

  const form = useForm<FormData>({
    resolver: zodResolver<any>(formSchema),
    defaultValues: {
      allowAnonymousSubmissions: info.allowAnonymousSubmissions || false,
      loginText: info.loginText || '',
      loginButtonText: info.loginButtonText || '',
    },
  });

  const { onFieldChanged } = props;
  const pushToDraft = useCallback(
    (name: string, value: any) =>
      onFieldChanged?.(`${category}.${name}`, value),
    [onFieldChanged, category]
  );
  useSyncDraftForm(form, pushToDraft, {
    schema: formSchema,
    label: 'Weergave',
  });

  return (
    <div className="p-6 bg-white rounded-md">
      <Form {...form}>
        <Heading size="xl">Weergave</Heading>
        <Separator className="my-4" />
        <form className="lg:w-2/3 grid grid-cols-1 gap-4">
          <FormField
            control={form.control}
            name="allowAnonymousSubmissions"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Mogen niet‑ingelogde gebruikers inzenden?</FormLabel>
                <Switch.Root
                  className="block w-[50px] h-[25px] bg-stone-300 rounded-full relative focus:shadow-[0_0_0_2px] focus:shadow-black data-[state=checked]:bg-primary outline-none cursor-default"
                  onCheckedChange={(e: boolean) => {
                    field.onChange(e);
                  }}
                  checked={field.value}>
                  <Switch.Thumb className="block w-[21px] h-[21px] bg-white rounded-full transition-transform duration-100 translate-x-0.5 will-change-transform data-[state=checked]:translate-x-[27px]" />
                </Switch.Root>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="loginText"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Login tekst</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="loginButtonText"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Login knoptekst</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </form>
      </Form>
    </div>
  );
}
