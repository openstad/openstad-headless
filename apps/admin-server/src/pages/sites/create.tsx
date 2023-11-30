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
import { Input } from '@/components/ui/input';
import { PageLayout } from '@/components/ui/page-layout';
import { Heading } from '@/components/ui/typography';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import projectListSwr from '@/hooks/use-project-list';

const formSchema = z.object({
  siteName: z.string().min(6, {
    message: 'Het project moet minimaal uit zes karakters bestaan!',
  }),
  projectId: z.string(),
  siteTemplate: z.enum(['Geen template', 'Participatief begroten', 'Plannen insturen', 'Stemsite', 'Kaart - bewoners', 'Kaart - gemeente', 'Keuzewijzer'])
});

export default function CreateSite() {
  const { data, isLoading } = projectListSwr();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver<any>(formSchema),
    defaultValues: {},
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values)
  }

  return (
    <div>
      <PageLayout
        pageHeader="Sites"
        breadcrumbs={[
          {
            name: 'Sites',
            url: '/sites',
          },
        ]}>
        <div className="p-6 bg-white rounded-md">
          <Form {...form}>
            <Heading size="xl">Maak een nieuwe site aan</Heading>
            <Separator className="my-4" />
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="lg:w-3/4 grid grid-cols-1 lg:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="siteName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Site naam</FormLabel>
                    <FormControl>
                      <Input placeholder="Naam" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="projectId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Project gekoppeld aan de site
                    </FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecteer een project." />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {data?.map((project: any) => (
                          <SelectItem key={project.id} value={project.id}>
                            {project.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="siteTemplate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Gewenste template voor de site
                    </FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Geen template" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Geen template">Geen template</SelectItem>
                        <SelectItem value="Participatief begroten">Participatie begroten</SelectItem>
                        <SelectItem value="Plannen insturen">Plannen insturen</SelectItem>
                        <SelectItem value="Stemsite">Stemsite</SelectItem>
                        <SelectItem value="Kaart - bewoners">Kaart - bewoners</SelectItem>
                        <SelectItem value="Kaart - gemeente">Kaart - gemeente</SelectItem>
                        <SelectItem value="Keuzewijzer">Keuzewijzer</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />
              <Button
                variant="default"
                type="submit"
                className="w-fit col-span-full">
                Site aanmaken
              </Button>
            </form>
          </Form>
        </div>
      </PageLayout>
    </div>
  );
}
