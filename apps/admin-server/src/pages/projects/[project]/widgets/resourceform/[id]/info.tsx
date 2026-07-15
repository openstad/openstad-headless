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
import { EditFieldProps } from '@/lib/form-widget-helpers/EditFieldProps';
import { zodResolver } from '@hookform/resolvers/zod';
import { ResourceFormWidgetProps } from '@openstad-headless/resource-form/src/props';
import * as Switch from '@radix-ui/react-switch';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

const formSchema = z.object({
  allowAnonymousSubmissions: z.boolean(),
  nameInHeader: z.boolean(),
  loginText: z.string(),
  loginButtonText: z.string(),
});

export default function WidgetResourceFormInfo(
  props: ResourceFormWidgetProps & EditFieldProps<ResourceFormWidgetProps>
) {
  type FormData = z.infer<typeof formSchema>;
  const category = 'info';

  // This tab feeds the shared whole-widget draft under the `info` key so the
  // header save bar persists it together with every other tab in one request.
  const info = (props as any)[category] || {};

  const form = useForm<FormData>({
    resolver: zodResolver<any>(formSchema),
    defaultValues: {
      allowAnonymousSubmissions: info.allowAnonymousSubmissions || false,
      nameInHeader: info.nameInHeader || false,
      loginText: info.loginText || '',
      loginButtonText: info.loginButtonText || '',
    },
  });

  // Push the whole info object into the draft on any change.
  useEffect(() => {
    const subscription = form.watch((values) => {
      props.onFieldChanged?.(category, values);
    });
    return () => subscription.unsubscribe();
  }, [form, props]);

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
            name="nameInHeader"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Wordt de gebruikersnaam weergegeven in de header van het
                  formulier?
                </FormLabel>
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
