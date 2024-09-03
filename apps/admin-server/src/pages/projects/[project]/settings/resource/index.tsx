import * as React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useForm } from 'react-hook-form';

import { PageLayout } from '@/components/ui/page-layout';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Heading } from '@/components/ui/typography';
import { Separator } from '@/components/ui/separator';
import { useProject } from '../../../../../hooks/use-project';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import toast from 'react-hot-toast';
import { useRouter } from 'next/router';
import useTags from '@/hooks/use-tags';
import useStatuses from '@/hooks/use-statuses';
import _ from 'lodash';
import { YesNoSelect } from '@/lib/form-widget-helpers';
import { CheckboxList } from '@/components/checkbox-list';

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

type Tag = {
  id: number;
  name: string;
  type: string;
};

type Status = {
  id: number;
  name: string;
};

const formSchema = z.object({
  canAddNewResources: z.boolean(),
  minimumYesVotes: z.coerce.number(),
  titleMinLength: z.coerce.number(),
  titleMaxLength: z.coerce.number(),
  summaryMinLength: z.coerce.number(),
  summaryMaxLength: z.coerce.number(),
  descriptionMinLength: z.coerce.number(),
  descriptionMaxLength: z.coerce.number(),
  displayLocation: z.boolean(),
  displayTheme: z.boolean(),
  displayNeighbourhood: z.boolean(),
  displayModbreak: z.boolean(),
  modbreakTitle: z.string().optional(),
  tagGroups: z.number().array().optional().default([]),
  statusGroups: z.number().array().optional().default([]),
});

