import { Separator } from '@/components/ui/separator';
import { Spacer } from '@/components/ui/spacer';
import { Heading } from '@/components/ui/typography';
import { useWidgetsHook } from '@/hooks/use-widgets';
import { YesNoSelect, undefinedToTrueOrProp } from '@/lib/form-widget-helpers';
import { EditFieldProps } from '@/lib/form-widget-helpers/EditFieldProps';
import { zodResolver } from '@hookform/resolvers/zod';
import { ChoiceGuideResultsProps } from '@openstad-headless/choiceguide-results/src/props';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../../../../components/ui/select';

const formSchema = z.object({
  choiceguideWidgetId: z.string().optional(),
  displayTitle: z.boolean().optional(),
  displayDescription: z.boolean().optional(),
  displayImage: z.boolean().optional(),
  displayAsFeaturedOnly: z.boolean().optional(),
  hideScores: z.boolean().optional(),
});

export default function ChoiceGuideResultSettings(
  props: ChoiceGuideResultsProps & EditFieldProps<ChoiceGuideResultsProps>
) {
  const router = useRouter();
  const { project } = router.query;

  type FormData = z.infer<typeof formSchema>;
  function onSubmit(values: FormData) {
    props.updateConfig({ ...props, ...values });
  }

  const form = useForm<FormData>({
    resolver: zodResolver<any>(formSchema),
    defaultValues: {
      choiceguideWidgetId: props?.choiceguideWidgetId || '',
      displayTitle: undefinedToTrueOrProp(props?.displayTitle),
      displayDescription: props?.displayDescription || false,
      displayImage: props?.displayImage || false,
      displayAsFeaturedOnly: props?.displayAsFeaturedOnly || false,
      hideScores: props?.hideScores || false,
    },
  });

  const { data: widgetData } = useWidgetsHook(project as string);

  const [allWidgets, setAllWidgets] = useState<{ id: number; name: string }[]>(
    []
  );

  useEffect(() => {
    if (!!widgetData) {
      let widgets: { id: number; name: string }[] = [];

      widgetData.forEach((widget: any) => {
        if (widget?.type === 'choiceguide') {
          widgets.push({
            id: widget.id,
            name: widget.description,
          });
        }
      });

      setAllWidgets(widgets);
    }
  }, [widgetData]);

  return (
    <div className="p-6 bg-white rounded-md">
      <Form {...form}>
        <Heading size="xl">Instellingen</Heading>
        <Separator className="my-4" />
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="w-fit lg:w-2/3 grid grid-cols-1 lg:grid-cols-1 gap-2">
          <FormField
            control={form.control}
            name="choiceguideWidgetId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Van welke keuzewijzer moeten de resultaten getoond worden?
                </FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecteer de keuzewijzer" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {allWidgets.map((widget) => (
                      <SelectItem key={widget.id} value={widget.id.toString()}>
                        {widget.id} - {widget.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormItem>
            )}
          />
          <Spacer size={1} />
          <FormField
            control={form.control}
            name="displayTitle"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Titel van de keuzeoptie tonen in het scoreblok?
                </FormLabel>
                {YesNoSelect(field, props)}
                <FormMessage />
              </FormItem>
            )}
          />
          <Spacer size={1} />
          <FormField
            control={form.control}
            name="displayDescription"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Beschrijving van de keuzeoptie tonen in het scoreblok?
                </FormLabel>
                {YesNoSelect(field, props)}
                <FormMessage />
              </FormItem>
            )}
          />
          <Spacer size={1} />
          <FormField
            control={form.control}
            name="displayImage"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Afbeelding van de keuzeoptie tonen in het scoreblok?
                </FormLabel>
                {YesNoSelect(field, props)}
                <FormMessage />
              </FormItem>
            )}
          />
          <Spacer size={1} />
          <FormField
            control={form.control}
            name="displayAsFeaturedOnly"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Moet de content van de topkeuze onder de resultaten als
                  uitslag worden weergegeven?
                </FormLabel>
                <FormDescription>
                  Indien deze optie is ingeschakeld, wordt na het invullen van
                  de keuzewijzer alleen de content van de keuzeoptie met de
                  hoogste score getoond. Dit omvat de titel, afbeelding en
                  uitgebreide content, mits hierboven is gekozen om deze velden
                  te tonen. In plaats van bij de individuele keuzes te
                  verschijnen, wordt deze content onder het volledige
                  resultaatblok geplaatst, waardoor het op een aparte plek staat
                  en zo een overzichtelijke uitslagweergave vormt.{' '}
                </FormDescription>
                {YesNoSelect(field, props)}
                <FormMessage />
              </FormItem>
            )}
          />
          <Spacer size={1} />
          {!!form.watch('displayAsFeaturedOnly') && (
            <FormField
              control={form.control}
              name="hideScores"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Scoreblok verbergen zodat alleen de uitslag wordt getoond
                  </FormLabel>
                  <FormDescription>
                    Indien ingeschakeld wordt het standaard scoreblok van alle
                    keuzeopties verborgen. Alleen de content van de topkeuze
                    wordt weergegeven, zodat de uitslag van de keuzewijzer
                    prominenter zichtbaar is.
                  </FormDescription>
                  {YesNoSelect(field, props)}
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
          <Spacer size={1} />
          <Button type="submit" className="w-fit col-span-full">
            Opslaan
          </Button>
        </form>
      </Form>
    </div>
  );
}
