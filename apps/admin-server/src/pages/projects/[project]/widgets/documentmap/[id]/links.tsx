import { Separator } from '@/components/ui/separator';
import { Heading } from '@/components/ui/typography';
import { useFieldDebounce } from '@/hooks/useFieldDebounce';
import { EditFieldProps } from '@/lib/form-widget-helpers/EditFieldProps';
import type { DocumentMapProps } from '@openstad-headless/document-map/src/document-map';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '../../../../../../components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel, FormMessage,
} from '../../../../../../components/ui/form';
import { Input } from '../../../../../../components/ui/input';
import { FormObjectSelectField } from '@/components/ui/form-object-select-field';
import useStatus from '@/hooks/use-statuses';
import { useState } from "react";
import * as React from "react";
import * as Switch from '@radix-ui/react-switch';

const formSchema = z.object({
  statusId: z.string().optional(),
  accessibilityUrlVisible: z.boolean().optional(),
  accessibilityUrl: z.string().optional(),
  accessibilityUrlText: z.string().optional(),
  definitiveUrlVisible: z.boolean().optional(),
  definitiveUrl: z.string().optional(),
  definitiveUrlText: z.string().optional(),
  backUrlContent: z.string().optional(),
  backUrlText: z.string().optional(),
});
type FormData = z.infer<typeof formSchema>;

export default function DocumentGeneral(
  props: DocumentMapProps &
    EditFieldProps<DocumentMapProps>
) {
  const { onFieldChange } = useFieldDebounce(props.onFieldChanged);
  const [disabled, setDisabled] = useState(false);
  const [accessibilityUrlVisible, setAccessibilityUrlVisible] = useState(props.accessibilityUrlVisible || false);
  const [definitiveUrlVisible, setDefinitiveUrlVisible] = useState(props.definitiveUrlVisible || false);

  function onSubmit(values: FormData) {
    props.updateConfig({ ...props, ...values });
  }
  const { data } = useStatus(props.projectId);
  const status: Array<{ id: string | number; name: string }> = data || [];

  const form = useForm<DocumentMapProps>({
    defaultValues: {
      statusId: props.statusId || undefined,
      accessibilityUrlVisible: props.accessibilityUrlVisible || false,
      accessibilityUrl: props.accessibilityUrl || '',
      accessibilityUrlText: props.accessibilityUrlText || '',
      definitiveUrlVisible: props.definitiveUrlVisible || false,
      definitiveUrl: props.definitiveUrl || '',
      definitiveUrlText: props.definitiveUrlText || '',
      backUrlContent: props.backUrlContent || 'Je bekijkt nu de versie met reacties',
      backUrlText: props.backUrlText || 'Bekijk de verbeterde versie',
    },
  });

  return (
    <Form {...form} className="p-6 bg-white rounded-md">
      <Heading size="xl" className="mb-4">
        Links naar andere pagina&apos;s / versies
      </Heading>
      <Separator className="mb-4" />
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-4 lg:w-1/2">

        <FormField
          control={form.control}
          name="accessibilityUrlVisible"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Heeft een pagina met begeleidende tekst?
              </FormLabel>
              <Switch.Root
                className="block w-[50px] h-[25px] bg-stone-300 rounded-full relative focus:shadow-[0_0_0_2px] focus:shadow-black data-[state=checked]:bg-primary outline-none cursor-default"
                onCheckedChange={(e: boolean) => {
                  field.onChange(e);
                  setAccessibilityUrlVisible(e)
                }}
                checked={field.value}>
                <Switch.Thumb className="block w-[21px] h-[21px] bg-white rounded-full transition-transform duration-100 translate-x-0.5 will-change-transform data-[state=checked]:translate-x-[27px]" />
              </Switch.Root>
              <FormMessage />
            </FormItem>
          )}
        />
        {accessibilityUrlVisible && (
          <>
            <FormField
              control={form.control}
              name="accessibilityUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Link naar pagina met begeleidende tekst</FormLabel>
                  <em className="text-xs">Maak gebruik van =[id] om de link dynamisch te maken. (pad/naar=[id])</em>
                  <FormControl>
                    <Input
                      placeholder="/path/to/page?openstadResourceId=[id]"
                      defaultValue={field.value}
                      onChange={(e) => {
                        field.onChange(e);
                        onFieldChange(field.name, e.target.value);
                      }}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="accessibilityUrlText"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tekst van de link</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Bekijk tekstuele versie"
                      defaultValue={field.value}
                      onChange={(e) => {
                        field.onChange(e);
                        onFieldChange(field.name, e.target.value);
                      }}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </>
        )}

        <FormField
          control={form.control}
          name="definitiveUrlVisible"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Heeft een definitieve versie van het plan?
              </FormLabel>
              <Switch.Root
                className="block w-[50px] h-[25px] bg-stone-300 rounded-full relative focus:shadow-[0_0_0_2px] focus:shadow-black data-[state=checked]:bg-primary outline-none cursor-default"
                onCheckedChange={(e: boolean) => {
                  field.onChange(e);
                  setDefinitiveUrlVisible(e)
                }}
                checked={field.value}>
                <Switch.Thumb className="block w-[21px] h-[21px] bg-white rounded-full transition-transform duration-100 translate-x-0.5 will-change-transform data-[state=checked]:translate-x-[27px]" />
              </Switch.Root>
              <FormMessage />
            </FormItem>
          )}
        />
        {definitiveUrlVisible && (
          <>
            <FormField
              control={form.control}
              name="definitiveUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Link naar pagina van de definitieve versie</FormLabel>
                  <em className="text-xs">Maak gebruik van =[id] om de link dynamisch te maken. (pad/naar=[id])</em>
                  <FormControl>
                    <Input
                      placeholder="/path/to/page?openstadResourceId=[id]"
                      defaultValue={field.value}
                      onChange={(e) => {
                        field.onChange(e);
                        onFieldChange(field.name, e.target.value);
                      }}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="definitiveUrlText"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tekst van de link</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Bekijk definitieve versie"
                      defaultValue={field.value}
                      onChange={(e) => {
                        field.onChange(e);
                        onFieldChange(field.name, e.target.value);
                      }}
                    />
                  </FormControl>
                </FormItem>
              )}
            />



            <FormObjectSelectField
              form={form}
              fieldName="statusId"
              fieldLabel="Definitieve status"
              items={status}
              keyForValue="id"
              label={(status) => `${status.id} - ${status.name}`}
              onFieldChanged={(e, key) => {
                props.onFieldChanged
              }}
            />



          </>
        )}


        <FormField
          control={form.control}
          name="backUrlContent"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Terug naar definitieve versie, begeleidende tekst
              </FormLabel>
              <FormControl>
                <Input
                  placeholder="Bekijk definitieve versie"
                  defaultValue={field.value}
                  onChange={(e) => {
                    field.onChange(e);
                    onFieldChange(field.name, e.target.value);
                  }}
                />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="backUrlText"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Terug naar definitieve versie, link tekst
              </FormLabel>
              <FormControl>
                <Input
                  placeholder="Bekijk definitieve versie"
                  defaultValue={field.value}
                  onChange={(e) => {
                    field.onChange(e);
                    onFieldChange(field.name, e.target.value);
                  }}
                />
              </FormControl>
            </FormItem>
          )}
        />
        <Button
          type="submit"
          disabled={disabled}
        >
          Opslaan
        </Button>
      </form>
    </Form>
  );
}
