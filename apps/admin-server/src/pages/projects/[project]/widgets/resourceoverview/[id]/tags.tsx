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

import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { Heading } from '@/components/ui/typography';
import useTags from '@/hooks/use-tags';
import { YesNoSelect } from '@/lib/form-widget-helpers';
import { EditFieldProps } from '@/lib/form-widget-helpers/EditFieldProps';
import { zodResolver } from '@hookform/resolvers/zod';
import { ResourceOverviewWidgetProps } from '@openstad-headless/resource-overview/src/resource-overview';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import React, { useEffect, useState } from 'react';
import _ from 'lodash';
import { handleTagCheckboxGroupChange } from '@/lib/form-widget-helpers/TagGroupHelper';
import { useFieldDebounce } from '@/hooks/useFieldDebounce';
import InfoDialog from "@/components/ui/info-hover";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";
import AccordionUI from "@/components/ui/accordion";
import {CheckboxList} from "@/components/checkbox-list";
import { Spacer } from '@/components/ui/spacer';

const formSchema = z.object({
  displayTagFilters: z.boolean(),
  showActiveTags: z.boolean().optional(),
  tagGroups: z
    .array(
      z.object({
        type: z.string(),
        label: z.string().optional(),
        multiple: z.boolean(),
        projectId: z.string().optional(),
        inlineOptions: z.boolean().optional(),
      })
    )
    .refine((value) => value.some((item) => item), {
      message: 'You have to select at least one item.',
    }),
  displayTagGroupName: z.boolean(),
  filterBehavior: z.string().optional(),
  onlyShowTheseTagIds: z.string().optional(),
});

type Tag = {
  id: number;
  name: string;
  type: string;
};

