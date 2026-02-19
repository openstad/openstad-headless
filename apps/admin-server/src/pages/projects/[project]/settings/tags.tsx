import { CheckboxList } from '@/components/checkbox-list';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { PageLayout } from '@/components/ui/page-layout';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Spacer } from '@/components/ui/spacer';
import { Heading } from '@/components/ui/typography';
import { useProject } from '@/hooks/use-project';
import useStatuses from '@/hooks/use-statuses';
import useTags from '@/hooks/use-tags';
import { useFieldDebounce } from '@/hooks/useFieldDebounce';
import { EditFieldProps } from '@/lib/form-widget-helpers/EditFieldProps';
import { zodResolver } from '@hookform/resolvers/zod';
import { MultiProjectResourceOverviewProps } from '@openstad-headless/multi-project-resource-overview/src/multi-project-resource-overview';
import { useRouter } from 'next/router';
import React, { useCallback, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import * as z from 'zod';

const formSchema = z.object({
  tags: z.string().optional(),
});

export default function ProjectSettingsTags() {
  const router = useRouter();
  const { project } = router.query;
  const { data, updateProject } = useProject();

  const defaults = useCallback(() => {
    return {
      tags: data?.config?.project?.tags || '',
    };
  }, [data]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver<any>(formSchema),
    defaultValues: defaults(),
  });

  useEffect(() => {
    form.reset(defaults());
  }, [form, defaults]);

  const { data: loadedTags } = useTags(project as string);
  const tags = (loadedTags || []) as Array<{
    id: string;
    name: string;
    type?: string;
  }>;

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      const project = await updateProject({
        project: {
          tags: values.tags,
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
            name: 'Tags',
            url: `/projects/${project}/settings/tags`,
          },
        ]}>
        <div className="container py-6">
          <Form {...form} className="p-6 bg-white rounded-md">
            <Heading size="xl">Tags voor het project</Heading>
            <Separator className="my-4" />

            <p className="text-gray-900">
              Selecteer de tags die je wilt koppelen aan dit project. Deze tags
              worden gebruikt om projecten te filteren in de widget{' '}
              <strong>Multi project inzending overzicht</strong>.
              <br />
              <strong>Let op:</strong> Tags die je hier selecteert worden alleen
              gebruikt in de widget{' '}
              <strong>Multi project inzending overzicht</strong>. Ze worden niet
              gebruikt in andere widgets of functionaliteiten.
            </p>

            <Spacer />

            <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
              <CheckboxList
                form={form}
                fieldName="tags"
                fieldLabel=""
                label={(t) => t.name}
                keyForGrouping="type"
                keyPerItem={(t) => `${t.id}`}
                items={tags}
                selectedPredicate={(t) =>
                  // @ts-ignore
                  form
                    ?.getValues('tags')
                    ?.split(',')
                    ?.findIndex((tg) => tg === `${t.id}`) > -1
                }
                onValueChange={(tag, checked) => {
                  const ids = form.getValues('tags')?.split(',') ?? [];
                  const idsToSave = (
                    checked
                      ? [...ids, tag.id]
                      : ids.filter((id) => id !== `${tag.id}`)
                  ).join(',');

                  form.setValue('tags', idsToSave);
                }}
              />

              <Button className="w-fit col-span-full" type="submit">
                Opslaan
              </Button>
            </form>
          </Form>
        </div>
      </PageLayout>
    </div>
  );
}
