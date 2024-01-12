import React, { useCallback, useEffect } from 'react';
import { Button } from '../../../../../../components/ui/button';
import { Input } from '../../../../../../components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
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

const formSchema = z.object({
  keuzewijzer: z.string(),
  questionsOnPage: z.coerce.number(),
  startHalfway: z.boolean(),
  preferences: z.enum(['standard', 'minToPlus', 'field', 'none']),
  display: z.enum(['16:9', '1:1']),
  titlePreference: z.string(),
  titleNoPreference: z.string(),
  urlStartPage: z.string().url(),
  urlResultPage: z.string().url(),
});

export default function ChoicesSelectorForm() {
  const category = 'selectionGuide';

  const {
    data: widget,
    isLoading: isLoadingWidget,
    updateConfig,
  } = useWidgetConfig();

  const defaults = useCallback(
    () => ({
      questionsOnPage: widget?.config?.selectionGuide?.questionsOnPage || 100,
      preferences: widget?.config?.[category]?.preferences || 'standard',
      display: widget?.config?.[category]?.display || '16:9',
      titlePreference:
        widget?.config?.[category]?.titlePreference ||
        'Jouw voorkeur is {preferredChoice}.',
      titleNoPreference:
        widget?.config?.[category]?.titleNoPreference ||
        'Je hebt nog geen keuze gemaakt.',
      keuzewijzer: widget?.config?.[category]?.keuzewijzer || '',
      startHalfway: widget?.config?.[category]?.startHalfway || '',
      urlStartPage: widget?.config?.[category]?.urlStartPage || '',
      urlResultPage: widget?.config?.[category]?.urlResultPage || '',
    }),
    [widget?.config]
  );

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver<any>(formSchema),
    defaultValues: defaults(),
  });

  useEffect(() => {
    form.reset(defaults());
  }, [form, defaults]);

  function onSubmit(values: z.infer<typeof formSchema>) {
    updateConfig({ [category]: values });
  }

  return (
    <div className="p-6 bg-white rounded-md">
      <Form {...form}>
        <Heading size="xl">Instellingen</Heading>
        <Separator className="my-4" />
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="lg:w-fit grid grid-cols-1 lg:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="keuzewijzer"
            render={({ field }) => (
              <FormItem className="col-span-full">
                <FormLabel>Kies de keuzewijzer:</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent></SelectContent>
                </Select>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="questionsOnPage"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Aantal vragen per pagina:</FormLabel>
                <FormControl>
                  <Input type="number" {...field} />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="startHalfway"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Begin met alle vragen beantwoord op 50%?</FormLabel>
                <Select
                  onValueChange={(e: string) => field.onChange(e === 'true')}
                  value={field.value ? 'true' : 'false'}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Nee" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="true">Ja</SelectItem>
                    <SelectItem value="false">Nee</SelectItem>
                  </SelectContent>
                </Select>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="preferences"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Weergave van de voorkeuren:</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Standaard" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="standard">Standaard</SelectItem>
                    <SelectItem value="minToPlus">
                      Van min naar plus 100
                    </SelectItem>
                    <SelectItem value="field">In een vlak</SelectItem>
                    <SelectItem value="none">
                      Geen (Voorkeuren worden verborgen)
                    </SelectItem>
                  </SelectContent>
                </Select>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="display"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Aspect ratio van afbeeldingen:</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="16:9" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="16:9">16:9</SelectItem>
                    <SelectItem value="1:1">1:1</SelectItem>
                  </SelectContent>
                </Select>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="titlePreference"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Titel boven de keuzes, met voorkeur:</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="titleNoPreference"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Titel boven de keuzes, zonder voorkeur:</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="urlStartPage"
            render={({ field }) => (
              <FormItem>
                <FormLabel>URL van de inleidende pagina:</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="urlResultPage"
            render={({ field }) => (
              <FormItem>
                <FormLabel>URL van de resultaatspagina:</FormLabel>
                <FormControl>
                  <Input {...field} />
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
