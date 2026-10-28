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
import {
  errorMessageOf,
  validateForSave,
} from '@/components/ui/save-controller';
import { Separator } from '@/components/ui/separator';
import { Heading } from '@/components/ui/typography';
import useAccessCodes from '@/hooks/use-access-codes';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/router';
import React, { useCallback } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import * as z from 'zod';

const formSchema = z.object({
  accessCode: z.string(),
});

export default function ProjectCodeCreate() {
  const router = useRouter();
  const { project } = router.query;
  const { createAccessCode } = useAccessCodes(project as string);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver<any>(formSchema),
    defaultValues: {},
  });

  const save = useCallback(async () => {
    const valid = await validateForSave(form);
    if (!valid) {
      throw new Error('Controleer de gemarkeerde velden.');
    }
    const values = formSchema.parse(form.getValues());

    const codes = await createAccessCode(values.accessCode);
    if (!codes) {
      throw new Error('Er is helaas iets mis gegaan.');
    }

    toast.success('De toegangscode is aangemaakt!');
    router.push(`/projects/${project}/authentication/access-codes`);
  }, [form, createAccessCode, router, project]);

  async function submit() {
    try {
      await save();
    } catch (error) {
      toast.error(errorMessageOf(error));
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
            name: 'Authenticatie',
            url: `/projects/${project}/authentication`,
          },
          {
            name: 'Toegangscodes',
            url: `/projects/${project}/authentication/access-codes`,
          },
          {
            name: 'Toegangscode toevoegen',
            url: `/projects/${project}/authentication/access-codes/create`,
          },
        ]}>
        <div className="container py-6">
          <Form {...form} className="p-6 bg-white rounded-md">
            <Heading size="xl">Toevoegen</Heading>
            <Separator className="my-4" />
            <form
              onSubmit={(event) => {
                event.preventDefault();
                submit();
              }}
              className="lg:w-3/4 grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="accessCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Toegangscode</FormLabel>
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
      </PageLayout>
    </div>
  );
}
