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
import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useProject } from '../../../../hooks/use-project';

const formSchema = z.object({
  isViewable: z.boolean(),
  isActive: z.boolean(),
  withExisting: z.enum(['error', 'replace']),
  requiredUserRole: z.enum(['anonymous', 'member']),
  voteType: z.enum([
    'likes',
    'count',
    'budgeting',
    'countPerTheme',
    'budgetingPerTheme',
  ]),
  minIdeas: z.coerce.number().gt(0),
  maxIdeas: z.coerce.number(),
});

export default function ProjectSettingsVoting() {
  const category = 'votes';

  const router = useRouter();
  const { project } = router.query;
  const { data, isLoading, updateProject } = useProject();
  const defaults = () => ({
    isViewable: data?.config?.[category]?.isViewable || null,
    isActive: data?.config?.[category]?.isActive || false,
    withExisting: data?.config?.[category]?.withExisting || null,
    requiredUserRole: data?.config?.[category]?.requiredUserRole || null,
    voteType: data?.config?.[category]?.voteType || null,
    minIdeas: data?.config?.[category]?.minIdeas || null,
    maxIdeas: data?.config?.[category]?.maxIdeas || null,
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver<any>(formSchema),
    defaultValues: defaults(),
  });

  useEffect(() => {
    form.reset(defaults());
  }, [data]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      await updateProject({
        [category]: {
          isViewable: values.isViewable,
          isActive: values.isActive,
          withExisting: values.withExisting,
          requiredUserRole: values.requiredUserRole,
          voteType: values.voteType,
          minIdeas: values.minIdeas,
          maxIdeas: values.maxIdeas,
        },
      });
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
                    <Select
                      onValueChange={(e: string) =>
                        field.onChange(e === 'true')
                      }
                      value={field.value ? 'true' : 'false'}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Ja" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="true">Ja</SelectItem>
                        <SelectItem value="false">Nee</SelectItem>
                      </SelectContent>
                    </Select>
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
                    <Select
                      onValueChange={(e: string) =>
                        field.onChange(e === 'true')
                      }
                      value={field.value ? 'true' : 'false'}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Nee" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="true">Ja</SelectItem>
                        <SelectItem value="false">Nee</SelectItem>
                      </SelectContent>
                    </Select>
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
                name="minIdeas"
                render={({ field }) => (
                  <FormItem className="col-span-1">
                    <FormLabel>
                      Wat is de minimum hoeveelheid ideeën waar iemand op kan
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
                name="maxIdeas"
                render={({ field }) => (
                  <FormItem className="col-span-1">
                    <FormLabel>
                      Wat is de maximum hoeveelheid ideeën waar iemand op kan
                      stemmen?
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
