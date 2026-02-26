import { Separator } from '@/components/ui/separator';
import { Heading } from '@/components/ui/typography';
import { useWidgetConfig } from '@/hooks/use-widget-config';
import { useFieldDebounce } from '@/hooks/useFieldDebounce';
import { YesNoSelect, undefinedToTrueOrProp } from '@/lib/form-widget-helpers';
import { EditFieldProps } from '@/lib/form-widget-helpers/EditFieldProps';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  ChoiceGuide,
  ChoiceGuideProps,
} from '@openstad-headless/choiceguide/src/props';
import dynamic from 'next/dynamic';
import React, { useCallback, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

import { Button } from '../../../../../../components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../../../../../../components/ui/form';
import { Input } from '../../../../../../components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../../../../components/ui/select';

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
  noOfQuestionsToShow: z.string().optional(),
  showPageCountAndCurrentPageInButton: z.boolean(),
  showBackButtonInTopOfPage: z.boolean().optional(),
  choicesType: z.enum(['default', 'minus-to-plus-100', 'plane', 'hidden']),
  imageAspectRatio: z.enum(['16x9', '1x1']),
  choicesPreferenceMinColor: z.string().optional(),
  choicesPreferenceMaxColor: z.string().optional(),
  choicesPreferenceTitle: z.string().optional(),
  choicesNoPreferenceYetTitle: z.string().optional(),
  choicesInBetweenPreferenceTitle: z.string().optional(),
  beforeUrl: z.string().optional(),
  afterUrl: z.string().optional(),
  introTitle: z.string().optional(),
  introDescription: z.string().optional(),
  minCharactersWarning: z
    .string()
    .optional()
    .default('Nog minimaal {minCharacters} tekens'),
  maxCharactersWarning: z
    .string()
    .optional()
    .default('Je hebt nog {maxCharacters} tekens over'),
  minCharactersError: z
    .string()
    .optional()
    .default('Tekst moet minimaal {minCharacters} karakters bevatten'),
  maxCharactersError: z
    .string()
    .optional()
    .default('Tekst moet maximaal {maxCharacters} karakters bevatten'),
  showMinMaxAfterBlur: z.boolean().optional().default(false),
  maxCharactersOverWarning: z
    .string()
    .optional()
    .default('Je hebt {overCharacters} tekens teveel'),
});

