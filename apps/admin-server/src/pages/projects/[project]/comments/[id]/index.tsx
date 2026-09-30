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
import { useRegisterFormSave } from '@/components/ui/save-controller';
import { Separator } from '@/components/ui/separator';
import { Heading } from '@/components/ui/typography';
import useComment from '@/hooks/use-comment';
import { useSyncFormDefaults } from '@/hooks/useSyncFormDefaults';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/router';
import * as React from 'react';
import { useCallback } from 'react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

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

  useSyncFormDefaults(form, defaults, data);

  const save = useCallback(async () => {
    const valid = await form.trigger();
    if (!valid) {
      throw new Error('Controleer de gemarkeerde velden.');
    }
    const values = formSchema.parse(form.getValues());
    const comment = await updateComment(values.description, values.label);
    if (!comment) {
      throw new Error('Er is helaas iets mis gegaan.');
    }
  }, [form, updateComment]);

  useRegisterFormSave(form, save);

  return (
    <div>
      <PageLayout
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
              <div className="lg:w-1/2 grid grid-cols-1 gap-4">
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
              </div>
            </Form>
          </div>
        </div>
      </PageLayout>
    </div>
  );
}
