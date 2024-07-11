import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
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
import * as Switch from '@radix-ui/react-switch';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Heading } from '@/components/ui/typography';
import { zodResolver } from '@hookform/resolvers/zod';
import useTags from '@/hooks/use-tags';
import { useForm, useFormContext } from 'react-hook-form';
import { useFieldDebounce } from '@/hooks/useFieldDebounce';
import type { ResourceOverviewMapWidgetProps } from '@openstad-headless/leaflet-map/src/types/resource-overview-map-widget-props'
import { EditFieldProps } from '@/lib/form-widget-helpers/EditFieldProps';
import * as z from 'zod';
import { ResourceOverviewMapWidgetTabProps } from '.';
import { Textarea } from '@/components/ui/textarea';
import useAreas from '@/hooks/use-areas';
import { Checkbox } from '@/components/ui/checkbox';

type Tag = {
  id: number;
  name: string;
  type: string;
};

const formSchema = z.object({
  markerHref: z.string().optional(),
  autoZoomAndCenter: z.enum(['markers', 'area']).optional(),
  categorize: z.object({
    categorizeByField: z.string().optional(),
  }),
  clustering: z.object({
    isActive: z.boolean().optional(),
  }),
  tilesVariant: z.string().optional(),
  width: z.string().optional(),
  height: z.string().optional(),
  customPolygon: z.array(z.object({ id: z.number(), name: z.string() })).optional(),
  customPolygonUrl: z.array( z.string().optional()).optional()
});


type SchemaKey = keyof typeof formSchema.shape;