export default function ProjectSettingsResource() {
  const router = useRouter();
  const { project } = router.query;
  const category = 'resources';

  const { data, isLoading, updateProject } = useProject();
  const { data: tagData } = useTags(project as string);
  const tags = (tagData || []) as Tag[];

  const { data: statusData } = useStatuses(project as string);
  const statuses = (statusData || []) as Status[];

  const defaults = React.useCallback(
    () => ({
      canAddNewResources: data?.config?.[category]?.canAddNewResources || false,
      minimumYesVotes: data?.config?.[category]?.minimumYesVotes || null,
      titleMinLength: data?.config?.[category]?.titleMinLength || null,
      titleMaxLength: data?.config?.[category]?.titleMaxLength || null,
      summaryMinLength: data?.config?.[category]?.summaryMinLength || null,
      summaryMaxLength: data?.config?.[category]?.summaryMaxLength || null,
      descriptionMinLength:
        data?.config?.[category]?.descriptionMinLength || null,
      descriptionMaxLength:
        data?.config?.[category]?.descriptionMaxLength || null,
      displayLocation: data?.config?.[category]?.displayLocation || false,
      displayTheme: data?.config?.[category]?.displayTheme || false,
      displayNeighbourhood:
        data?.config?.[category]?.displayNeighbourhood || false,
      displayModbreak: data?.config?.[category]?.displayModbreak || false,
      modbreakTitle: data?.config?.[category]?.modbreakTitle || null,
      tagGroups: data?.config?.resources?.defaultTagIds || [],
      statusGroups: data?.config?.resources?.defaultStatusIds || [],
    }),
    [data?.config]
  );

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver<any>(formSchema),
    defaultValues: defaults(),
  });

  React.useEffect(() => {
    form.reset(defaults());
  }, [form, defaults]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      const project = await updateProject({
        [category]: {
          canAddNewResources: values.canAddNewResources,
          minimumYesVotes: values.minimumYesVotes,
          titleMinLength: values.titleMinLength,
          titleMaxLength: values.titleMaxLength,
          summaryMinLength: values.summaryMinLength,
          summaryMaxLength: values.summaryMaxLength,
          descriptionMinLength: values.descriptionMinLength,
          descriptionMaxLength: values.descriptionMaxLength,
          displayLocation: values.displayLocation,
          displayTheme: values.displayTheme,
          displayNeighbourhood: values.displayNeighbourhood,
          displayModbreak: values.displayModbreak,
          modbreakTitle: values.modbreakTitle,
          defaultTagIds: values.tagGroups || [],
          defaultStatusIds: values.statusGroups || [],
        },
      });
      if (project) {
        toast.success('Project aangepast!');
      } else {
        toast.error('Er is helaas iets mis gegaan.');
      }
    } catch (error) {
      console.error('could not update', error);
    }
  }

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
            url: `/projects/${project}/settings`,
          },
          {
            name: 'Inzending',
            url: `/projects/${project}/settings/resource`,
          },
        ]}>
        <div className="container py-6">
          <Form {...form} className="p-6 bg-white rounded-md">
            <Heading size="xl">Inzendingsinstellingen</Heading>
            <Separator className="my-4" />
            <p className="text-gray-500">
            Met resources bedoelen we het type inzending(en) voor dit project. <br /> Denk aan ideeën, plannen, tips of knelpunten. Dit is afhankelijk van wat je wilt uitvragen voor dit project. 
            </p>
            <br/>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="lg:w-fit grid grid-cols-1 lg:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="canAddNewResources"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Is inzenden mogelijk?
                    </FormLabel>
                    {YesNoSelect(field, {})}
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="minimumYesVotes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Minimum benodigde stemmen voor een resource?
                    </FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="100" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="titleMinLength"
                render={({ field }) => (
                  <FormItem className="col-span-1">
                    <FormLabel>Minimum lengte van de titel</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="10" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="titleMaxLength"
                render={({ field }) => (
                  <FormItem className="col-span-1">
                    <FormLabel>Maximum lengte van de titel</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="50" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="summaryMinLength"
                render={({ field }) => (
                  <FormItem className="col-span-1">
                    <FormLabel>Minimum lengte van de samenvatting</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="20" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="summaryMaxLength"
                render={({ field }) => (
                  <FormItem className="col-span-1">
                    <FormLabel>Maximum lengte van de samenvatting</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="140" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="descriptionMinLength"
                render={({ field }) => (
                  <FormItem className="col-span-1">
                    <FormLabel>Minimum lengte van de beschrijving</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="140" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="descriptionMaxLength"
                render={({ field }) => (
                  <FormItem className="col-span-1">
                    <FormLabel>Maximum lengte van de beschrijving</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="5000" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {/* <FormField
                control={form.control}
                name="displayModbreak"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Wordt het invoerveld voor de auteur van de modbreak
                      weergegeven in het resource-formulier?
                    </FormLabel>
                    {YesNoSelect(field, {})}
                    <FormMessage />
                  </FormItem>
                )}
              /> */}

<FormField
                control={form.control}
                name="modbreakTitle"
                render={({ field }) => (
                  <FormItem className="col-span-1">
                    <FormLabel>
                      Titel voor boven modbreak 
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Tekst die boven de modbreak wordt getoond"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <CheckboxList
                form={form}
                fieldName="tagGroups"
                fieldLabel="Selecteer de tags die standaard op resource gezet zullen worden"
                label={(t) => t.name}
                keyForGrouping="type"
                keyPerItem={(t) => `${t.id}`}
                items={tags}
                selectedPredicate={(t) =>
                  form.getValues('tagGroups').findIndex((tg) => tg === t.id) >
                  -1
                }
                onValueChange={(tag, checked) => {
                  const values = form.getValues('tagGroups');

                  form.setValue(
                    'tagGroups',
                    checked
                      ? [...values, tag.id]
                      : values.filter((id) => id !== tag.id)
                  );
                }}
              />

              <CheckboxList
                form={form}
                fieldName="statusGroups"
                fieldLabel="Selecteer de statussen die standaard op de inzending gezet worden."
                label={(t) => t.name}
                keyPerItem={(t) => `${t.id}`}
                items={statuses}
                layout="vertical"
                selectedPredicate={(t) =>
                  form.getValues('statusGroups').findIndex((tg) => tg === t.id) >
                  -1
                }
                onValueChange={(status, checked) => {
                  const values = form.getValues('statusGroups');

                  form.setValue(
                    'statusGroups',
                    checked
                      ? [...values, status.id]
                      : values.filter((id) => id !== status.id)
                  );
                }}
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
