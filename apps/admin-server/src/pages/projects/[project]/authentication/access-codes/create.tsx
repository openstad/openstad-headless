import { PageLayout } from '@/components/ui/page-layout';
import React from 'react';
import * as z from 'zod';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useRouter } from 'next/router';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Heading } from '@/components/ui/typography';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Separator } from '@/components/ui/separator';
import toast from 'react-hot-toast';
import useAccessCodes from '@/hooks/use-access-codes';

const formSchema = z.object({
  accessCode: z.string(),
})

export default function ProjectCodeCreate() {
    const router = useRouter();
    const { project } = router.query;
    const { createAccessCode } = useAccessCodes(project as string);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver<any>(formSchema),
    defaultValues: {},
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const codes = await createAccessCode(values.accessCode)
    if (codes) {
      toast.success('De toegangscode is aangemaakt!');
      router.push(`/projects/${project}/access-codes`);
    } else {
      toast.error('Er is helaas iets mis gegaan.')
    }
  }
    
  return (
    <div>
      <PageLayout
        pageHeader='Projecten'
        breadcrumbs={[
          {
            name: 'Projecten',
            url: '/projects'
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
              onSubmit={form.handleSubmit(onSubmit)}
              className="lg:w-3/4 grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="accessCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Toegangscode
                    </FormLabel>
                    <FormControl>
                      <Input placeholder='' {...field} />
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
