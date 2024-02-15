import * as React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useForm } from 'react-hook-form';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Heading } from '@/components/ui/typography';
import { Separator } from '@/components/ui/separator';
import { useEffect } from 'react';
import router from 'next/router';
import useTags from '@/hooks/use-tags';
import _ from 'lodash';
import { Checkbox } from '@/components/ui/checkbox';

type Tag = {
  id: number;
  name: string;
  type: string;
};

const formSchema = z.object({
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
});

export default function ProjectSettingsResourceLabels() {
  const { project } = router.query;

  const { data, isLoading } = useTags(project as string);
  const [tagGroupNames, setGroupedNames] = React.useState<string[]>([]);

  useEffect(() => {
    if (Array.isArray(data)) {
      const fetchedTags = data as Array<Tag>;
      const groupNames = (_.chain(fetchedTags).map('type').uniq().value());
      const index = groupNames.findIndex((status: string) => status === 'status')
      groupNames.unshift(groupNames.splice(index, 1)[0]);
      setGroupedNames(groupNames);
    }
  }, [data]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver<any>(formSchema),
    defaultValues: {},
  });

  useEffect(() => {
    form.reset();
  }, [form]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values);
  }

  return (
    <div className="container py-6">
      <Form {...form} className="p-6 bg-white rounded-md">
        <Heading size="xl">Resource tags</Heading>
        <Separator className="my-4" />
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="lg:w-fit grid grid-cols-1 lg:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="tagGroups"
            render={() => (
              <FormItem className="col-span-full">
                <div>
                  <FormLabel>Selecteer de gewenste tag per groep. Status is verplicht.</FormLabel>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-1 lg:grid-cols-3 gap-x-4 gap-y-2">
                  {(tagGroupNames || []).map((groupName, index) => (
                    <>
                      <p>{groupName}</p>
                      {data?.map((item: any) => (
                        item?.type === 'status' && item?.type === groupName ? (
                            <FormItem
                              key={item.id}
                              className="flex flex-row items-start space-x-3 space-y-0">
                              <Checkbox/>
                              <FormLabel className="font-normal">
                                {item.name}
                              </FormLabel>
                            </FormItem>
                          ) : null || 
                          item?.type !== 'status' && item?.type === groupName ? (
                          <FormItem
                            key={item.id}
                            className="flex flex-row items-start space-x-3 space-y-0">
                            <Checkbox/>
                            <FormLabel className="font-normal">
                              {item.name}
                            </FormLabel>
                          </FormItem>
                        ) : null
                      ))}
                    </>
                  ))}
                </div>
              </FormItem>
            )}
          />
          <Button type="submit" className="w-fit col-span-full">
            Opslaan
          </Button>
        </form>
      </Form>
    </div>
  );
}