export default function WidgetResourcesMapMap(
  props: ResourceOverviewMapWidgetTabProps &
    EditFieldProps<ResourceOverviewMapWidgetTabProps> & {
      omitSchemaKeys?: Array<SchemaKey>;
      customPolygon?: any;
      customPolygonUrl?: any;
    }
) {

  type FormData = z.infer<typeof formSchema>;

  async function onSubmit(values: FormData) {
    console.log('on submit', values);

// Combineer customPolygonUrl uit de values met customPolygon, zodat daar de URLs in staan, en sla customPolygonUrl niet op

console.log(values?.customPolygonUrl)

    const customPolygon = values?.customPolygonUrl?.map((item, key) => {
      console.log({'value': item, key})

    });

    customPolygon
    

    props.updateConfig({ ...props, ...values });
  }

  const { onFieldChange } = useFieldDebounce(props.onFieldChanged);

  const form = useForm<FormData>({
    resolver: zodResolver<any>(formSchema),
    defaultValues: {
      markerHref: props?.markerHref || '',
      autoZoomAndCenter: props?.autoZoomAndCenter || 'markers',
      clustering: props?.clustering || {},
      categorize: props?.categorize || {},
      tilesVariant: props?.tilesVariant || '',
      width: props?.width || '',
      height: props?.height || '',
      customPolygon: props?.customPolygon || [],
      customPolygonUrl: props?.customPolygonUrl || []
    },
  });

  const { data: tags } = useTags(props.projectId);
  const { data: areas } = useAreas(props.projectId) as { data: { id: string, name: string }[] } ?? [];


  const [tagGroupNames, setGroupedNames] = useState<string[]>([]);

  useEffect(() => {
    if (Array.isArray(tags)) {
      const fetchedTags = tags as Array<Tag>;
      let groupNames = fetchedTags.map(tag => tag.type);
      groupNames = groupNames.filter((value, index, array) => {
        return array.indexOf(value) == index;
      });
      setGroupedNames(groupNames);
    }
  }, [tags]);


  interface Area {
    id: string | number; // Assuming id can be string or number
    name: string;
  }

  interface CustomPolygon {
    id: string | number;
    // Add other properties of the status object as needed
  }



  useEffect(() => {
    console.log (form.formState.errors, 'errors');
  }, [form.formState.errors]);

  return (
    <div className="p-6 bg-white rounded-md">
      <Form {...form}>
        <Heading size="xl">Map</Heading>
        <Separator className="my-4" />
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-4 lg:w-1/2">

          <FormField
            control={form.control}
            name="markerHref"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Link naar de specifieke resource
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="Bijv: /resource?openstadResourceId=[id]"
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

          <FormField
            control={form.control}
            name="autoZoomAndCenter"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Automatisch inzoomen en centreren
                </FormLabel>
                <Select
                  onValueChange={(value) => {
                    props.onFieldChanged(field.name, value);
                    field.onChange(value);
                  }}
                  value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecteer een optie" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="" disabled>Selecteer een optie</SelectItem>
                    <SelectItem value="markers">Toon de markers</SelectItem>
                    <SelectItem value="area">Toon het gebied</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/*
          <FormField
            control={form.control}
            name="clustering.isActive"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                Cluster icons die dicht bij elkaar liggen
                </FormLabel>
                <Switch.Root
                  className="block w-[50px] h-[25px] bg-stone-300 rounded-full relative focus:shadow-[0_0_0_2px] focus:shadow-black data-[state=checked]:bg-primary outline-none cursor-default"
                  onCheckedChange={(value: boolean) => {
                      props.onFieldChanged(field.name, value);
                      field.onChange(value);
                  }}
                  checked={field.value}>
                  <Switch.Thumb className="block w-[21px] h-[21px] bg-white rounded-full transition-transform duration-100 translate-x-0.5 will-change-transform data-[state=checked]:translate-x-[27px]" />
                </Switch.Root>
                <FormMessage />
              </FormItem>
            )}
          />
          */}

          <FormField
            control={form.control}
            name="categorize.categorizeByField"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Gebruik tags van dit type om de resources te tonen, dwz. gebruik de iconen en kleuren van de tag.
                </FormLabel>
                <Select
                  onValueChange={(value) => {
                    props.onFieldChanged(field.name, value);
                    field.onChange(value);
                  }}
                  value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecteer een optie" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="">Geen (gebruik alleen standaardiconen)</SelectItem>
                    {tagGroupNames.map(type => (
                      <SelectItem value={type} key={type}>{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="tilesVariant"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Kaart stijl
                </FormLabel>
                <Select
                  onValueChange={(value) => {
                    props.onFieldChanged(field.name, value);
                    field.onChange(value);
                  }}
                  value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecteer een optie" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="" disabled>Selecteer een optie</SelectItem>
                    <SelectItem value="nlmaps">NL maps</SelectItem>
                    <SelectItem value="amaps">Amsterdams</SelectItem>
                    <SelectItem value="openstreetmaps">Open Street Maps</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="width"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Breedte
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="Bijv: 100%"
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

          <FormField
            control={form.control}
            name="height"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Hoogte
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="Bijv: 350px"
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


          {areas?.map((item) => (
            <FormField
              key={item.id}
              control={form.control}
              name="customPolygon"
              render={({ field }) => {
                const isChecked = Array.isArray(field.value) && field.value.some(obj => obj.id === Number(item.id));

                return (
                  <FormItem
                    key={item.id}
                    className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={isChecked}
                        onCheckedChange={(checked) => {
                          let values = form.getValues('customPolygon') || [];

                          console.log('on checked change', { checked, values });
                          if (checked) {
                            if (!values.some(obj => obj.id === Number(item.id))) {
                              const { name } = item;
                              form.setValue('customPolygon', [...values, { name, id: Number(item.id) }]);
                            }
                          } else {
                            const filteredValues = values.filter(obj => obj.id !== Number(item.id));
                            form.setValue('customPolygon', filteredValues);
                          }
                        }}
                      />
                    </FormControl>
                    <FormLabel className="font-normal">
                      {item.name}
                    </FormLabel>

                    {isChecked && (
                      <FormField
                        control={form.control}
                        name={`customPolygonUrl.${Number(item.id)}`}
                        render={({ field }) => (
                          
                          <FormItem>
                            <FormLabel>
                              Add URL
                            </FormLabel>
                            <FormControl>
                              <Input
                                placeholder="url / path"
                                type="text"
                                {...field}
                                onChange={(e) => {
                                  let values = form.getValues('customPolygon') || [];
                                  console.log(values);
                                  console.log('on change', form.getValues('customPolygon'), form.getValues('customPolygonUrl'));
                                  onFieldChange(field.name, e.target.value);
                                  field.onChange(e);
                                }}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}
                    <FormMessage />
                  </FormItem>
                );
              }}
            />
          )) || null}


          <Button type="submit">Opslaan</Button>
        </form>
      </Form>
    </div>
  );
}
