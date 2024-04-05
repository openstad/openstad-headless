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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Heading } from '@/components/ui/typography';
import { Separator } from '@/components/ui/separator';
import { useCallback, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useProject } from '../../../../hooks/use-project';
import toast from 'react-hot-toast';
import * as Switch from '@radix-ui/react-switch';

const formSchema = z.object({
  isViewable: z.boolean(),
  isActive: z.boolean(),
  withExisting: z.enum(['error', 'replace', 'merge']),
  requiredUserRole: z.enum(['anonymous', 'member']),
  voteType: z.enum([
    'likes',
    'count',
    'budgeting',
    'countPerTheme',
    'budgetingPerTheme',
  ]),
  minResources: z.coerce.number().gt(0),
  maxResources: z.coerce.number().gt(0),
  minBudget: z.coerce.number().gt(0),
  maxBudget: z.coerce.number().gt(0)
}).refine((data) => data.maxResources > data.minResources, {
  message: "De maximale hoeveelheid resources moet groter zijn dan de minimale hoeveelheid.",
  path: ["maxResources"]
}).refine(data => data.maxBudget > data.minBudget, {
  message: "De maximale budget moet groter zijn dan het minimale budget.",
  path: ["maxBudget"]
});

export default function ProjectSettingsVoting() {
  const category = 'votes';

  const router = useRouter();
  const { project } = router.query;
  const { data, isLoading, updateProject } = useProject();
  const defaults = useCallback(
    () => ({
      isViewable: data?.config?.[category]?.isViewable || false,
      isActive: data?.config?.[category]?.isActive || false,
      withExisting: data?.config?.[category]?.withExisting || null,
      requiredUserRole: data?.config?.[category]?.requiredUserRole || null,
      voteType: data?.config?.[category]?.voteType || null,
      minResources: data?.config?.[category]?.minResources || 0,
      maxResources: data?.config?.[category]?.maxResources || 0,
      minBudget: data?.config?.[category]?.minBudget || 0,
      maxBudget: data?.config?.[category]?.maxBudget || 0,
    }),
    [data?.config]
  );

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver<any>(formSchema),
    defaultValues: defaults(),
  });

  useEffect(() => {
    form.reset(defaults());
  }, [form, defaults]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      const project = await updateProject({
        [category]: {
          isViewable: values.isViewable,
          isActive: values.isActive,
          withExisting: values.withExisting,
          requiredUserRole: values.requiredUserRole,
          voteType: values.voteType,
          minResources: values.minResources,
          maxResources: values.maxResources,
          minBudget: values.minBudget,
          maxBudget: values.maxBudget,
        },
      });
      if (project) {
        toast.success('Project aangepast!');
      } else {
        toast.error('Er is helaas iets mis gegaan.')
      }
    } catch (error) {
      console.error('could not update', error);
    }
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
            name: 'Instellingen',
            url: `'/projects/${project}/settings'`,
          },
          {
            name: 'Stemmen',
            url: `/projects/${project}/settings/voting`,
          },
        ]}>
        <div className="container py-6">
          <Form {...form} className="p-6 bg-white rounded-md">
            <Heading size="xl">Stemmen</Heading>
            <Separator className="my-4" />
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="lg:w-fit grid grid-cols-1 lg:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="isViewable"
                render={({ field }) => (
                  <FormItem className="col-span-1">
                    <FormLabel>
                      Is de hoeveelheid stemmen publiek zichtbaar?
                    </FormLabel>
                    <Switch.Root
                      className="block w-[50px] h-[25px] bg-stone-300 rounded-full relative focus:shadow-[0_0_0_2px] focus:shadow-black data-[state=checked]:bg-purple-600 outline-none cursor-default"
                      onCheckedChange={(e: boolean) => {
                        field.onChange(e);
                      }}>
                      <Switch.Thumb className="block w-[21px] h-[21px] bg-white rounded-full transition-transform duration-100 translate-x-0.5 will-change-transform data-[state=checked]:translate-x-[27px]" />
                    </Switch.Root>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="isActive"
                render={({ field }) => (
                  <FormItem className="col-span-1">
                    <FormLabel>Is het mogelijk om te stemmen?</FormLabel>
                    <Switch.Root
                      className="block w-[50px] h-[25px] bg-stone-300 rounded-full relative focus:shadow-[0_0_0_2px] focus:shadow-black data-[state=checked]:bg-purple-600 outline-none cursor-default"
                      onCheckedChange={(e: boolean) => {
                        field.onChange(e);
                      }}>
                      <Switch.Thumb className="block w-[21px] h-[21px] bg-white rounded-full transition-transform duration-100 translate-x-0.5 will-change-transform data-[state=checked]:translate-x-[27px]" />
                    </Switch.Root>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="withExisting"
                render={({ field }) => (
                  <FormItem className="col-span-full">
                    <FormLabel>
                      Moet het systeem een error geven wanneer iemand twee keer
                      stemt, of moet de vorige stem vervangen worden?
                    </FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Error" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="error">Error</SelectItem>
                        <SelectItem value="replace">
                          Vervang de vorige stem
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="requiredUserRole"
                render={({ field }) => (
                  <FormItem className="col-span-1">
                    <FormLabel>
                      Wat voor gebruikers hebben het recht om te stemmen?
                    </FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Geregistreerde gebruikers" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="anonymous">
                          Anonieme gebruikers
                        </SelectItem>
                        <SelectItem value="member">
                          Geregistreerde gebruikers
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="voteType"
                render={({ field }) => (
                  <FormItem className="col-span-1">
                    <FormLabel>
                      Wat voor type stemmen wordt er gebruikt?
                    </FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Count" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="likes">Likes</SelectItem>
                        <SelectItem value="count">Count</SelectItem>
                        <SelectItem value="budgeting">Budgeting</SelectItem>
                        <SelectItem value="countPerTheme">
                          Count per theme
                        </SelectItem>
                        <SelectItem value="countPerBudgeting">
                          Count per budgeting
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="minResources"
                render={({ field }) => (
                  <FormItem className="col-span-1">
                    <FormLabel>
                      Wat is de minimum hoeveelheid resources waar iemand op kan
                      stemmen?
                    </FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="1" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="maxResources"
                render={({ field }) => (
                  <FormItem className="col-span-1">
                    <FormLabel>
                      Wat is de maximum hoeveelheid resources waar iemand op kan
                      stemmen?
                    </FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="100" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="minBudget"
                render={({ field }) => (
                  <FormItem className="col-span-1">
                    <FormLabel>
                      Wat is het minimum budget?
                    </FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="1" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="maxBudget"
                render={({ field }) => (
                  <FormItem className="col-span-1">
                    <FormLabel>
                      Wat is het maximum budget?
                    </FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="100" {...field} />
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
