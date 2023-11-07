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

const formSchema = z.object({
  themes: z.string(),
  areas: z.string(),
});

export default function ProjectSettingsThemes() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver<any>(formSchema),
    defaultValues: {},
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values);
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
            url: '/projects/1/settings',
          },
          {
            name: "Thema's en gebieden",
            url: '/projects/1/settings/themes',
          },
        ]}>
        <div className='p-6 bg-white rounded-md container m-6'>
          <Form {...form}>
            <Heading size="xl">
              Thema's en gebieden
            </Heading>
            <Separator className="my-4" />
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 lg:w-1/2">
              <FormField
                control={form.control}
                name="themes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Thema's (Onderscheiden door kommas)</FormLabel>
                    <FormControl>
                      <Input placeholder="" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="areas"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Gebieden (Onderscheiden door kommas)</FormLabel>
                    <FormControl>
                      <Input placeholder="" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit">
                  Opslaan
              </Button>
            </form>
          </Form>
        </div>
      </PageLayout>
    </div>
  );
}
