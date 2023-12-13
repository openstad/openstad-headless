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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Heading } from '@/components/ui/typography';
import { Separator } from '@/components/ui/separator';
import { useEffect } from 'react';
import { useRouter } from 'next/router';
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
  const router = useRouter();
  const { project } = router.query;
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
    console.log(values)
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
                    <FormLabel>
                      Tekst voor de 'Open' label
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
                name="textClosed"
                render={({ field }) => (
                  <FormItem className="col-span-1">
                    <FormLabel>
                      Tekst voor de 'Gesloten' label
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
                    <FormLabel>
                      Tekst voor de 'Afgewezen' label
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
                name="textAccepted"
                render={({ field }) => (
                  <FormItem className="col-span-1">
                    <FormLabel>
                      Tekst voor de 'Geaccepteerd' label
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
                    <FormLabel>
                      Tekst voor de 'Afgerond' label
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
                    <FormLabel>
                      Tekst voor de 'In overweging' label
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
