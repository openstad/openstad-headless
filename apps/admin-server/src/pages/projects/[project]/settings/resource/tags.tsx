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
import { useRouter } from 'next/router';
import useTags from '@/hooks/use-tags';
import _ from 'lodash';
import { Checkbox } from '@/components/ui/checkbox';
import toast from 'react-hot-toast';
import { useProject } from '@/hooks/use-project';

type Tag = {
  id: number;
  name: string;
  type: string;
};

const formSchema = z.object({
  tagGroups: z.any(),
});

export default function ProjectSettingsResourceLabels() {
  const router = useRouter();
  const { project } = router.query;
  const category = 'resources'; 

  const { data: projectData, updateProject } = useProject();
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

  const defaults = React.useCallback(
    () => ({
      tagGroups: projectData?.config?.resource
        ?.tags || [],
    }),
    [data?.config]
  );

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver<any>(formSchema),
    defaultValues: defaults(),
  });

  useEffect(() => {
    form.reset();
  }, [form]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      const project = await updateProject({
        [category]: {
          tags: values.tagGroups,
        },
      });
      if (project) {
        toast.success('Project aangepast!');
      } else {
        toast.error('Er is helaas iets mis gegaan.')
      }
    } catch (error) {
      console.error('could not update', error);
    }
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
                          <FormField
                          key={item.id}
                          control={form.control}
                          name="tagGroups"
                          render={({ field }) => {
                            return (
                              <FormItem
                                key={item.id}
                                className="flex flex-row items-start space-x-3 space-y-0">
                                <FormControl>
                                  <Checkbox
                                    checked={field.value?.includes(item.id)}
                                    onCheckedChange={(checked: any) => {
                                      return checked
                                        ? field.onChange([
                                            ...field.value,
                                            item.id,
                                          ])
                                        : field.onChange(
                                            field.value?.filter(
                                              (value: any) => value !== item.id
                                            )
                                          );
                                    }}
                                  />
                                </FormControl>
                                <FormLabel className="font-normal">
                                  {item.name}
                                </FormLabel>
                              </FormItem>
                            );
                          }}
                        />
                          ) : null || 
                          item?.type !== 'status' && item?.type === groupName ? (
                            <FormField
                            key={item.id}
                            control={form.control}
                            name="tagGroups"
                            render={({ field }) => {
                              return (
                                <FormItem
                                  key={item.id}
                                  className="flex flex-row items-start space-x-3 space-y-0">
                                  <FormControl>
                                    <Checkbox
                                      checked={field.value?.includes(item.id)}
                                      onCheckedChange={(checked: any) => {
                                        return checked
                                          ? field.onChange([
                                              ...field.value,
                                              item.id,
                                            ])
                                          : field.onChange(
                                              field.value?.filter(
                                                (value: any) => value !== item.id
                                              )
                                            );
                                      }}
                                    />
                                  </FormControl>
                                  <FormLabel className="font-normal">
                                    {item.name}
                                  </FormLabel>
                                </FormItem>
                              );
                            }}
                          />
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
