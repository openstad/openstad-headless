import { Separator } from '@/components/ui/separator';
import { Heading } from '@/components/ui/typography';
import { useSyncDraftForm } from '@/hooks/useWidgetDraft';
import { YesNoSelect, undefinedToTrueOrProp } from '@/lib/form-widget-helpers';
import { EditFieldProps } from '@/lib/form-widget-helpers/EditFieldProps';
import { zodResolver } from '@hookform/resolvers/zod';
import { ChoiceGuideProps } from '@openstad-headless/choiceguide/src/props';
import React, { useCallback } from 'react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
} from '../../../../../../components/ui/form';
import { Input } from '../../../../../../components/ui/input';

const formSchema = z.object({
  submitButtonText: z.string().optional(),
  nextButtonText: z.string().optional(),
  loginText: z.string().optional(),
  loginTextButton: z.string().optional(),
  loginRequired: z.boolean().optional(),
  stickyBarAtTop: z.boolean().optional(),
  stickyBarDefaultOpen: z.boolean().optional(),
});

export default function WidgetChoiceGuideGeneralSettings(
  props: ChoiceGuideProps & EditFieldProps<ChoiceGuideProps>
) {
  const category = 'generalSettings';

  const defaults = useCallback(
    () => ({
      submitButtonText: props?.[category]?.submitButtonText || 'Versturen',
      nextButtonText: props?.[category]?.nextButtonText || 'Volgende',
      loginText: props?.[category]?.loginText || 'Inloggen om deel te nemen.',
      loginTextButton: props?.[category]?.loginTextButton || 'Inloggen',
      loginRequired: props?.[category]?.loginRequired || false,
      stickyBarAtTop: props?.[category]?.stickyBarAtTop || false,
      stickyBarDefaultOpen: undefinedToTrueOrProp(
        props?.[category]?.stickyBarDefaultOpen
      ),
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  type FormData = z.infer<typeof formSchema>;
  async function onSubmit(values: FormData) {
    props.updateConfig({ ...props, [category]: values });
  }

  const form = useForm<FormData>({
    resolver: zodResolver<any>(formSchema),
    defaultValues: defaults(),
  });

  // Push each field into the whole-widget draft under the `generalSettings`
  // category, so the header save bar persists them in one save.
  const pushToDraft = useCallback(
    (name: string, value: any) =>
      props.onFieldChanged?.(`${category}.${name}`, value),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [props.onFieldChanged]
  );
  useSyncDraftForm(form, pushToDraft, {
    schema: formSchema,
    label: 'Algemene instellingen',
  });
  const draftProps = { ...props, onFieldChanged: pushToDraft };

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
                  Tekst die wordt getoond op de knop om naar de volgende vraag
                  te gaan. Alleen van toepassing als er meerdere pagina&apos;s
                  met vragen zijn.
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
                  Moet de gebruiker ingelogd zijn om de keuzewijzer in te
                  vullen?
                </FormDescription>
                {/*@ts-ignore*/}
                {YesNoSelect(field, draftProps)}
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
                    <FormLabel>Login tekst</FormLabel>
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
                    <FormLabel>Login tekst knop</FormLabel>
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

          <FormField
            control={form.control}
            name="stickyBarAtTop"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Moet de balk met de voortgang van de keuzewijzer bovenaan
                  getoond worden?
                </FormLabel>
                {YesNoSelect(field, draftProps)}
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="stickyBarDefaultOpen"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Moet de balk met de voortgang van de keuzewijzer standaard
                  geopend zijn?
                </FormLabel>
                {YesNoSelect(field, draftProps)}
              </FormItem>
            )}
          />
        </form>
      </Form>
    </div>
  );
}
