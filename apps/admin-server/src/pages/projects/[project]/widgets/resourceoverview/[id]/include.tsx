import { CheckboxList } from '@/components/checkbox-list';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl, FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Heading } from '@/components/ui/typography';
import useTags from '@/hooks/use-tags';
import { useFieldDebounce } from '@/hooks/useFieldDebounce';
import { EditFieldProps } from '@/lib/form-widget-helpers/EditFieldProps';
import { zodResolver } from '@hookform/resolvers/zod';
import { MultiProjectResourceOverviewProps } from '@openstad-headless/multi-project-resource-overview/src/multi-project-resource-overview';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import useStatuses from "@/hooks/use-statuses";
import React from "react";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";
import { Spacer } from '@/components/ui/spacer';

const formSchema = z.object({
  includeOrExcludeTagIds: z.string().optional(),
  includeOrExcludeStatusIds: z.string().optional(),
  onlyIncludeTagIds: z.string().optional(),
  onlyIncludeStatusIds: z.string().optional()
});

export default function WidgetResourceOverviewInclude(
  props: MultiProjectResourceOverviewProps &
    EditFieldProps<MultiProjectResourceOverviewProps>
    & ({
      isMultiProjectResourceOverview?: boolean;
    })
) {
  type FormData = z.infer<typeof formSchema>;
  async function onSubmit(values: FormData) {
    props.updateConfig({ ...props, ...values });
  }

  const { data: loadedStatuses } = useStatuses(props.projectId);
  let statuses = (loadedStatuses || []) as {
    id: number;
    name: string;
  }[];

  const { data: loadedTags } = useTags(props.projectId);
  const tags = (loadedTags || []) as Array<{
    id: string;
    name: string;
    type?: string;
  }>;

  const form = useForm<FormData>({
    resolver: zodResolver<any>(formSchema),
    defaultValues: {
      includeOrExcludeTagIds: props?.includeOrExcludeTagIds || 'include',
      includeOrExcludeStatusIds: props?.includeOrExcludeStatusIds || 'include',
      onlyIncludeTagIds: props?.onlyIncludeTagIds || '',
      onlyIncludeStatusIds: props?.onlyIncludeStatusIds || '',
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
            name="includeOrExcludeTagIds"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Toon inzendingen gekoppeld aan onderstaande tags
                </FormLabel>
                <FormDescription>
                  Gebruik het selectievakje om te kiezen hoe de geselecteerde tags de weergave van inzendingen
                  beïnvloeden:
                  <br/>
                  Maak je keuze op basis van hoe je de inzendingen wil filteren in relatie tot de geselecteerde tags.
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
                      inzendingen getoond die gekoppeld zijn aan de
                      geselecteerde tags.</SelectItem>
                    <SelectItem value="exclude"><strong>Exclusief</strong>: Als je deze optie kiest, worden juist de
                      inzendingen die gekoppeld zijn aan de
                      geselecteerde tags niet getoond.</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <CheckboxList
            form={form}
            fieldName="onlyIncludeTagIds"
            fieldLabel=""
            label={(t) => t.name}
            keyForGrouping="type"
            keyPerItem={(t) => `${t.id}`}
            items={tags}
            selectedPredicate={(t) =>
              // @ts-ignore
              form
                ?.getValues('onlyIncludeTagIds')
                ?.split(',')
                ?.findIndex((tg) => tg === `${t.id}`) > -1
            }
            onValueChange={(tag, checked) => {
              const ids = form.getValues('onlyIncludeTagIds')?.split(',') ?? [];
              const idsToSave = (checked
                ? [...ids, tag.id]
                : ids.filter((id) => id !== `${tag.id}`)).join(',');

              form.setValue('onlyIncludeTagIds', idsToSave);
              props.onFieldChanged("onlyIncludeTagIds", idsToSave);
            }}
          />


          { !props.isMultiProjectResourceOverview && (
            <>
              <Spacer/>

              <FormField
                control={form.control}
                name="includeOrExcludeStatusIds"
                render={({field}) => (
                  <FormItem>
                    <FormLabel>
                      Toon inzendingen gekoppeld aan onderstaande statussen
                    </FormLabel>
                    <FormDescription>
                      Gebruik het selectievakje om te kiezen hoe de geselecteerde statussen de weergave van inzendingen
                      beïnvloeden:
                      <br/>
                      Maak je keuze op basis van hoe je de inzendingen wil filteren in relatie tot de geselecteerde
                      statussen.
                      <br/>
                      <br/>
                    </FormDescription>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value || 'include'}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Inclusief"/>
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="include"><strong>Inclusief</strong>: Als je deze optie kiest, worden alleen
                          de
                          inzendingen getoond die gekoppeld zijn aan de
                          geselecteerde statussen.</SelectItem>
                        <SelectItem value="exclude"><strong>Exclusief</strong>: Als je deze optie kiest, worden juist de
                          inzendingen die gekoppeld zijn aan de
                          geselecteerde statussen niet getoond.</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage/>
                  </FormItem>
                )}
              />


              <CheckboxList
                form={form}
                fieldName="onlyIncludeStatusIds"
                fieldLabel=""
                layout="vertical"
                label={(t) => t.name}
                keyPerItem={(t) => `${t.id}`}
                items={statuses}
                selectedPredicate={(t) =>
                  // @ts-ignore
                  form
                    ?.getValues('onlyIncludeStatusIds')
                    ?.split(',')
                    ?.findIndex((tg) => tg === `${t.id}`) > -1
                }
                onValueChange={(status, checked) => {
                  const values = form.getValues('onlyIncludeStatusIds')?.split(',') ?? [];

                  const idsToSave = (checked
                    ? [...values, status.id]
                    : values.filter((id) => id !== `${status.id}`)).join(',');

                  form.setValue('onlyIncludeStatusIds', idsToSave);
                  props.onFieldChanged("onlyIncludeStatusIds", idsToSave);
                }}
              />
            </>
          )}
          
          <Button className="w-fit col-span-full" type="submit">
            Opslaan
          </Button>
        </form>
      </Form>
    </div>
  );
}
