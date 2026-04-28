import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Spacer } from '@/components/ui/spacer';
import { Heading } from '@/components/ui/typography';
import useMarkers from '@/hooks/use-markers';
import { useWidgetConfig } from '@/hooks/use-widget-config';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/router';
import React, { useCallback, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

const formSchema = z.object({
  markerSets: z
    .array(
      z.object({
        id: z.number(),
        name: z.string(),
      })
    )
    .optional(),
  markerInteractionType: z
    .enum(['default', 'direct'])
    .optional()
    .default('default'),
});

type FormData = z.infer<typeof formSchema>;

export default function WidgetMapMarkers() {
  const { data: widget, updateConfig } = useWidgetConfig<any>();

  const router = useRouter();
  const projectId = router.query.project as string;

  const { data: availableMarkerSets } =
    (useMarkers(projectId) as { data: { id: number; name: string }[] }) ?? [];

  const defaults = useCallback(
    () => ({
      markerSets: widget?.config?.markerSets || [],
      markerInteractionType: widget?.config?.markerInteractionType || 'default',
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
      await updateConfig({
        markerSets: values.markerSets,
        markerInteractionType: values.markerInteractionType,
      });
    } catch (error) {
      console.error('could not update', error);
    }
  }

  return (
    <div className="p-6 bg-white rounded-md">
      <Form {...form}>
        <Heading size="xl">Markers</Heading>
        <Separator className="my-4" />
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-4 lg:w-full">
          {availableMarkerSets?.length === 0 && (
            <p className="text-muted-foreground">
              Nog geen markers aangemaakt voor dit project. Ga naar Polygonen om
              markers aan te maken.
            </p>
          )}
          {availableMarkerSets?.map((item) => (
            <FormField
              key={item.id}
              control={form.control}
              name="markerSets"
              render={({ field }) => {
                const isChecked =
                  Array.isArray(field.value) &&
                  field.value.some((obj) => obj.id === Number(item.id));

                return (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={isChecked}
                        onCheckedChange={(checked) => {
                          let values = form.getValues('markerSets') || [];

                          if (checked) {
                            if (
                              !values.some((obj) => obj.id === Number(item.id))
                            ) {
                              form.setValue('markerSets', [
                                ...values,
                                { name: item.name, id: Number(item.id) },
                              ]);
                            }
                          } else {
                            form.setValue(
                              'markerSets',
                              values.filter((obj) => obj.id !== Number(item.id))
                            );
                          }
                        }}
                      />
                    </FormControl>
                    <FormLabel className="font-normal">{item.name}</FormLabel>
                    <FormMessage />
                  </FormItem>
                );
              }}
            />
          )) || null}

          <Spacer size={3} />

          <FormField
            control={form.control}
            name="markerInteractionType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Hoe wil je dat de interactie werkt met de markers?
                </FormLabel>
                <Select
                  onValueChange={field.onChange}
                  value={field.value || 'default'}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Standaard" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="default">
                      <strong>Standaard</strong>: Op een marker klikken opent
                      een pop-up met de titel, beschrijving en een knop met de
                      ingevulde URL (als deze is ingevuld).
                    </SelectItem>
                    <SelectItem value="direct">
                      <strong>Direct naar URL</strong>: Op een marker klikken
                      opent direct de ingevulde URL.
                    </SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit">Opslaan</Button>
        </form>
      </Form>
    </div>
  );
}
