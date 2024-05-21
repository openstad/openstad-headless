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
import { useCallback, useEffect } from 'react';
import toast from 'react-hot-toast';
import useComment from '@/hooks/use-comment';

const formSchema = z.object({
  description: z.string(),
  label: z.string(),
});

export default function ProjectCommentEdit() {
  const router = useRouter();
  const { project, id } = router.query;
  const { data, isLoading, updateComment } = useComment(
    project as string,
    id as string
  );

  const defaults = useCallback(
    () => ({
      description: data?.description || null,
      label: data?.label || null,
    }),
    [data]
  );

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver<any>(formSchema),
    defaultValues: {},
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const comment = await updateComment( values.description, values.label )
    if (comment) {
      toast.success('Comment aangepast!');
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
            name: 'Reacties',
            url: `/projects/${project}/comments`,
          },
          {
            name: 'Reactie aanpassen',
            url: `/projects/${project}/comments/${id}`,
          },
        ]}>
        <div className="container py-6">
        <div className="p-6 bg-white rounded-md">
                <Form {...form}>
                  <Heading size="xl">Reactie aanpassen</Heading>
                  <Separator className="my-4" />
                  <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="lg:w-1/2 grid grid-cols-1 gap-4">
                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Beschrijving</FormLabel>
                          <FormControl>
                            <Input placeholder="" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="label"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Label</FormLabel>
                          <FormControl>
                            <Input placeholder="" {...field} />
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
        </div>
      </PageLayout>
    </div>
  );
}
