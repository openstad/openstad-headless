import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
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
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { useEffect, useState } from 'react';
import _ from 'lodash';
import { StemBegrootWidgetProps } from '@openstad-headless/stem-begroot/src/stem-begroot';
import { handleTagCheckboxGroupChange } from '@/lib/form-widget-helpers/TagGroupHelper';

import * as Switch from '@radix-ui/react-switch';

const formSchema = z.object({
  displayTagFilters: z.boolean(),
  tagGroups: z
    .array(
      z.object({
        type: z.string(),
        label: z.string().optional(),
        multiple: z.boolean(),
      })
    )
    .refine((value) => value.some((item) => item), {
      message: 'You have to select at least one item.',
    }),
  displayTagGroupName: z.boolean(),
});

type Tag = {
  id: number;
  name: string;
  type: string;
};

export default function WidgetStemBegrootOverviewTags(
  props: StemBegrootWidgetProps &
    EditFieldProps<StemBegrootWidgetProps>
) {
  type FormData = z.infer<typeof formSchema>;
  const { data: tags } = useTags(props.projectId);
  const [tagGroupNames, setGroupedNames] = useState<string[]>([]);

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
      tagGroups: props.tagGroups || [],
      displayTagGroupName: props?.displayTagGroupName || false,
    },
  });

  return (
    <div className="p-6 bg-white rounded-md">
      <Form {...form}>
        <Heading size="xl">Tags</Heading>
        <Separator className="my-4" />
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="lg:w-3/3 grid grid-cols-1 gap-4">
          <FormField
            control={form.control}
            name="displayTagFilters"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Filteren op tags weergeven?</FormLabel>
                {YesNoSelect(field, props)}
                <FormMessage />
              </FormItem>
            )}
          />
          <Separator className="my-4" />

          <FormField
            control={form.control}
            name="tagGroups"
            render={() => (
              <FormItem className="col-span-full">
                <div className='mb-2'>
                  <FormLabel>
                    <Heading size="xl">Selecteer de gewenste tag groepen</Heading>
                  </FormLabel>
                  <Separator className="my-4" />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-1 lg:grid-cols-[auto_1fr_1fr] gap-x-8 gap-y-2">
                  {(tagGroupNames || []).map((groupName, index) => (
                    <>
                      <FormField
                        key={`parent${groupName}`}
                        control={form.control}
                        name="tagGroups"
                        render={({ field }) => {
                          return (
                            <FormItem
                              key={groupName}
                              className="flex flex-col items-start">
                              <FormControl>
                                <>
                                  <FormLabel>{groupName}</FormLabel>
                                  <Switch.Root
                                    className="block w-[50px] h-[25px] bg-stone-300 rounded-full relative focus:shadow-[0_0_0_2px] focus:shadow-black data-[state=checked]:bg-primary outline-none cursor-default"
                                    onCheckedChange={(checked: any) => {
                                      const groups = handleTagCheckboxGroupChange(
                                        groupName,
                                        checked,
                                        field.value,
                                        'type'
                                      );
                                      field.onChange(groups);
                                      props.onFieldChanged(field.name, groups);
                                    }}
                                    checked={
                                      field.value?.findIndex(
                                        (el) => el.type === groupName
                                      ) > -1
                                    }>
                                    <Switch.Thumb className="block w-[21px] h-[21px] bg-white rounded-full transition-transform duration-100 translate-x-0.5 will-change-transform data-[state=checked]:translate-x-[27px]" />
                                  </Switch.Root>
                                </>
                              </FormControl>
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
                              className="flex flex-col items-start">
                              <FormControl>
                                <>
                                  <FormLabel>Label van het filter</FormLabel>
                                  <Input
                                    placeholder="Groep label"
                                    key={`${groupName}-label-input-field`}
                                    defaultValue={field.value.at(index)?.label}
                                    disabled={
                                      field.value.find(
                                        (g) => g.type === groupName
                                      ) === undefined
                                    }
                                    onChange={(e) => {
                                      const groups = field.value;
                                      const existingGroup = groups[index];

                                      if (existingGroup) {
                                        existingGroup.label = e.target.value;
                                        groups[index] = existingGroup;
                                        field.onChange(groups);
                                        props.onFieldChanged(field.name, groups);
                                      }
                                    }}
                                  />
                                </>
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
                              className="flex flex-col items-start">
                              <FormControl>
                                <>
                                  <FormLabel>Meerdere tags van deze groep tegelijk filteren</FormLabel>
                                  <Switch.Root
                                    className="block w-[50px] h-[25px] bg-stone-300 rounded-full relative focus:shadow-[0_0_0_2px] focus:shadow-black data-[state=checked]:bg-primary outline-none cursor-default"
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
                                    }>
                                    <Switch.Thumb className="block w-[21px] h-[21px] bg-white rounded-full transition-transform duration-100 translate-x-0.5 will-change-transform data-[state=checked]:translate-x-[27px]" />
                                  </Switch.Root>
                                </>
                              </FormControl>
                            </FormItem>
                          );
                        }}
                      />
                      <Separator className="my-4 col-span-full" />
                    </>

                  ))}
                </div>
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
