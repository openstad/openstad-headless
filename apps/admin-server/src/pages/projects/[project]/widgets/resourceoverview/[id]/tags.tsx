import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';

import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { Heading } from '@/components/ui/typography';
import useTags from '@/hooks/use-tags';
import { YesNoSelect } from '@/lib/form-widget-helpers';
import { EditFieldProps } from '@/lib/form-widget-helpers/EditFieldProps';
import { zodResolver } from '@hookform/resolvers/zod';
import { ResourceOverviewWidgetProps } from '@openstad/resource-overview/src/resource-overview';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { useEffect, useState } from 'react';
import _ from 'lodash';

const formSchema = z.object({
  displayTagFilters: z.boolean(),
  tagGroups: z.array(z.string()).refine((value) => value.some((item) => item), {
    message: 'You have to select at least one item.',
  }),
  displayTagGroupName: z.boolean(),
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
          className="lg:w-1/3 grid grid-cols-1 gap-4">
          <FormField
            control={form.control}
            name="displayTagFilters"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Wordt het filteren op tags weergegeven?</FormLabel>
                {YesNoSelect(field, props)}
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="displayTagGroupName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Moeten de tag groepen apart getoond worden?
                </FormLabel>
                {YesNoSelect(field, props)}
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
                <div className="grid grid-cols-1 lg:grid-cols-1 lg:grid-cols-2 gap-x-4 gap-y-2">
                  {(tagGroupNames || []).map((groupName) => (
                    <FormField
                      key={groupName}
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
                                    (el) => el === groupName
                                  ) > -1
                                }
                                onCheckedChange={(checked: any) => {
                                  return checked
                                    ? field.onChange([
                                        ...field.value,
                                        groupName,
                                      ])
                                    : field.onChange(
                                        field.value?.filter(
                                          (val) => val !== groupName
                                        )
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
