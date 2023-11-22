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
import { Textarea } from '@/components/ui/textarea';
import { PageLayout } from '@/components/ui/page-layout';
import { Heading } from '@/components/ui/typography';
import { Separator } from '@/components/ui/separator';

const formSchema = z.object({
  firstTitle: z.string(),
  firstSubtitle: z.string(),
  firstDescription: z.string(),
  firstLabel: z.string(),
  firstButton: z.string(),
  firstHelptext: z.string(),
  secondTitle: z.string(),
  secondSubtitle: z.string(),
  secondLabel: z.string(),
  secondButton: z.string(),
  secondHelptext: z.string(),
  smsSender: z.string(),
  smsText: z.string(),
});

export default function ProjectAuthenticationSmsVerification() {
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
            name: 'Authenticatie',
            url: '/projects/1/authentication',
          },
          {
            name: 'SMS verificatie',
            url: '/projects/1/authentication/smsverification',
          },
        ]}>
        <div className="container py-6">
          <Form {...form} className="p-6 bg-white rounded-md">
            <Heading size="xl">SMS verificatie</Heading>
            <Separator className="my-4" />
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="lg:min-w-fit lg:w-3/4 grid grid-cols-1 lg:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="firstTitle"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Titel voor het eerste scherm</FormLabel>
                    <FormControl>
                      <Input placeholder="" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="firstSubtitle"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ondertitel voor het eerste scherm</FormLabel>
                    <FormControl>
                      <Input placeholder="" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="firstDescription"
                render={({ field }) => (
                  <FormItem className="col-span-full">
                    <FormLabel>Beschrijving voor het eerste scherm</FormLabel>
                    <FormControl>
                      <Textarea placeholder="" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="firstLabel"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Label voor het eerste scherm</FormLabel>
                    <FormControl>
                      <Input placeholder="" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="firstButton"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Knoptekst voor het eerste scherm</FormLabel>
                    <FormControl>
                      <Input placeholder="" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="firstHelptext"
                render={({ field }) => (
                  <FormItem className="col-span-full">
                    <FormLabel>Hulptekst voor het eerste scherm</FormLabel>
                    <FormControl>
                      <Textarea placeholder="" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="secondTitle"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Titel voor het tweede scherm</FormLabel>
                    <FormControl>
                      <Input placeholder="" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="secondSubtitle"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ondertitel voor het tweede scherm</FormLabel>
                    <FormControl>
                      <Input placeholder="" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="secondLabel"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Label voor het tweede scherm</FormLabel>
                    <FormControl>
                      <Input placeholder="" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="secondButton"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Knoptekst voor het tweede scherm</FormLabel>
                    <FormControl>
                      <Input placeholder="" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="secondHelptext"
                render={({ field }) => (
                  <FormItem className="col-span-full">
                    <FormLabel>Hulptekst voor het eerste scherm</FormLabel>
                    <FormControl>
                      <Textarea placeholder="" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="smsSender"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Verstuurder van de SMS</FormLabel>
                    <FormControl>
                      <Input placeholder="OpenStad" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="smsText"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Inhoud van de SMS</FormLabel>
                    <FormControl>
                      <Input placeholder="Code: [[code]]" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-fit col-span-full">
                Opslaan
              </Button>
            </form>
          </Form>
        </div>
      </PageLayout>
    </div>
  );
}
