import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
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
import { Heading } from '@/components/ui/typography';
import useTags from '@/hooks/use-tags';
import { useFieldDebounce } from '@/hooks/useFieldDebounce';
import { EditFieldProps } from '@/lib/form-widget-helpers/EditFieldProps';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState } from 'react';
import * as React from 'react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

import { ResourceOverviewMapWidgetTabProps } from '.';

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
  customUrl: z.string().optional(),
  width: z.string().optional(),
  height: z.string().optional(),
});

type SchemaKey = keyof typeof formSchema.shape;

export default function WidgetResourcesMapMap(
  props: ResourceOverviewMapWidgetTabProps &
    EditFieldProps<ResourceOverviewMapWidgetTabProps> & {
      omitSchemaKeys?: Array<SchemaKey>;
    }
) {
  type FormData = z.infer<typeof formSchema>;

  async function onSubmit(values: FormData) {
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
      customUrl: props?.customUrl || '',
      width: props?.width || '',
      height: props?.height || '',
    },
  });

  const { data: tags } = useTags(props.projectId);

  const [tagGroupNames, setGroupedNames] = useState<string[]>([]);

  useEffect(() => {
    if (Array.isArray(tags)) {
      const fetchedTags = tags as Array<Tag>;
      let groupNames = fetchedTags.map((tag) => tag.type);
      groupNames = groupNames.filter((value, index, array) => {
        return array.indexOf(value) == index;
      });
      setGroupedNames(groupNames);
    }
  }, [tags]);

  const tileLayerOptions = [
    { value: 'nlmaps', label: 'Nederlandse Kaart' },
    { value: 'amaps', label: 'Amsterdam Kaart' },
    { value: 'openstreetmaps', label: 'OpenStreetMap' },
    { value: 'n3s', label: 'CartoDB Light' },
    { value: 'custom', label: 'Aangepaste Kaart' },
  ];

  const hideOverviewFields = props?.hideOverviewFields || false;

  return (
    <div className="p-6 bg-white rounded-md">
      <Form {...form}>
        <Heading size="xl">Kaart</Heading>
        <Separator className="my-4" />
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-4 lg:w-1/2">
          <FormField
            control={form.control}
            name="autoZoomAndCenter"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Automatisch inzoomen en centreren</FormLabel>
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
                    <SelectItem value="" disabled>
                      Selecteer een optie
                    </SelectItem>
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

          {!hideOverviewFields && (
            <FormField
              control={form.control}
              name="categorize.categorizeByField"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Gebruik tags van dit type (gebruik de iconen en kleuren van
                    de tag) om de inzending te tonen.
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
                      <SelectItem value="">
                        Geen (gebruik alleen standaardiconen)
                      </SelectItem>
                      {tagGroupNames.map((type) => (
                        <SelectItem value={type} key={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          <FormField
            control={form.control}
            name="tilesVariant"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Kaart stijl</FormLabel>
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
                    <SelectItem value="" disabled>
                      Selecteer een optie
                    </SelectItem>
                    {tileLayerOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {!!form.watch('tilesVariant') &&
            form.watch('tilesVariant') !== 'nlmaps' && (
              <p
                style={{
                  backgroundColor: '#d69e2e',
                  color: 'black',
                  padding: '15px',
                  borderLeft: '4px solid black',
                  borderTopRightRadius: '5px',
                  borderBottomRightRadius: '5px',
                  marginTop: '10px',
                  fontSize: '13px',
                }}
                className="lg:w-full lg:col-span-2">
                <strong>Let op!</strong> Wanneer je een andere kaartweergave
                kiest dan de &quot;Nederlandse Kaart&quot;, en je hebt een
                Content Security Policy (CSP) ingesteld, moet je ervoor zorgen
                dat je de juiste headers toevoegt aan je CSP. <br /> <br />
                Lees meer over CSP instellingen voor kaartweergaven bij{' '}
                <strong>
                  Projectinstellingen &gt; Algemeen &gt; Beveiligingsheaders
                </strong>
              </p>
            )}

          {form.watch('tilesVariant') === 'custom' && (
            <FormField
              control={form.control}
              name="customUrl"
              render={({ field }) => (
                <FormItem className="col-span-1">
                  <FormLabel>Aangepaste URL</FormLabel>
                  <FormDescription>{`Voer de URL in voor de aangepaste kaartweergave. Bijvoorbeeld: https://example.com/tiles/{z}/{x}/{y}.png`}</FormDescription>
                  <FormControl>
                    <Input
                      placeholder="https://example.com/tiles/{z}/{x}/{y}.png"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          <FormField
            control={form.control}
            name="width"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Breedte</FormLabel>
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
                <FormLabel>Hoogte</FormLabel>
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

          <Button type="submit">Opslaan</Button>
        </form>
      </Form>
    </div>
  );
}
