import React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useForm } from 'react-hook-form';

import { CheckboxList } from '@/components/checkbox-list';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormDescription,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { PageLayout } from '@/components/ui/page-layout';
import { Heading } from '@/components/ui/typography';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';
import { useRouter } from 'next/router';
import useArea from '@/hooks/use-areas';
import useTags from '@/hooks/use-tags';
import toast from 'react-hot-toast';
import { Spacer } from '@openstad-headless/ui/src';

const formSchema = z.object({
  name: z.string(),
  geoJSON: z.string(),
  hidePolygon: z.boolean().optional(),
  tagIds: z.array(z.number()).optional(),
});

export default function ProjectAreaCreate() {
  const router = useRouter();
  const { projectId } = router.query;
  const { createArea } = useArea();
  const { data: loadedTags } = useTags(projectId as string);
  const tags = (loadedTags || []) as Array<{
    id: number;
    name: string;
    type?: string;
  }>;

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver<any>(formSchema),
    defaultValues: {
      hidePolygon: false,
      tagIds: [],
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const area = await createArea(
      values.name,
      values.geoJSON,
      values.hidePolygon ?? false,
      values.tagIds || []
    );
    if (area) {
      toast.success('Polygoon aangemaakt!');
      router.push(`/projects/${projectId}/areas`);
    } else {
      toast.error('De polygoon die is meegegeven lijkt niet helemaal te kloppen.')
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
            name: 'Polygonen',
            url: `/projects/${projectId}/areas`,
          },
          {
            name: 'Polygon toevoegen',
            url: `/projects/${projectId}/areas/create`,
          },
        ]}>
        <div className="p-6 bg-white rounded-md">
          <Form {...form}>
            <Heading size="xl">Toevoegen</Heading>
            <Separator className="my-4" />
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="lg:w-1/2 grid grid-cols-1 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Naam</FormLabel>
                    <FormControl>
                      <Input placeholder="" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="geoJSON"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Polygoon</FormLabel>
                    <p>
                      Je kan hier een polygoon aanmaken om een gebied op te
                      geven waar je kaarten op zullen focussen. Voor deze
                      polygoon kan je de waarden ophalen vanaf de volgende
                      pagina: <a href="https://geojson.io" target="_blank" style={{textDecoration: "underline"}}>https://geojson.io</a>
                    </p>
                    <FormControl>
                      <Textarea placeholder="" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="hidePolygon"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Verberg polygoon</FormLabel>
                    <FormControl>
                      <div className="flex items-center gap-3">
                        <Checkbox
                          checked={field.value ?? false}
                          onCheckedChange={(checked) => {
                            field.onChange(Boolean(checked));
                          }}
                        />
                        <FormDescription>
                          Kies dit als je de polygoon niet zichtbaar wilt tonen op de kaart. De polygoon is voor admins wel zichtbaar in de admin.
                        </FormDescription>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Spacer size={1} />
              <FormField
                control={form.control}
                name="tagIds"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tags koppelen</FormLabel>
                    <CheckboxList
                      form={form}
                      fieldName="tagIds"
                      fieldLabel="Tags gekoppeld aan deze polygoon"
                      label={(t) => t.name}
                      keyForGrouping="type"
                      keyPerItem={(t) => `${t.id}`}
                      items={tags}
                      selectedPredicate={(t) =>
                        // @ts-ignore
                        form
                          ?.getValues('tagIds')
                          ?.findIndex((tg) => tg === t.id) > -1
                      }
                      onValueChange={(tag, checked) => {
                        const ids = form.getValues('tagIds') ?? [];

                        const idsToSave = (checked
                          ? [...ids, tag.id]
                          : ids.filter((id) => id !== tag.id));

                        form.setValue('tagIds', idsToSave);
                      }}
                    />
                    <FormMessage />
                  </FormItem>
                )}
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
