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
import { useRouter } from 'next/router';
import useTag from '@/hooks/use-tag';
import { useCallback, useEffect } from 'react';
import toast from 'react-hot-toast';

const formSchema = z.object({
  name: z.string(),
  type: z.string(),
  seqnr: z.coerce.number(),
});

export default function ProjectTagEdit() {
  const router = useRouter();
  console.log(router);
  const { project, tag } = router.query;
  const { data, isLoading, updateTag } = useTag(
    project as string,
    tag as string
  );

  const defaults = useCallback(
    () => ({
      name: data?.name || null,
      type: data?.type || null,
      seqnr: data?.seqnr || null,
    }),
    [data]
  );

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver<any>(formSchema),
    defaultValues: {},
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const tag = await updateTag(values.name, values.type, values.seqnr);
    if (tag) {
      toast.success('Tag aangepast!');
    } else {
      toast.error('Er is helaas iets mis gegaan.')
    }
  }

  useEffect(() => {
    form.reset(defaults());
  }, [form, defaults]);

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
            name: 'Tags',
            url: `/projects/${project}/tags`,
          },
          {
            name: 'Tag aanpassen',
            url: `/projects/${project}/tags/${tag}`,
          },
        ]}>
        <div className="p-6 bg-white rounded-md">
          <Form {...form}>
            <Heading size="xl">Aanpassen</Heading>
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
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Type</FormLabel>
                    <FormControl>
                      <Input placeholder="" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="seqnr"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sequence nummer</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="" {...field} />
                    </FormControl>
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
