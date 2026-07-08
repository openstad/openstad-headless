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
import { EditFieldProps } from '@/lib/form-widget-helpers/EditFieldProps';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/router';
import React from 'react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

import { ResourceOverviewMapWidgetTabProps } from '.';

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

export default function WidgetResourcesMapMarkers(
  props: ResourceOverviewMapWidgetTabProps &
    EditFieldProps<ResourceOverviewMapWidgetTabProps> & {
      markerSets?: any;
      markerInteractionType?: 'default' | 'direct';
      buttonType?: 'submit' | 'button';
    }
) {
  type FormData = z.infer<typeof formSchema>;

  async function onSubmit(values: FormData) {
    props.updateConfig({ ...props, ...values });
  }

  const form = useForm<FormData>({
    resolver: zodResolver<any>(formSchema),
    defaultValues: {
      markerSets: props?.markerSets || [],
      markerInteractionType: props?.markerInteractionType || 'default',
    },
  });
  const router = useRouter();
  const projectId = router.query.project as string;

  const { data: availableMarkerSets } =
    (useMarkers(
      props.projectId === undefined ? projectId : props.projectId
    ) as { data: { id: number; name: string }[] }) ?? [];

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
                              const { name } = item;
                              form.setValue('markerSets', [
                                ...values,
                                { name, id: Number(item.id) },
                              ]);
                              props.onFieldChanged(field.name, [
                                ...values,
                                { name, id: Number(item.id) },
                              ]);
                            }
                          } else {
                            const filteredValues = values.filter(
                              (obj) => obj.id !== Number(item.id)
                            );
                            form.setValue('markerSets', filteredValues);
                            props.onFieldChanged('markerSets', filteredValues);
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

          <Button
            type={props?.buttonType || 'submit'}
            onClick={() => {
              if (props?.buttonType === 'button') {
                onSubmit(form.getValues());
              }
            }}>
            Opslaan
          </Button>
        </form>
      </Form>
    </div>
  );
}
