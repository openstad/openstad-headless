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
import { Separator } from '@/components/ui/separator';
import { Heading } from '@/components/ui/typography';
import useUniqueCodes from '@/hooks/use-unique-codes';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/router';
import React from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import * as z from 'zod';

const formSchema = z.object({
  numberOfCodes: z.coerce
    .number({ invalid_type_error: 'Vul een getal in' })
    .int('Vul een heel getal in')
    .positive('Vul een positief getal in')
    .min(1, 'Vul minimaal 1 in'),
});

export default function ProjectCodeCreate() {
  const router = useRouter();
  const { project } = router.query;
  const { createUniqueCodes } = useUniqueCodes(project as string);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver<any>(formSchema),
    defaultValues: {},
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const codes = await createUniqueCodes(values.numberOfCodes);
    if (codes) {
      toast.success('De codes worden aangemaakt!');
      router.push(`/projects/${project}/unique-codes`);
    } else {
      toast.error('Er is helaas iets mis gegaan.');
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
            name: 'Stemcodes',
            url: `/projects/${project}/unique-codes`,
          },
          {
            name: 'Stemcodes toevoegen',
            url: `/projects/${project}/unique-codes/create`,
          },
        ]}>
        <div className="container py-6">
          <div className="p-6 bg-white rounded-md">
            <Heading size="xl">Toevoegen</Heading>
            <Separator className="my-4" />
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="lg:w-3/4 grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="numberOfCodes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Hoeveel nieuwe codes wil je maken?</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={1}
                          placeholder=""
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="col-span-full flex gap-4">
                  <Button type="submit" className="w-fit">
                    Opslaan
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="w-fit"
                    onClick={() =>
                      router.push(`/projects/${project}/unique-codes`)
                    }>
                    Annuleren
                  </Button>
                </div>
              </form>
            </Form>
          </div>
        </div>
      </PageLayout>
    </div>
  );
}
