import React, { useEffect, useState } from 'react';
import { Button } from '../../../../../../components/ui/button';
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
import { ChoiceGuideResultsProps } from '@openstad-headless/choiceguide-results/src/props';
import {useWidgetsHook} from "@/hooks/use-widgets";
import {useRouter} from "next/router";
import {EditFieldProps} from "@/lib/form-widget-helpers/EditFieldProps";

const formSchema = z.object({
    choiceguideWidgetId: z.string().optional(),
});

export default function ChoiceGuideResultSettings(
    props: ChoiceGuideResultsProps & EditFieldProps<ChoiceGuideResultsProps>
) {
  const router = useRouter();
  const { project } = router.query;

  type FormData = z.infer<typeof formSchema>;
  function onSubmit(values: FormData) {
     props.updateConfig( { ...props, ...values });
  }

  const form = useForm<FormData>({
    resolver: zodResolver<any>(formSchema),
    defaultValues: {
      choiceguideWidgetId: props?.choiceguideWidgetId || "",
    },
  });

  const { data: widgetData } = useWidgetsHook(
      project as string
  );

  const [allWidgets, setAllWidgets] = useState<{ id: number; name: string }[]>([]);

  useEffect(() => {
    if (!!widgetData) {
      let widgets: { id: number; name: string }[] = [];

      widgetData.forEach((widget: any) => {
        if (widget?.type === "choiceguide") {
          widgets.push({
            id: widget.id,
            name: widget.description
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
          className="w-fit lg:w-2/3 grid grid-cols-1 lg:grid-cols-2 gap-4">

          <FormField
            control={form.control}
            name="choiceguideWidgetId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Van welke keuzewijzer moeten de resultaten getoond worden?</FormLabel>
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

          <Button type="submit" className="w-fit col-span-full">
            Opslaan
          </Button>
        </form>
      </Form>
    </div>
  );
}
