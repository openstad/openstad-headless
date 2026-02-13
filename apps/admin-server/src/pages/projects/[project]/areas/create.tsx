import { CheckboxList } from '@/components/checkbox-list';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
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
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Heading } from '@/components/ui/typography';
import useArea from '@/hooks/use-areas';
import useTags from '@/hooks/use-tags';
import { zodResolver } from '@hookform/resolvers/zod';
import { Spacer } from '@openstad-headless/ui/src';
import { useRouter } from 'next/router';
import React from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import * as z from 'zod';

const formSchema = z.object({
  name: z.string(),
  geoJSON: z.string(),
  hidePolygon: z.boolean().optional(),
  tagIds: z.array(z.number()).optional(),
  tagIdsOutside: z.array(z.number()).optional(),
});

export default function ProjectAreaCreate() {
  const router = useRouter();
  const { project, id } = router.query;
  const { createArea } = useArea();
  const { data: loadedTags } = useTags(project as string);
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
      tagIdsOutside: [],
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const area = await createArea(
      values.name,
      values.geoJSON,
      values.hidePolygon ?? false,
      values.tagIds || [],
      values.tagIdsOutside || []
    );
    if (area) {
      toast.success('Polygoon aangemaakt!');
      router.push(`/projects/${project}/areas`);
    } else {
      toast.error(
        'De polygoon die is meegegeven lijkt niet helemaal te kloppen.'
      );
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
            url: `/projects/${project}/areas`,
          },
          {
            name: 'Polygon toevoegen',
            url: `/projects/${project}/areas/create`,
          },
        ]}>
        <div className="container py-6">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="grid grid-cols-1 gap-4">
              <Tabs defaultValue="general">
                <TabsList className="w-full bg-white border-b-0 mb-4 rounded-md h-fit flex flex-wrap overflow-auto">
                  <TabsTrigger value="general">Algemeen</TabsTrigger>
                  <TabsTrigger value="tags">Tags</TabsTrigger>
                </TabsList>
                <TabsContent value="general" className="p-0">
                  <div className="p-6 bg-white rounded-md">
                    <Heading size="xl">Algemeen</Heading>
                    <Separator className="my-4" />
                    <div className="grid flex-col w-full lg:w-full grid-cols-1 lg:grid-cols-2 gap-x-4 gap-y-8">
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
                          <FormItem className="lg:col-span-2">
                            <FormLabel>Polygoon</FormLabel>
                            <FormDescription>
                              Maak een polygoon aan en kopieer de GeoJSON (bijv.
                              via geojson.io). Plak de GeoJSON hieronder.
                            </FormDescription>
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
                          <FormItem className="lg:col-span-2">
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
                                  Kies dit als je de polygoon niet zichtbaar
                                  wilt tonen op de kaart. De polygoon is voor
                                  admins wel zichtbaar in de admin.
                                </FormDescription>
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                </TabsContent>
                <TabsContent value="tags" className="p-0">
                  <Tabs defaultValue="inside">
                    <TabsList className="w-full bg-white border-b-0 mb-4 rounded-md h-fit flex flex-wrap overflow-auto">
                      <TabsTrigger value="inside">Binnen polygoon</TabsTrigger>
                      <TabsTrigger value="outside">Buiten polygoon</TabsTrigger>
                    </TabsList>
                    <div className="p-6 bg-white rounded-md">
                      <Heading size="xl">Tags</Heading>
                      <Separator className="my-4" />
                      <TabsContent value="inside" className="p-0">
                        <FormField
                          control={form.control}
                          name="tagIds"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>
                                Tags bij klikken binnen de polygoon
                              </FormLabel>
                              <FormDescription>
                                Kies één of meerdere tags die automatisch worden
                                toegevoegd wanneer iemand binnen de polygoon
                                klikt. Mag leeg blijven.
                              </FormDescription>
                              <div className="p-3">
                                <CheckboxList
                                  form={form}
                                  fieldName="tagIds"
                                  fieldLabel="Tags binnen polygoon"
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

                                    const idsToSave = checked
                                      ? [...ids, tag.id]
                                      : ids.filter((id) => id !== tag.id);

                                    form.setValue('tagIds', idsToSave);
                                  }}
                                />
                              </div>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </TabsContent>
                      <TabsContent value="outside" className="p-0">
                        <FormField
                          control={form.control}
                          name="tagIdsOutside"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>
                                Tags bij klikken buiten de polygoon
                              </FormLabel>
                              <FormDescription>
                                Kies tags die worden toegevoegd wanneer er
                                buiten de polygoon wordt geklikt. Mag leeg
                                blijven.
                              </FormDescription>
                              <div className="p-3">
                                <CheckboxList
                                  form={form}
                                  fieldName="tagIdsOutside"
                                  fieldLabel="Tags buiten polygoon"
                                  label={(t) => t.name}
                                  keyForGrouping="type"
                                  keyPerItem={(t) => `${t.id}`}
                                  items={tags}
                                  selectedPredicate={(t) =>
                                    // @ts-ignore
                                    form
                                      ?.getValues('tagIdsOutside')
                                      ?.findIndex((tg) => tg === t.id) > -1
                                  }
                                  onValueChange={(tag, checked) => {
                                    const ids =
                                      form.getValues('tagIdsOutside') ?? [];

                                    const idsToSave = checked
                                      ? [...ids, tag.id]
                                      : ids.filter((id) => id !== tag.id);

                                    form.setValue('tagIdsOutside', idsToSave);
                                  }}
                                />
                              </div>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </TabsContent>
                    </div>
                  </Tabs>
                </TabsContent>
              </Tabs>
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
