import { FormObjectSelectField } from '@/components/ui/form-object-select-field';
import InfoDialog from '@/components/ui/info-hover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Heading } from '@/components/ui/typography';
import useResources from '@/hooks/use-resources';
import { useFieldDebounce } from '@/hooks/useFieldDebounce';
import { YesNoSelect } from '@/lib/form-widget-helpers';
import { EditFieldProps } from '@/lib/form-widget-helpers/EditFieldProps';
import type { DocumentMapProps } from '@openstad-headless/document-map/src/document-map';
import * as Switch from '@radix-ui/react-switch';
import { useEffect, useState } from 'react';
import * as React from 'react';
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

const formSchema = z.object({
  resourceId: z.string().optional(),
  entireDocumentVisible: z.enum(['entirely', 'onlyTop']).optional(),
  zoom: z.number().optional(),
  minZoom: z.number().optional(),
  maxZoom: z.number().optional(),
  itemsPerPage: z.coerce.number().optional(),
  displayPagination: z.boolean().optional(),
  onlyAllowClickOnImage: z.boolean().optional(),
});
type FormData = z.infer<typeof formSchema>;

export default function DocumentGeneral(
  props: DocumentMapProps & EditFieldProps<DocumentMapProps>
) {
  const { onFieldChange } = useFieldDebounce(props.onFieldChanged);
  const [disabled, setDisabled] = useState(false);
  const [accessibilityUrlVisible, setAccessibilityUrlVisible] = useState(
    props.accessibilityUrlVisible || false
  );
  const [definitiveUrlVisible, setDefinitiveUrlVisible] = useState(
    props.definitiveUrlVisible || false
  );

  function onSubmit(values: FormData) {
    props.updateConfig({ ...props, ...values });
  }

  const { data } = useResources(props.projectId);
  const resources: Array<{ id: string | number; title: string }> = data || [];
  const [toggle, setToggle] = useState('resourceId_');

  const form = useForm<DocumentMapProps>({
    defaultValues: {
      resourceId: props.resourceId || undefined,

      zoom: props.zoom || 1,
      minZoom: props.minZoom || -6,
      maxZoom: props.maxZoom || 10,
      entireDocumentVisible: props.entireDocumentVisible || 'entirely',
      itemsPerPage: props?.itemsPerPage || 9999,
      displayPagination: props?.displayPagination || false,
      onlyAllowClickOnImage: props?.onlyAllowClickOnImage || false,
    },
  });

  useEffect(() => {
    const minZoomValue = form.watch('minZoom');
    const maxZoomValue = form.watch('maxZoom');
    const zoomValue = form.watch('zoom');

    let shouldDisable = false;

    if (minZoomValue && maxZoomValue && zoomValue) {
      const minZoom =
        typeof minZoomValue == 'string' ? parseInt(minZoomValue) : minZoomValue;
      const maxZoom =
        typeof maxZoomValue == 'string' ? parseInt(maxZoomValue) : maxZoomValue;
      const zoom =
        typeof zoomValue == 'string' ? parseInt(zoomValue) : zoomValue;

      if (zoom > maxZoom || zoom < minZoom) {
        form.setError('zoom', {
          type: 'manual',
          message: 'Waarde moet tussen het in- en uitzoom niveau liggen',
        });
        shouldDisable = true;
      } else {
        form.clearErrors('zoom');
      }

      if (minZoom >= maxZoom) {
        form.setError('minZoom', {
          type: 'manual',
          message: 'Waarde kan niet hoger zijn dan het uitzoom niveau',
        });
        form.setError('maxZoom', {
          type: 'manual',
          message: 'Waarde kan niet lager zijn dan het inzoom niveau',
        });
        shouldDisable = true;
      } else {
        form.clearErrors(['minZoom', 'maxZoom']);
      }
    }

    setDisabled(shouldDisable);
  }, [form.watch('minZoom'), form.watch('maxZoom'), form.watch('zoom')]);

  return (
    <Form {...form} className="p-6 bg-white rounded-md">
      <Heading size="xl" className="mb-4">
        Document instellingen
      </Heading>
      <Separator className="mb-4" />
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-4 lg:w-1/2">
        <FormObjectSelectField
          form={form}
          fieldName="resourceId"
          fieldLabel="Koppel aan een specifieke inzending"
          items={resources}
          keyForValue="id"
          label={(resource) => `${resource.id} ${resource.title}`}
          onFieldChanged={(e, key) => {
            props.onFieldChanged;
            setToggle(e + '_' + key);
          }}
          noSelection="Niet koppelen - beschrijf het path of gebruik queryparam openstadResourceId"
        />
        {toggle === 'resourceId_' ? (
          <FormField
            control={form.control}
            name="resourceIdRelativePath"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Geen specifieke inzending gekoppeld?</FormLabel>
                <em className="text-xs">
                  Beschrijf hoe de inzending gehaald wordt uit de url:
                  (/pad/naar/[id]) of laat leeg om terug te vallen op
                  ?openstadResourceId
                </em>
                <FormControl>
                  <Input
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
        ) : null}

        <FormField
          control={form.control}
          name="minZoom"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Maximale zoomniveau voor uitzoomen
                <InfoDialog content="Dit is het maximale niveau waarop gebruikers kunnen uitzoomen op de kaart. Hoe kleiner het ingevulde getal, hoe verder gebruikers kunnen uitzoomen om meer detail te zien." />
              </FormLabel>
              <FormControl>
                <Input
                  placeholder="-6"
                  defaultValue={field.value}
                  onChange={(e) => {
                    field.onChange(e);
                    onFieldChange(field.name, e.target.value);
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="maxZoom"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Maximale zoomniveau voor inzoomen
                <InfoDialog content="Dit is het maximale niveau waarop gebruikers kunnen inzoomen op de kaart. Hoe hoger het ingevulde getal, hoe verder gebruikers kunnen inzoomen om meer detail te zien." />
              </FormLabel>
              <FormControl>
                <Input
                  placeholder="10"
                  defaultValue={field.value}
                  onChange={(e) => {
                    field.onChange(e);
                    onFieldChange(field.name, e.target.value);
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="displayLikes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Toon de likes widget</FormLabel>
              {YesNoSelect(field, props)}
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="largeDoc"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Grotere weergave voor het document</FormLabel>
              {YesNoSelect(field, props)}
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="entireDocumentVisible"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Welk gedeelte van de afbeelding moet zichtbaar zijn als de
                widget is ingeladen?
              </FormLabel>
              <Select
                onValueChange={(value) => {
                  field.onChange(value);
                  props.onFieldChanged(field.name, value);
                }}
                value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Standaard" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="entirely">
                    Hele afbeelding zichtbaar
                  </SelectItem>
                  <SelectItem value="onlyTop">Focus op de bovenkant</SelectItem>
                </SelectContent>
              </Select>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="onlyAllowClickOnImage"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Alleen markers op de afbeelding toelaten?</FormLabel>
              <FormDescription>
                Als dit aan staat kunnen gebruikers alleen op de afbeelding
                klikken en niet op de ruimte er omheen.
              </FormDescription>
              <FormControl>
                <Switch.Root
                  className="block w-[50px] h-[25px] bg-stone-300 rounded-full relative focus:shadow-[0_0_0_2px] focus:shadow-black data-[state=checked]:bg-primary outline-none cursor-default"
                  onCheckedChange={(e: boolean) => {
                    props.onFieldChanged(field.name, e);
                    field.onChange(e);
                  }}
                  checked={field.value}>
                  <Switch.Thumb className="block w-[21px] h-[21px] bg-white rounded-full transition-transform duration-100 translate-x-0.5 will-change-transform data-[state=checked]:translate-x-[27px]" />
                </Switch.Root>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="displayPagination"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Paginering tonen</FormLabel>
              <FormControl>
                <Switch.Root
                  className="block w-[50px] h-[25px] bg-stone-300 rounded-full relative focus:shadow-[0_0_0_2px] focus:shadow-black data-[state=checked]:bg-primary outline-none cursor-default"
                  onCheckedChange={(e: boolean) => {
                    props.onFieldChanged(field.name, e);
                    field.onChange(e);
                  }}
                  checked={field.value}>
                  <Switch.Thumb className="block w-[21px] h-[21px] bg-white rounded-full transition-transform duration-100 translate-x-0.5 will-change-transform data-[state=checked]:translate-x-[27px]" />
                </Switch.Root>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {!!form.watch('displayPagination') && (
          <FormField
            control={form.control}
            name="itemsPerPage"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Hoeveelheid items per pagina</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    {...field}
                    placeholder="9999"
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
        )}

        <Button type="submit" disabled={disabled}>
          Opslaan
        </Button>
      </form>
    </Form>
  );
}
