import { Button } from '@/components/ui/button';
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Separator } from '@/components/ui/separator';
import { Heading } from '@/components/ui/typography';
import { useWidgetConfig } from '@/hooks/use-widget-config';
import { zodResolver } from '@hookform/resolvers/zod';
import { useCallback, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import * as Switch from '@radix-ui/react-switch';

const formSchema = z.object({
  confirmationUser: z.boolean(),
  confirmationAdmin: z.boolean(),
});

export default function WidgetResourceFormConfirmation() {
  type FormData = z.infer<typeof formSchema>;
  const category = 'confirmation';

  // TODO should use the passed props widget, this is the old way and is not advised
  const {
    data: widget,
    isLoading: isLoadingWidget,
    updateConfig,
  } = useWidgetConfig<any>();

  const defaults = useCallback(
    () => {
      const confirmationUser = widget?.config?.[category]?.confirmationUser !== null ? widget?.config?.[category]?.confirmationUser : true;
      const confirmationAdmin = widget?.config?.[category]?.confirmationAdmin !== null ? widget?.config?.[category]?.confirmationAdmin : true;
      return { confirmationUser, confirmationAdmin };
    },
    [widget?.config]
  );

  async function onSubmit(values: FormData) {
    try {
      await updateConfig({ [category]: values });
    } catch (error) {
      console.error('could not update', error);
    }
  }

  const form = useForm<FormData>({
    resolver: zodResolver<any>(formSchema),
    defaultValues: defaults(),
  });

  useEffect(() => {
    form.reset(defaults());
  }, [form, defaults]);

  return (
    <div className="p-6 bg-white rounded-md">
      <Form {...form}>
        <Heading size="xl">Bevestiging</Heading>
        <Separator className="my-4" />
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="lg:w-2/3 grid grid-cols-1 gap-4">
          <FormField
            control={form.control}
            name="confirmationUser"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Krijgt de gebruiker een bevestiging voordat de inzending/het plan opgeleverd wordt?
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
                  Krijgt de beheerder een bevestiging voordat de inzending/het plan opgeleverd wordt?
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
          <Button className="w-fit col-span-full" type="submit">
            Opslaan
          </Button>
        </form>
      </Form>
    </div>
  );
}
