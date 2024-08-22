import { CheckboxList } from '@/components/checkbox-list';
import { Button } from '@/components/ui/button';
import {
  Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage
} from '@/components/ui/form';
import { Separator } from '@/components/ui/separator';
import { Heading } from '@/components/ui/typography';
import useTags from '@/hooks/use-tags';
import { EditFieldProps } from '@/lib/form-widget-helpers/EditFieldProps';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import React from "react";
import {Spacer} from "@/components/ui/spacer";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";
import { DocumentMapProps } from '@openstad-headless/document-map/src/document-map';

const formSchema = z.object({
  includeOrExclude: z.string().optional(),
  onlyIncludeOrExcludeTagIds: z.string().optional()
});

export default function DocumentInclude(
  props: DocumentMapProps &
    EditFieldProps<DocumentMapProps>
) {
  type FormData = z.infer<typeof formSchema>;
  async function onSubmit(values: FormData) {
    props.updateConfig({ ...props, ...values });
  }

  const { data: loadedTags } = useTags(props.projectId);
  const tags = (loadedTags || []) as Array<{
    id: string;
    name: string;
    type?: string;
  }>;

  const form = useForm<FormData>({
    resolver: zodResolver<any>(formSchema),
    defaultValues: {
      includeOrExclude: props?.includeOrExclude || 'include',
      onlyIncludeOrExcludeTagIds: props?.onlyIncludeOrExcludeTagIds || '',
    },
  });

  return (
    <div className="p-6 bg-white rounded-md">
      <Form {...form} className="p-6 bg-white rounded-md">
        <Heading size="xl">Inclusief/Exclusief</Heading>
        <Separator className="my-4" />
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="grid gap-4">

          <FormField
            control={form.control}
            name="includeOrExclude"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Toon reacties gekoppeld aan onderstaande tags
                </FormLabel>
                <FormDescription>
                  Gebruik het selectievakje om te kiezen hoe de geselecteerde tags de weergave van reacties
                  beïnvloeden:
                  <br/>
                  <br/>
                  Maak je keuze op basis van hoe je de reacties wilt filteren in relatie tot de geselecteerde tags.
                  <br/>
                  <br/>
                </FormDescription>
                <Select
                  onValueChange={field.onChange}
                  value={field.value || 'include'}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Inclusief" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="include"><strong>Inclusief</strong>: Als je deze optie kiest, worden alleen de
                      reacties getoond die gekoppeld zijn aan de
                      geselecteerde tags.</SelectItem>
                    <SelectItem value="exclude"><strong>Exclusief</strong>: Als je deze optie kiest, worden juist de
                      reacties die gekoppeld zijn aan de
                      geselecteerde tags niet getoond.</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <Spacer />

          <CheckboxList
            form={form}
            fieldName="onlyIncludeOrExcludeTagIds"
            fieldLabel="Geef enkel de resources met de volgende tags weer:"
            label={(t) => t.name}
            keyForGrouping="type"
            keyPerItem={(t) => `${t.id}`}
            items={tags}
            selectedPredicate={(t) =>
              // @ts-ignore
              form
                ?.getValues('onlyIncludeOrExcludeTagIds')
                ?.split(',')
                ?.findIndex((tg) => tg === `${t.id}`) > -1
            }
            onValueChange={(tag, checked) => {
              const ids = form.getValues('onlyIncludeOrExcludeTagIds')?.split(',') ?? [];

              const idsToSave = (checked
                ? [...ids, tag.id]
                : ids.filter((id) => id !== `${tag.id}`)).join(',');

              form.setValue('onlyIncludeOrExcludeTagIds', idsToSave);
              props.onFieldChanged("onlyIncludeOrExcludeTagIds", idsToSave);
            }}
          />

          <Button className="w-fit col-span-full" type="submit">
            Opslaan
          </Button>
        </form>
      </Form>
    </div>
  );
}
