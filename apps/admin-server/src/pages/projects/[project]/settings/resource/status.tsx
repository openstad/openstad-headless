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
import { Heading } from '@/components/ui/typography';
import { Separator } from '@/components/ui/separator';
import { useEffect } from 'react';
import { useProject } from '../../../../../hooks/use-project';

const formSchema = z.object({
  textOpen: z.string(),
  textClosed: z.string(),
  optionRejected: z.enum(['']),
  textAccepted: z.string(),
  optionAccepted: z.enum(['']),
  optionDone: z.enum(['']),
  optionConsidered: z.enum(['']),
});

export default function ProjectSettingsResourceLabels() {
  const { data, isLoading } = useProject();
  const defaults = () => ({});

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver<any>(formSchema),
    defaultValues: defaults(),
  });

  useEffect(() => {
    form.reset(defaults());
  }, [data]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values);
  }

  return (
    <div className="container py-6">
      <Form {...form} className="p-6 bg-white rounded-md">
        <Heading size="xl">Resource labels</Heading>
        <Separator className="my-4" />
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="lg:w-fit grid grid-cols-1 lg:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="textOpen"
            render={({ field }) => (
              <FormItem className="col-span-1">
                <FormLabel>Tekst voor de &apos;Open&apos; label</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="textClosed"
            render={({ field }) => (
              <FormItem className="col-span-1">
                <FormLabel>Tekst voor de &apos;Gesloten&apos; label</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="textOpen"
            render={({ field }) => (
              <FormItem className="col-span-1">
                <FormLabel>Tekst voor de &apos;Afgewezen&apos; label</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="textAccepted"
            render={({ field }) => (
              <FormItem className="col-span-1">
                <FormLabel>
                  Tekst voor de &apos;Geaccepteerd&apos; label
                </FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="textOpen"
            render={({ field }) => (
              <FormItem className="col-span-1">
                <FormLabel>Tekst voor de &apos;Afgerond&apos; label</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="textOpen"
            render={({ field }) => (
              <FormItem className="col-span-1">
                <FormLabel>
                  Tekst voor de &apos;In overweging&apos; label
                </FormLabel>
                <FormControl>
                  <Input {...field} />
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
  );
}
