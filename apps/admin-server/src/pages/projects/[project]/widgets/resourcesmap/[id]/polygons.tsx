import ColorPicker from '@/components/colorpicker';
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
import { Input } from '@/components/ui/input';
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
import useAreas from '@/hooks/use-areas';
import { useFieldDebounce } from '@/hooks/useFieldDebounce';
import { EditFieldProps } from '@/lib/form-widget-helpers/EditFieldProps';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/router';
import React from 'react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

import { ResourceOverviewMapWidgetTabProps } from '.';

const formSchema = z.object({
  customPolygon: z
    .array(
      z.object({
        id: z.number(),
        name: z.string(),
        url: z.string().optional(),
        color: z.string().optional(),
        openInNewTab: z.boolean().optional(),
        buttonText: z.string().optional(),
      })
    )
    .optional(),
  customPolygonUrl: z.any().optional(),
  interactionType: z.enum(['default', 'direct']).optional().default('default'),
});

export default function WidgetResourcesMapButton(
  props: ResourceOverviewMapWidgetTabProps &
    EditFieldProps<ResourceOverviewMapWidgetTabProps> & {
      customPolygon?: any;
      customPolygonUrl?: any;
      interactionType?: 'default' | 'direct';
    }
) {
  type FormData = z.infer<typeof formSchema>;

  async function onSubmit(values: FormData) {
    const customPolygon = values?.customPolygon?.map((item: any) => {
      const url = values?.customPolygonUrl?.[item.id] ?? item.url ?? '';
      return { ...item, url };
    });

    values.customPolygon = customPolygon;

    props.updateConfig({ ...props, ...values });
  }

  const { onFieldChange } = useFieldDebounce(props.onFieldChanged);

  const existingPolygons = (props?.customPolygon || []).reduce(
    (acc: any, p: any) => {
      acc[p.id] = p;
      return acc;
    },
    {}
  );

  const form = useForm<FormData>({
    resolver: zodResolver<any>(formSchema),
    defaultValues: {
      customPolygon: props?.customPolygon || [],
      customPolygonUrl: props?.customPolygonUrl || [],
      interactionType: props?.interactionType || 'default',
    },
  });
  const router = useRouter();
  const projectId = router.query.project as string;

  const { data: areas } =
    (useAreas(props.projectId === undefined ? projectId : props.projectId) as {
      data: { id: string; name: string }[];
    }) ?? [];

  return (
    <div className="p-6 bg-white rounded-md">
      <Form {...form}>
        <Heading size="xl">Polygonen</Heading>
        <Separator className="my-4" />
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-4 lg:w-full">
          {areas?.map((item) => (
            <FormField
              key={item.id}
              control={form.control}
              name="customPolygon"
              render={({ field }) => {
                const isChecked =
                  Array.isArray(field.value) &&
                  field.value.some((obj) => obj.id === Number(item.id));

                const existingData = existingPolygons[Number(item.id)] || {};

                return (
                  <FormItem
                    key={item.id}
                    className="flex flex-column items-start space-x-0 space-y-3 ">
                    <div className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={isChecked}
                          onCheckedChange={(checked) => {
                            let values = form.getValues('customPolygon') || [];

                            if (checked) {
                              if (
                                !values.some(
                                  (obj) => obj.id === Number(item.id)
                                )
                              ) {
                                const { name } = item;
                                form.setValue('customPolygon', [
                                  ...values,
                                  {
                                    name,
                                    id: Number(item.id),
                                    url: '',
                                    color: '',
                                    openInNewTab: false,
                                    buttonText: '',
                                  },
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
                              form.setValue('customPolygon', filteredValues);
                              props.onFieldChanged(
                                'customPolygon',
                                filteredValues
                              );
                            }
                          }}
                        />
                      </FormControl>
                      <FormLabel className="font-normal">{item.name}</FormLabel>
                    </div>
                    {isChecked && (
                      <div className="w-full pl-6 grid grid-cols-1 lg:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name={`customPolygonUrl.${Number(item.id)}`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>URL</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="url / path"
                                  type="text"
                                  {...field}
                                  onChange={(e) => {
                                    onFieldChange(field.name, e.target.value);
                                    field.onChange(e);
                                  }}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <PolygonExtraField
                          form={form}
                          itemId={Number(item.id)}
                          fieldName="color"
                          existingData={existingData}
                          render={(polygonIndex) => (
                            <FormField
                              control={form.control}
                              name={`customPolygon.${polygonIndex}.color`}
                              render={({ field: colorField }) => (
                                <FormItem>
                                  <FormLabel>Kleur</FormLabel>
                                  <FormControl>
                                    <ColorPicker
                                      value={
                                        colorField.value ||
                                        existingData.color ||
                                        ''
                                      }
                                      onChange={(e) =>
                                        colorField.onChange(e.target.value)
                                      }
                                    />
                                  </FormControl>
                                </FormItem>
                              )}
                            />
                          )}
                        />
                        <PolygonExtraField
                          form={form}
                          itemId={Number(item.id)}
                          fieldName="buttonText"
                          existingData={existingData}
                          render={(polygonIndex) => (
                            <FormField
                              control={form.control}
                              name={`customPolygon.${polygonIndex}.buttonText`}
                              render={({ field: btnField }) => (
                                <FormItem>
                                  <FormLabel>Knoptekst</FormLabel>
                                  <FormControl>
                                    <Input
                                      placeholder="Lees verder"
                                      type="text"
                                      value={
                                        btnField.value ||
                                        existingData.buttonText ||
                                        ''
                                      }
                                      onChange={(e) =>
                                        btnField.onChange(e.target.value)
                                      }
                                    />
                                  </FormControl>
                                </FormItem>
                              )}
                            />
                          )}
                        />
                        <PolygonExtraField
                          form={form}
                          itemId={Number(item.id)}
                          fieldName="openInNewTab"
                          existingData={existingData}
                          render={(polygonIndex) => (
                            <FormField
                              control={form.control}
                              name={`customPolygon.${polygonIndex}.openInNewTab`}
                              render={({ field: tabField }) => (
                                <FormItem className="flex flex-row items-center space-x-3 space-y-0 pt-8">
                                  <FormControl>
                                    <Checkbox
                                      checked={
                                        tabField.value ??
                                        existingData.openInNewTab ??
                                        false
                                      }
                                      onCheckedChange={tabField.onChange}
                                    />
                                  </FormControl>
                                  <FormLabel>Open in nieuw tabblad</FormLabel>
                                </FormItem>
                              )}
                            />
                          )}
                        />
                      </div>
                    )}
                    <FormMessage />
                  </FormItem>
                );
              }}
            />
          )) || null}

          <Spacer size={3} />

          <FormField
            control={form.control}
            name="interactionType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Hoe wil je dat de interactie werkt met de polygonen?
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
                      <strong>Standaard</strong>: Op een polygoon klikken opent
                      een pop-up met de titel van de polygoon en een knop met de
                      ingevulde URL (als deze is ingevuld).
                    </SelectItem>
                    <SelectItem value="direct">
                      <strong>Direct naar URL</strong>: Op een polygoon klikken
                      opent direct de ingevulde URL. De titel van de polygoon
                      wordt ook direct getoond.
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

function PolygonExtraField({
  form,
  itemId,
  fieldName,
  existingData,
  render,
}: {
  form: any;
  itemId: number;
  fieldName: string;
  existingData: any;
  render: (polygonIndex: number) => React.ReactNode;
}) {
  const polygons = form.watch('customPolygon') || [];
  const polygonIndex = polygons.findIndex((p: any) => p.id === itemId);
  if (polygonIndex === -1) return null;
  return <>{render(polygonIndex)}</>;
}
