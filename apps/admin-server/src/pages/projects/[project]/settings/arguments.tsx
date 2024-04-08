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
import { PageLayout } from '@/components/ui/page-layout';
import { Heading } from '@/components/ui/typography';
import { Separator } from '@/components/ui/separator';
import { useCallback, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useProject } from '../../../../hooks/use-project';
import toast from 'react-hot-toast';
import * as Switch from '@radix-ui/react-switch';
import { Checkbox } from '@/components/ui/checkbox';

const formSchema = z.object({
  enableReactions: z.boolean(),
  reactionSettings: z.string().array(),
});

const reactions = [
  {
    id: 'showReactions',
    label: 'Laat de reacties voor en tegen zien.',
  },
  {
    id: 'showReactionsWithoutSentiment',
    label: 'Laat de reacties zonder sentiment zien.',
  },
  {
    id: 'allowReactions',
    label: 'Laat gebruikers reageren op reacties van anderen.',
  },
  {
    id: 'likeReactions',
    label: 'Laat gebruikers de reacties van andere gebruikers liken.',
  },
];

export default function ProjectSettingsArguments() {
  const category = 'resources';
  const router = useRouter();
  const { project } = router.query;

  const { data, isLoading, updateProject } = useProject();  


  const defaults = useCallback(
    () => ({
      enableReactions: data?.config?.resources?.enableReactions || false,
      reactionSettings: data?.config?.[category]?.reactionSettings || [],
    }),
    [data]
  );

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver<any>(formSchema),
    defaultValues: defaults(),
  });

  useEffect(() => {
    form.reset(defaults());
  }, [form, defaults]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      const project = await updateProject({
          [category]: {
            enableReactions: values.enableReactions,
            ...data.config[category],
            reactionSettings: values.reactionSettings,
          },
        },
      );
      if (project) {
        toast.success('Project aangepast!');
      } else {
        toast.error('Er is helaas iets mis gegaan.')
      }
    } catch (error) {
      console.error('could not update', error);
    }
  }

  // async function onSubmit(values: z.infer<typeof formSchema>) {
  //   try {
  //     const project = await updateProject({
  //       [category]: {
  //         canAddNewResources: values.canAddNewResources,
  //         minimumYesVotes: values.minimumYesVotes,
  //         titleMinLength: values.titleMinLength,
  //         titleMaxLength: values.titleMaxLength,
  //         summaryMinLength: values.summaryMinLength,
  //         summaryMaxLength: values.summaryMaxLength,
  //         descriptionMinLength: values.descriptionMinLength,
  //         descriptionMaxLength: values.descriptionMaxLength,
  //         displayLocation: values.displayLocation,
  //         displayTheme: values.displayTheme,
  //         displayNeighbourhood: values.displayNeighbourhood,
  //         displayModbreak: values.displayModbreak,
  //         reactionSettings: values.reactionSettings,
  //         tags: values.tagGroups || [],
  //       },
  //     });
  //     if (project) {
  //       toast.success('Project aangepast!');
  //     } else {
  //       toast.error('Er is helaas iets mis gegaan.');
  //     }
  //   } catch (error) {
  //     console.error('could not update', error);
  //   }
  // }

  return (
    <div>
      <PageLayout
        pageHeader="Projecten"
        breadcrumbs={[
          {
            name: 'Projecten',
            url: '/projects',
          },
          {
            name: 'Instellingen',
            url: `'/projects/${project}/settings'`,
          },
          {
            name: 'Argumenten',
            url: `/projects/${project}/settings/arguments`,
          },
        ]}>
        <div className="container py-6">
          <Form {...form} className="p-6 bg-white rounded-md">
            <Heading size="xl">Argumenten</Heading>
            <Separator className="my-4" />
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="lg:w-fit grid grid-cols-1 lg:grid-cols-1 gap-x-4 gap-y-8">
              <FormField
                control={form.control}
                name="enableReactions"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Is het mogelijk om reacties te plaatsen?
                    </FormLabel>
                    <Switch.Root
                      className="block w-[50px] h-[25px] bg-stone-300 rounded-full relative focus:shadow-[0_0_0_2px] focus:shadow-black data-[state=checked]:bg-primary outline-none cursor-default"
                      onCheckedChange={(e: boolean) => {
                        field.onChange(e);
                      }}>
                      <Switch.Thumb className="block w-[21px] h-[21px] bg-white rounded-full transition-transform duration-100 translate-x-0.5 will-change-transform data-[state=checked]:translate-x-[27px]" />
                    </Switch.Root>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="reactionSettings"
                render={() => (
                  <FormItem>
                    <div>
                      <FormLabel>
                        Selecteer uw gewenste reactie instellingen
                      </FormLabel>
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-y-2 gap-x-4">
                      {reactions.map((item) => (
                        <FormField
                          key={item.id}
                          control={form.control}
                          name="reactionSettings"
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
                                            (value) => value !== item.id
                                          )
                                        );
                                    }}
                                  />
                                </FormControl>
                                <FormLabel className="font-normal">
                                  {item.label}
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
              <Button type="submit" className="w-fit col-span-full">
                Opslaan
              </Button>
            </form>
          </Form>
        </div>
      </PageLayout>
    </div>
  );
}