export default function WidgetResourceOverviewTags(
  props: ResourceOverviewWidgetProps &
    EditFieldProps<ResourceOverviewWidgetProps>
) {
  type FormData = z.infer<typeof formSchema>;
  const { data: tags } = useTags(props.projectId);
  const allTags = (tags || []) as Array<{
    id: string;
    name: string;
    type?: string;
  }>;

  const [tagGroupNames, setGroupedNames] = useState<string[]>([]);

  const { onFieldChange } = useFieldDebounce(props.onFieldChanged);

  useEffect(() => {
    if (Array.isArray(tags)) {
      const fetchedTags = tags as Array<Tag>;
      const groupNames = _.chain(fetchedTags).map('type').uniq().value();
      setGroupedNames(groupNames);
    }
  }, [tags]);

  async function onSubmit(values: FormData) {
    props.updateConfig({ ...props, ...values });
  }

  const form = useForm<FormData>({
    resolver: zodResolver<any>(formSchema),
    defaultValues: {
      displayTagFilters: props?.displayTagFilters || false,
      showActiveTags: props?.showActiveTags || false,
      filterBehavior: props?.filterBehavior || 'or',
      tagGroups: props.tagGroups || [],
      displayTagGroupName: props?.displayTagGroupName || false,
      onlyShowTheseTagIds: props?.onlyShowTheseTagIds || '',
    },
  });

  return (
    <div className="p-6 bg-white rounded-md">
      <Form {...form}>
        <Heading size="xl">Tags</Heading>
        <Separator className="my-4" />
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="lg:w-full grid grid-cols-1 gap-4">
          <FormField
            control={form.control}
            name="displayTagFilters"
            render={({field}) => (
              <FormItem>
                <FormLabel>Filteren op tags weergeven?</FormLabel>
                {YesNoSelect(field, props)}
                <FormMessage/>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="showActiveTags"
            render={({field}) => (
              <FormItem>
                <FormLabel style={{display: 'flex'}}>Wil je onder de filters de actieve tags zien waar op is gefilterd? <InfoDialog content={"Dit geeft je de mogelijkheid om de actieve tags te zien waarop momenteel is gefilterd. Dit is vooral handig bij filters waar je meerdere opties kunt selecteren binnen één dropdown. Zo kun je snel een overzicht krijgen van de geselecteerde tags en eenvoudig aanpassen of verwijderen. De actieve tags worden alleen weergegeven bij filteropties die het toestaan om meerdere keuzes tegelijk te selecteren."} /></FormLabel>
                {YesNoSelect(field, props)}
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="filterBehavior"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Kies hoe je filter-tags combineert</FormLabel>
                <FormDescription>
                  <strong>Of</strong>: Toon inzendingen die met minstens één actieve tag overeenkomen (tagtype maakt niet uit).<br />
                  <strong>En</strong>: Toon alleen inzendingen die per geselecteerd tagtype (filtergroep) minstens één actieve tag matchen.
                </FormDescription>
                <Select
                  onValueChange={field.onChange}
                  value={field.value || 'or'}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Of" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="or">Of</SelectItem>
                    <SelectItem value="and">En</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="tagGroups"
            render={() => (
              <FormItem className="col-span-full">
                <div>
                  <FormLabel>Selecteer de gewenste tag groepen</FormLabel>
                </div>
                <div
                  className="grid grid-cols-1 lg:grid-cols-4 gap-x-4 gap-y-2 items-center"
                  style={{gridTemplateColumns: '1fr 1fr 120px 1fr'}}
                >
                  {(tagGroupNames || []).map((groupName) => (
                    <>
                      <FormField
                        key={`parent${groupName}`}
                        control={form.control}
                        name="tagGroups"
                        render={({ field }) => {
                          return (
                            <FormItem
                              key={groupName}
                              className="flex flex-row items-start space-x-3 space-y-0">
                              <FormControl>
                                <Checkbox
                                  checked={
                                    field.value?.findIndex(
                                      (el) => el.type === groupName
                                    ) > -1
                                  }
                                  onCheckedChange={(checked: any) => {
                                    const projectId = tags.find(
                                      (tag: {type: string}) => tag.type === groupName
                                    )?.projectId;

                                    const updatedFields =
                                      handleTagCheckboxGroupChange(
                                        groupName,
                                        checked,
                                        field.value,
                                        'type',
                                        projectId
                                      );

                                    field.onChange(updatedFields);
                                    props.onFieldChanged(
                                      field.name,
                                      updatedFields
                                    );
                                  }}
                                />
                              </FormControl>
                              <FormLabel className="font-normal">
                                {groupName}
                              </FormLabel>
                            </FormItem>
                          );
                        }}
                      />

                      <FormField
                        key={`parent-label-input${groupName}`}
                        control={form.control}
                        name="tagGroups"
                        render={({ field }) => {
                          return (
                            <FormItem
                              key={`${groupName}-label-input`}
                              className="flex flex-row items-start space-x-3 space-y-0">
                              <FormControl>
                                <Input
                                  placeholder="Groep label"
                                  key={`${groupName}-label-input-field`}
                                  name={groupName}
                                  disabled={
                                    field.value.find(
                                      (g) => g.type === groupName
                                    ) === undefined
                                  }
                                  onChange={(e) => {
                                    const groups = field.value;

                                    const groupIndex = groups.findIndex(
                                      (g) => g.type === groupName
                                    );

                                    const existingGroup = groups[groupIndex];
                                    existingGroup.label = e.target.value;
                                    groups[groupIndex] = existingGroup;
                                    field.onChange(groups);
                                    onFieldChange(field.name, groups);
                                  }}
                                />
                              </FormControl>
                            </FormItem>
                          );
                        }}
                      />

                      <FormField
                        key={`parent${groupName}-multiple`}
                        control={form.control}
                        name="tagGroups"
                        render={({ field }) => {
                          return (
                            <FormItem
                              key={groupName}
                              className="flex flex-row items-start space-x-3 space-y-0">
                              <FormControl>
                                <Checkbox
                                  disabled={
                                    field.value.find(
                                      (g) => g.type === groupName
                                    ) === undefined
                                  }
                                  checked={
                                    field.value?.findIndex(
                                      (el) =>
                                        el.type === groupName && el.multiple
                                    ) > -1
                                  }
                                  onCheckedChange={(checked: any) => {
                                    const groups = handleTagCheckboxGroupChange(
                                      groupName,
                                      checked,
                                      field.value,
                                      'multiple'
                                    );
                                    field.onChange(groups);
                                    props.onFieldChanged(field.name, groups);
                                  }}
                                />
                              </FormControl>
                              <FormLabel className="font-normal">
                                Meerdere
                              </FormLabel>
                            </FormItem>
                          );
                        }}
                      />

                      <FormField
                        key={`parent${groupName}-inlineOptions`}
                        control={form.control}
                        name="tagGroups"
                        render={({ field }) => {
                          return (
                            <FormItem
                              key={groupName}
                              className="flex flex-row items-start space-x-3 space-y-0">
                              <FormControl>
                                <Checkbox
                                  disabled={
                                    field.value.find(
                                      (g) => g.type === groupName
                                    ) === undefined
                                  }
                                  checked={
                                    field.value?.findIndex(
                                      (el) =>
                                        el.type === groupName && el.inlineOptions
                                    ) > -1
                                  }
                                  onCheckedChange={(checked: any) => {
                                    const groups = handleTagCheckboxGroupChange(
                                      groupName,
                                      checked,
                                      field.value,
                                      'inlineOptions'
                                    );
                                    field.onChange(groups);
                                    props.onFieldChanged(field.name, groups);
                                  }}
                                />
                              </FormControl>
                              <FormLabel className="font-normal">
                                Opties altijd zichtbaar
                              </FormLabel>
                            </FormItem>
                          );
                        }}
                      />

                    </>
                  ))}
                </div>
              </FormItem>
            )}
          />

          <Spacer />

          <AccordionUI items={[
            {
              header: 'Bepaal of er alleen een selectie van tags getoond moet worden per type',
              content:(<>
                <p>Standaard worden alle tags getoond binnen de geselecteerde types.
                  Je kunt hier instellen dat er alleen een specifieke selectie van tags getoond wordt binnen de types.
                  Je hoeft hiervoor alleen de tags te selecteren die je getoond wilt hebben binnen een type.</p>
                <br />
                <CheckboxList
                  form={form}
                  fieldName="onlyShowTheseTagIds"
                  fieldLabel=""
                  label={(t) => t.name}
                  keyForGrouping="type"
                  keyPerItem={(t) => `${t.id}`}
                  items={allTags}
                  selectedPredicate={(t) =>
                    // @ts-ignore
                    form
                      ?.getValues('onlyShowTheseTagIds')
                      ?.split(',')
                      ?.findIndex((tg) => tg === `${t.id}`) > -1
                  }
                  onValueChange={(tag, checked) => {
                    const ids = form.getValues('onlyShowTheseTagIds')?.split(',') ?? [];
                    const idsToSave = (checked
                      ? [...ids, tag.id]
                      : ids.filter((id) => id !== `${tag.id}`)).join(',');

                    form.setValue('onlyShowTheseTagIds', idsToSave);
                    props.onFieldChanged("onlyShowTheseTagIds", idsToSave);
                  }}
                />
              </>)
            }
          ]} />

          <Button className="w-fit col-span-full" type="submit">
            Opslaan
          </Button>
        </form>
      </Form>
    </div>
  );
}