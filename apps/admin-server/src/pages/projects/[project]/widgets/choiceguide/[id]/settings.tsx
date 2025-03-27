import React, { useCallback, useEffect, useState } from 'react';
import { Button } from '../../../../../../components/ui/button';
import { Input } from '../../../../../../components/ui/input';
import {
  Form,
  FormControl, FormDescription,
  FormField,
  FormItem,
  FormLabel,
} from '../../../../../../components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../../../../components/ui/select';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Heading } from '@/components/ui/typography';
import { Separator } from '@/components/ui/separator';
import { useWidgetConfig } from '@/hooks/use-widget-config';
import { ChoiceGuide } from '@openstad-headless/choiceguide/src/props';
import {YesNoSelect} from "@/lib/form-widget-helpers";

const formSchema = z.object({
  submitButtonText: z.string().optional(),
  nextButtonText: z.string().optional(),
  loginText: z.string().optional(),
  loginTextButton: z.string().optional(),
  loginRequired: z.boolean().optional(),
});

export default function WidgetChoiceGuideGeneralSettings(props: ChoiceGuide) {
  const category = 'generalSettings';

  const {
    data: widget,
    isLoading: isLoadingWidget,
    updateConfig,
  } = useWidgetConfig<any>();

  const defaults = useCallback(
    () => ({
      submitButtonText: widget?.config?.[category]?.submitButtonText || "Versturen",
      nextButtonText: widget?.config?.[category]?.nextButtonText || "Volgende",
      loginText: widget?.config?.[category]?.loginText || "Inloggen om deel te nemen.",
      loginTextButton: widget?.config?.[category]?.loginTextButton || "Inloggen",
      loginRequired: widget?.config?.[category]?.loginRequired || false,
    }),
    [widget?.config]
  );

  type FormData = z.infer<typeof formSchema>;
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
        <Heading size="xl">Instellingen</Heading>
        <Separator className="my-4" />
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="w-fit lg:w-2/3 grid grid-cols-1 lg:grid-cols-1 gap-4">
          <FormField
            control={form.control}
            name="submitButtonText"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Verstuur knop tekst</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="nextButtonText"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Volgende vraag tekst</FormLabel>
                <FormDescription>
                  Tekst die wordt getoond op de knop om naar de volgende vraag te gaan. Alleen van toepassing als er meerdere pagina&apos;s met vragen zijn.
                </FormDescription>
                <FormControl>
                  <Input {...field} />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="loginRequired"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Login vereist</FormLabel>
                <FormDescription>
                  Moet de gebruiker ingelogd zijn om de keuzewijzer in te vullen?
                </FormDescription>
                {/*@ts-ignore*/}
                {YesNoSelect(field, props)}
              </FormItem>
            )}
          />

          {!!form.watch('loginRequired') && (
            <>
              <FormField
                control={form.control}
                name="loginText"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Login tekst
                    </FormLabel>
                    <FormDescription>
                      Tekst die wordt getoond als de gebruiker niet is ingelogd.
                    </FormDescription>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="loginTextButton"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Login tekst knop
                    </FormLabel>
                    <FormDescription>
                      Tekst die wordt getoond op de knop om in te loggen.
                    </FormDescription>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
            </>
          )}

          <Button type="submit" className="w-fit col-span-full">
            Opslaan
          </Button>
        </form>
      </Form>
    </div>
  );
}