export default function ChoicesSelectorForm(
  props: ChoiceGuideProps & EditFieldProps<ChoiceGuideProps>
) {
  const category = 'choiceGuide';

  const {
    data: widget,
    isLoading: isLoadingWidget,
    updateConfig,
  } = useWidgetConfig<any>();

  const defaults = useCallback(
    () => ({
      noOfQuestionsToShow:
        widget?.config?.[category]?.noOfQuestionsToShow || '100',
      showPageCountAndCurrentPageInButton: undefinedToTrueOrProp(
        widget?.config?.[category]?.showPageCountAndCurrentPageInButton
      ),
      showBackButtonInTopOfPage:
        widget?.config?.[category]?.showBackButtonInTopOfPage || false,
      choicesType: widget?.config?.[category]?.choicesType || 'default',
      imageAspectRatio: widget?.config?.[category]?.imageAspectRatio || '16x9',
      choicesPreferenceMinColor:
        widget?.config?.[category]?.choicesPreferenceMinColor || '#ff9100',
      choicesPreferenceMaxColor:
        widget?.config?.[category]?.choicesPreferenceMaxColor || '#bed200',
      choicesPreferenceTitle:
        widget?.config?.[category]?.choicesPreferenceTitle ||
        'Jouw voorkeur is {preferredChoice}',
      choicesNoPreferenceYetTitle:
        widget?.config?.[category]?.choicesNoPreferenceYetTitle ||
        'Je hebt nog geen keuze gemaakt',
      choicesInBetweenPreferenceTitle:
        widget?.config?.[category]?.choicesInBetweenPreferenceTitle ||
        'Je staat precies tussen meerdere voorkeuren in',
      beforeUrl: widget?.config?.[category]?.beforeUrl || '',
      afterUrl: widget?.config?.[category]?.afterUrl || '',
      introTitle: widget?.config?.[category]?.introTitle || '',
      introDescription: widget?.config?.[category]?.introDescription || '',
      minCharactersWarning:
        widget?.config?.[category]?.minCharactersWarning ||
        'Nog minimaal {minCharacters} tekens',
      maxCharactersWarning:
        widget?.config?.[category]?.maxCharactersWarning ||
        'Je hebt nog {maxCharacters} tekens over',
      minCharactersError:
        widget?.config?.[category]?.minCharactersError ||
        'Tekst moet minimaal {minCharacters} karakters bevatten',
      maxCharactersError:
        widget?.config?.[category]?.maxCharactersError ||
        'Tekst moet maximaal {maxCharacters} karakters bevatten',
      showMinMaxAfterBlur:
        widget?.config?.[category]?.showMinMaxAfterBlur || false,
      maxCharactersOverWarning:
        widget?.config?.[category]?.maxCharactersOverWarning ||
        'Je hebt {overCharacters} tekens teveel',
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

  const watchChoicesType = form.watch('choicesType');

  return (
    <div className="p-6 bg-white rounded-md">
      <Form {...form}>
        <Heading size="xl">Formulier instellingen</Heading>
        <Separator className="my-4" />
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="w-fit lg:w-2/3 grid grid-cols-1 lg:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="noOfQuestionsToShow"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Aantal vragen per pagina</FormLabel>
                <FormControl>
                  <Input type="number" {...field} />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="showPageCountAndCurrentPageInButton"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Wil je de voortgang van de pagina&apos;s te zien is in de
                  &apos;Volgende&apos; knop?
                </FormLabel>
                {/*@ts-ignore*/}
                {YesNoSelect(field, props)}
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="choicesType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Weergave van de voorkeuren</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecteer weergave" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="default">Standaard</SelectItem>
                    <SelectItem value="minus-to-plus-100">
                      Van min naar plus 100
                    </SelectItem>
                    <SelectItem value="plane">In een vlak</SelectItem>
                    <SelectItem value="hidden">
                      Geen: verberg de voorkeuren
                    </SelectItem>
                  </SelectContent>
                </Select>
              </FormItem>
            )}
          />
          {(watchChoicesType === 'minus-to-plus-100' ||
            watchChoicesType === 'plane') && (
            <>
              {watchChoicesType === 'minus-to-plus-100' && (
                <>
                  <FormField
                    control={form.control}
                    name="choicesPreferenceMinColor"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Kleur van de balken, minimaal</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="choicesPreferenceMaxColor"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Kleur van de balken, maximaal</FormLabel>
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
                name="choicesPreferenceTitle"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Titel boven de keuzes, met voorkeur</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="choicesNoPreferenceYetTitle"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Titel boven de keuzes, nog geen voorkeur
                    </FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="showMinMaxAfterBlur"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Toon min/max waarschuwing na verlaten van het veld
                    </FormLabel>
                    {/*@ts-ignore*/}
                    {YesNoSelect(field, props)}
                  </FormItem>
                )}
              />
              {watchChoicesType === 'plane' && (
                <FormField
                  control={form.control}
                  name="choicesInBetweenPreferenceTitle"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Titel boven de keuzes, tussen twee voorkeuren in
                      </FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
              )}
            </>
          )}
          <FormField
            control={form.control}
            name="imageAspectRatio"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Weergave: afbeeldingen aspect ratio</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="16:9" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="16x9">16:9</SelectItem>
                    <SelectItem value="1x1">1:1</SelectItem>
                  </SelectContent>
                </Select>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="beforeUrl"
            render={({ field }) => (
              <FormItem>
                <FormLabel>URL van de inleidende pagina</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="afterUrl"
            render={({ field }) => (
              <FormItem>
                <FormLabel>URL van de resultaat pagina</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="introTitle"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Titel inleiding</FormLabel>
                <FormControl>
                  <TrixEditor
                    value={field.value || ''}
                    onChange={(e) => field.onChange(e)}
                  />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="introDescription"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Beschrijving inleiding</FormLabel>
                <FormControl>
                  <TrixEditor
                    value={field.value || ''}
                    onChange={(e) => field.onChange(e)}
                  />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="minCharactersWarning"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Waarschuwing voor minimaal aantal karakters
                </FormLabel>
                <FormDescription>
                  {`Dit is de tekst die getoond wordt als het aantal karakters onder de minimum waarde ligt. Gebruik {minCharacters} zodat het aantal karakters automatisch wordt ingevuld.`}
                </FormDescription>
                <Input {...field} />
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="maxCharactersWarning"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Waarschuwing voor maximaal aantal karakters
                </FormLabel>
                <FormDescription>
                  {`Dit is de tekst die getoond wordt als het aantal karakters boven de maximum waarde ligt. Gebruik {maxCharacters} zodat het aantal karakters automatisch wordt ingevuld.`}
                </FormDescription>
                <Input {...field} />
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="maxCharactersOverWarning"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Waarschuwing bij overschrijden maximaal aantal karakters
                </FormLabel>
                <FormDescription>
                  {`Dit is de tekst die getoond wordt als het aantal karakters over de maximum waarde heen gaat. Gebruik {overCharacters} zodat het aantal karakters automatisch wordt ingevuld.`}
                </FormDescription>
                <Input {...field} />
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="minCharactersError"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Foutmelding voor minimaal aantal karakters
                </FormLabel>
                <FormDescription>
                  {`Dit is de tekst van de foutmelding die getoond wordt als het aantal karakters onder de minimum waarde ligt na het versturen van het formulier. Gebruik {minCharacters} zodat het aantal karakters automatisch wordt ingevuld.`}
                </FormDescription>
                <Input {...field} />
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="maxCharactersError"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Foutmelding voor maximaal aantal karakters
                </FormLabel>
                <FormDescription>
                  {`Dit is de tekst van de foutmelding die getoond wordt als het aantal karakters boven de maximum waarde ligt na het versturen van het formulier. Gebruik {maxCharacters} zodat het aantal karakters automatisch wordt ingevuld.`}
                </FormDescription>
                <Input {...field} />
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="showBackButtonInTopOfPage"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Toon de &apos;Vorige&apos; knop bovenaan de pagina?
                </FormLabel>
                {YesNoSelect(field, props)}
              </FormItem>
            )}
          />

          <Button type="submit" className="w-fit col-span-full">
            Opslaan
          </Button>
        </form>
      </Form>
    </div>
  );
}
