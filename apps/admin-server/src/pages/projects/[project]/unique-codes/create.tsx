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
import { useProject } from '@/hooks/use-project';
import useUniqueCodes from '@/hooks/use-unique-codes';
import toast from 'react-hot-toast';

const formSchema = z.object({
  numberOfCodes: z.string(),
})

export default function ProjectCodeCreate() {
    const router = useRouter();
    const { project } = router.query;
    const { createUniqueCodes } = useUniqueCodes(project as string);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver<any>(formSchema),
    defaultValues: {},
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const codes = await createUniqueCodes(values.numberOfCodes)
    if (codes) {
      toast.success('De codes worden aangemaakt!');
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
            name: 'Stemcodes',
            url: `/projects/${project}/unique-codes`,
          },
          {
            name: 'Stemcodes toevoegen',
            url: `/projects/${project}/unique-codes/create`,
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
                name="numberOfCodes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Hoeveel nieuwe codes wil je maken?
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
