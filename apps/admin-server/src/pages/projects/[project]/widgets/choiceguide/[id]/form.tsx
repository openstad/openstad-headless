import React, { useCallback, useEffect, useState } from 'react';
import { Button } from '../../../../../../components/ui/button';
import { Input } from '../../../../../../components/ui/input';
import {
  Form,
  FormControl,
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
import {undefinedToTrueOrProp, YesNoSelect} from "@/lib/form-widget-helpers";
import {Textarea} from "@/components/ui/textarea";
import { ChoiceGuide } from '@openstad-headless/choiceguide/src/props';

const formSchema = z.object({
  noOfQuestionsToShow: z.string().optional(),
  showPageCountAndCurrentPageInButton: z.boolean(),
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
});

export default function ChoicesSelectorForm(props: ChoiceGuide) {
  const category = 'choiceGuide';

  const {
    data: widget,
    isLoading: isLoadingWidget,
    updateConfig,
  } = useWidgetConfig<any>();

  const defaults = useCallback(
    () => ({
      noOfQuestionsToShow: widget?.config?.[category]?.noOfQuestionsToShow || "100",
      showPageCountAndCurrentPageInButton: undefinedToTrueOrProp(widget?.config?.[category]?.showPageCountAndCurrentPageInButton),
      choicesType: widget?.config?.[category]?.choicesType || 'default',
      imageAspectRatio: widget?.config?.[category]?.imageAspectRatio || '16x9',
      choicesPreferenceMinColor: widget?.config?.[category]?.choicesPreferenceMinColor || '#ff9100',
      choicesPreferenceMaxColor: widget?.config?.[category]?.choicesPreferenceMaxColor || '#bed200',
      choicesPreferenceTitle: widget?.config?.[category]?.choicesPreferenceTitle || 'Jouw voorkeur is {preferredChoice}',
      choicesNoPreferenceYetTitle: widget?.config?.[category]?.choicesNoPreferenceYetTitle || 'Je hebt nog geen keuze gemaakt',
      choicesInBetweenPreferenceTitle: widget?.config?.[category]?.choicesInBetweenPreferenceTitle || 'Je staat precies tussen meerdere voorkeuren in',
      beforeUrl: widget?.config?.[category]?.beforeUrl || '',
      afterUrl: widget?.config?.[category]?.afterUrl || '',
      introTitle: widget?.config?.[category]?.introTitle || '',
      introDescription: widget?.config?.[category]?.introDescription || '',
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
                    <SelectItem value="minus-to-plus-100">Van min naar plus 100</SelectItem>
                    <SelectItem value="plane">In een vlak</SelectItem>
                    <SelectItem value="hidden">Geen: verberg de voorkeuren</SelectItem>
                  </SelectContent>
                </Select>
              </FormItem>
            )}
          />
          {(watchChoicesType === 'minus-to-plus-100' || watchChoicesType === 'plane') && (
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
                    <FormLabel>Titel boven de keuzes, nog geen voorkeur</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
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
                  <Input {...field} />
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
                  <Textarea {...field} />
                </FormControl>
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
