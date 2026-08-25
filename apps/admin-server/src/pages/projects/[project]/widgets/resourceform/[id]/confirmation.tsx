import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
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
  confirmationUser: z.boolean(),
  confirmationAdmin: z.boolean(),
});

export default function WidgetResourceFormConfirmation(
  props: ResourceFormWidgetProps & EditFieldProps<ResourceFormWidgetProps>
) {
  type FormData = z.infer<typeof formSchema>;
  const category = 'confirmation';

  const confirmation = (props as any)[category] || {};

  const form = useForm<FormData>({
    resolver: zodResolver<any>(formSchema),
    defaultValues: {
      confirmationUser: confirmation.confirmationUser ?? true,
      confirmationAdmin: confirmation.confirmationAdmin ?? true,
    },
  });

  useEffect(() => {
    const subscription = form.watch((values) => {
      props.onFieldChanged?.(category, values);
    });
    return () => subscription.unsubscribe();
  }, [form, props]);

  return (
    <div className="p-6 bg-white rounded-md">
      <Form {...form}>
        <Heading size="xl">Bevestiging</Heading>
        <Separator className="my-4" />
        <form className="lg:w-2/3 grid grid-cols-1 gap-4">
          <FormField
            control={form.control}
            name="confirmationUser"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Krijgt de gebruiker een bevestiging per mail van zijn
                  inzending?
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
            name="confirmationAdmin"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Krijgt de beheerder een bevestiging per mail bij een nieuwe
                  inzending?
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
        </form>
      </Form>
    </div>
  );
}
