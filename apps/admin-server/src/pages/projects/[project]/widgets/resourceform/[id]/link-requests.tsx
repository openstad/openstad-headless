import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Heading } from '@/components/ui/typography';
import usePluginCapabilities from '@/hooks/use-plugin-capabilities';
import { useWidgetConfig } from '@/hooks/use-widget-config';
import { YesNoSelect } from '@/lib/form-widget-helpers';
import { zodResolver } from '@hookform/resolvers/zod';
import dynamic from 'next/dynamic';
import React, { useCallback, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

const TrixEditor = dynamic(
  () =>
    import('@openstad-headless/ui/src/form-elements/text/index').then(
      (mod) => mod.TrixEditor
    ),
  {
    ssr: false,
    loading: () => (
      <div className="h-32 bg-gray-100 animate-pulse rounded border" />
    ),
  }
);

const formSchema = z.object({
  confirmEnabled: z.boolean(),
  confirmTitle: z.string().optional(),
  confirmDescription: z.string().optional(),
});

export default function WidgetResourceFormLinkRequests() {
  type FormData = z.infer<typeof formSchema>;
  const category = 'linkRequests';
  const { capabilities } = usePluginCapabilities();
  const { data: widget, updateConfig } = useWidgetConfig<any>();

  const defaults = useCallback(
    () => ({
      confirmEnabled: widget?.config?.[category]?.confirmEnabled !== false,
      confirmTitle: widget?.config?.[category]?.confirmTitle || '',
      confirmDescription: widget?.config?.[category]?.confirmDescription || '',
    }),
    [widget?.config]
  );

  const form = useForm<FormData>({
    resolver: zodResolver<any>(formSchema),
    defaultValues: defaults(),
  });

  useEffect(() => {
    form.reset(defaults());
  }, [form, defaults]);

  async function onSubmit(values: FormData) {
    try {
      await updateConfig({ [category]: values });
    } catch (error) {
      console.error('could not update', error);
    }
  }

  if (!capabilities.linkRequests) return null;

  return (
    <div className="p-6 bg-white rounded-md mt-4">
      <Form {...form}>
        <Heading size="xl">Koppelverzoeken</Heading>
        <Separator className="my-4" />
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="lg:w-2/3 grid grid-cols-1 gap-4">
          <FormField
            control={form.control}
            name="confirmEnabled"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Bevestiging tonen voor het versturen</FormLabel>
                <FormDescription>
                  Toont een pop-up met de gekozen koppelingen, waarin de
                  indiener per koppeling een toelichting kan schrijven.
                </FormDescription>
                {YesNoSelect(field, {})}
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="confirmTitle"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Titel van de pop-up</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Je gaat uitnodiging(en) versturen"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="confirmDescription"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Beschrijving van de pop-up</FormLabel>
                <FormControl>
                  <TrixEditor
                    value={field.value || ''}
                    onChange={(e: any) => field.onChange(e.target.value)}
                  />
                </FormControl>
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
