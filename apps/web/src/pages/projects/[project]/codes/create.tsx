import { PageLayout } from '@/components/ui/page-layout';
import React from 'react';
import Link from 'next/link';
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
import useCodes from '@/hooks/use-codes';

const formSchema = z.object({
  numberOfCodes: z.coerce.number(),
});

export default function ProjectCodeCreate() {
  const router = useRouter();
  const { project } = router.query;
  const { create } = useCodes();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver<any>(formSchema),
    defaultValues: {},
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    create(values);
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
            name: 'Stemcodes',
            url: `/projects/${project}/codes`,
          },
          {
            name: 'Stemcodes toevoegen',
            url: `projects/${project}/codes/create`,
          },
        ]}
        action={
          <div className="flex">
            <Link href="/projects/1/codes/export">
              <Button variant="default">Exporteer stemcodes</Button>
            </Link>
          </div>
        }>
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
                      Hoeveelheid nieuwe codes om aan te maken:
                    </FormLabel>
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
