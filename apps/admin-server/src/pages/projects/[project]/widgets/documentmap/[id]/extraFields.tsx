import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl, FormDescription,
  FormField,
  FormItem,
  FormLabel,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';

import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { Heading } from '@/components/ui/typography';
import useTags from '@/hooks/use-tags';
import { EditFieldProps } from '@/lib/form-widget-helpers/EditFieldProps';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { useEffect, useState } from 'react';
import _ from 'lodash';
import { handleTagCheckboxGroupChange } from '@/lib/form-widget-helpers/TagGroupHelper';
import { useFieldDebounce } from '@/hooks/useFieldDebounce';
import { DocumentMapProps } from '@openstad-headless/document-map/src/document-map';
import { CheckboxList } from '@/components/checkbox-list';

const formSchema = z.object({
  extraFieldsTagGroups: z
      .array(
          z.object({
            type: z.string(),
            label: z.string().optional(),
            multiple: z.boolean().default(false),
          })
      )
      .refine((value) => value.some((item) => item), {
        message: 'You have to select at least one item.',
      }),
  defaultTags: z.string().optional()
});

type Tag = {
  id: number;
  name: string;
  type: string;
};

export default function DocumentExtraFields(
  props: DocumentMapProps &
    EditFieldProps<DocumentMapProps>,
) {
  type FormData = z.infer<typeof formSchema>;
  const { data: tags } = useTags(props.projectId);
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
      extraFieldsTagGroups: props.extraFieldsTagGroups || [],
      defaultTags: props?.defaultTags || '',
    },
  });

  return (
      <div className="p-6 bg-white rounded-md">
        <Form {...form}>
          <Heading size="xl">Extra Velden</Heading>
          <Separator className="my-4" />
          <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="lg:w-full grid grid-cols-1 gap-4">

            <FormField
                control={form.control}
                name="extraFieldsTagGroups"
                render={() => (
                    <FormItem className="col-span-full">
                      <div>
                        <FormLabel>Selecteer de gewenste tag groepen</FormLabel>
                        <FormDescription>
                          Selecteer de gewenste tag groepen die als extra velden verschijnen.<br />
                          Het label veld fungeert als een titel boven de dropdown van het extra veld.
                        </FormDescription>
                      </div>
                      <div className="grid grid-cols-1 lg:grid-cols-1 lg:grid-cols-3 gap-x-4 gap-y-4">
                        {(tagGroupNames || []).map((groupName, index) => (
                            <>
                              <FormField
                                  key={`parent${groupName}`}
                                  control={form.control}
                                  name="extraFieldsTagGroups"
                                  render={({ field }) => {
                                    return (
                                        <FormItem
                                            key={groupName}
                                            className="flex flex-row items-center space-x-3 space-y-0">
                                          <FormControl>
                                            <Checkbox
                                                checked={
                                                    field.value?.findIndex(
                                                        (el) => el.type === groupName
                                                    ) > -1
                                                }
                                                onCheckedChange={(checked: any) => {
                                                  const updatedFields =
                                                      handleTagCheckboxGroupChange(
                                                          groupName,
                                                          checked,
                                                          field.value,
                                                          'type'
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
                                  name="extraFieldsTagGroups"
                                  render={({ field }) => {

                                    const defaultValue = field.value.find(
                                        (g) => g.type === groupName
                                    )?.label;

                                    return (
                                        <FormItem
                                            key={`${groupName}-label-input`}
                                            className="flex flex-row items-center space-x-3 space-y-0">
                                          <FormControl>
                                            <Input
                                                placeholder="Groep label"
                                                key={`${groupName}-label-input-field`}
                                                defaultValue={defaultValue}
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
                                  name="extraFieldsTagGroups"
                                  render={({ field }) => {
                                    return (
                                        <FormItem
                                            key={groupName}
                                            className="flex flex-row items-center space-x-3 space-y-0">
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
                                            Mogen er meerdere tags geselecteerd worden?
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

            <Separator className="my-4" />

            <FormField
                control={form.control}
                name="defaultTags"
                render={() => (
                    <FormItem className="col-span-full">
                      <FormLabel>Selecteer de standaard tags</FormLabel>
                      <FormDescription>
                        Selecteer de standaard tags die aan reacties worden toegevoegd zonder dat de gebruiker dit ziet.
                      </FormDescription>
                        <CheckboxList
                            form={form}
                            fieldName="defaultTags"
                            fieldLabel="Select default tags"
                            label={(t: Tag) => t.name}
                            keyForGrouping="type"
                            keyPerItem={(t: Tag) => `${t.id}`}
                            items={tags || []}
                            layout="vertical"
                            selectedPredicate={(t) =>
                                // @ts-ignore
                                form
                                    ?.getValues('defaultTags')
                                    ?.split(',')
                                    ?.findIndex((tg) => tg === `${t.id}`) > -1
                            }
                            onValueChange={(tag, checked) => {
                                const ids = form.getValues('defaultTags')?.split(',') ?? [];
                                const idsToSave = (checked
                                    ? [...ids, tag.id]
                                    : ids.filter((id) => id !== `${tag.id}`)).join(',');

                                form.setValue('defaultTags', idsToSave);
                                props.onFieldChanged("defaultTags", idsToSave);
                            }}
                        />
                    </FormItem>
                )}
            />

            <Button className="w-fit col-span-full" type="submit">
              Opslaan
            </Button>
          </form>
        </Form>
      </div>
  );
}