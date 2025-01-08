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
import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useProject } from '../../../../hooks/use-project';
import toast from 'react-hot-toast';
import * as Switch from '@radix-ui/react-switch';
import InfoDialog from '@/components/ui/info-hover';

const formSchema = z.object({
  isViewable: z.boolean().optional(),
  isActive: z.boolean().optional(),
  withExisting: z.enum(['error', 'replace', 'merge']).optional(),
  requiredUserRole: z.enum(['anonymous', 'member']).optional(),
  voteType: z.enum([
    'likes',
    'count',
    'budgeting',
    'countPerTag',
    'budgetingPerTag',
    'countPerTheme',
    'budgetingPerTheme',
  ]).optional(),
  minResources: z.coerce.number().gt(-1).optional(),
  maxResources: z.coerce.number().gt(-1).optional(),
  minBudget: z.coerce.number().gt(-1).optional(),
  maxBudget: z.coerce.number().gt(-1).optional()
}).refine((data) => {
  if (data.maxResources !== 0 && data.minResources !== undefined && data.maxResources !== undefined) {
    return data.maxResources > data.minResources;
  }
  return true;
}, {
  message: "De maximale hoeveelheid resources moet groter zijn dan de minimale hoeveelheid.",
  path: ["maxResources"]
}).refine((data) => {
  if (data.maxBudget !== undefined && data.minBudget !== undefined && data.maxBudget !== 0) {
    return data.maxBudget > data.minBudget;
  }
  return true;
}, {
  message: "De maximale budget moet groter zijn dan het minimale budget.",
  path: ["maxBudget"]
});

export default function ProjectSettingsVoting() {
  const category = 'votes';
  const [fieldValue, setFieldValue] = useState<string>('');

  const router = useRouter();
  const { project } = router.query;
  const { data, isLoading, updateProject } = useProject();
  const defaults = useCallback(() => {
    const voteType = data?.config?.[category]?.voteType;

    const correctedVoteType = (() => {
      switch (voteType) {
        case 'countPerTheme':
          return 'countPerTag';
        case 'budgetingPerTheme':
          return 'budgetingPerTag';
        default:
          return voteType || 'likes';
      }
    })();

    return {
      isViewable: data?.config?.[category]?.isViewable || false,
      isActive: data?.config?.[category]?.isActive || false,
      withExisting: data?.config?.[category]?.withExisting || "error",
      requiredUserRole: data?.config?.[category]?.requiredUserRole || "anonymous",
      voteType: correctedVoteType,
      minResources: data?.config?.[category]?.minResources || 0,
      maxResources: data?.config?.[category]?.maxResources || 0,
      minBudget: data?.config?.[category]?.minBudget || 0,
      maxBudget: data?.config?.[category]?.maxBudget || 0,
    }},
    [data?.config]
  );

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver<any>(formSchema),
    defaultValues: defaults(),
  });

  useEffect(() => {
    form.reset(defaults());
  }, [form, defaults]);

useEffect(() => {
  setFieldValue(data?.config?.[category]?.voteType);
}, [data]);

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
            url: '/projects/${project}/settings',
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
              className="lg:w-fit grid grid-cols-1 lg:grid-cols-2 gap-x-4 gap-y-8">
              <FormField
                control={form.control}
                name="isViewable"
                render={({ field }) => (
                  <FormItem className="col-span-1">
                    <FormLabel>
                      Kunnen bezoekers het aantal stemmen op een inzending zien?
                    </FormLabel>
                    <Switch.Root
                      className="block w-[50px] h-[25px] bg-stone-300 rounded-full relative focus:shadow-[0_0_0_2px] focus:shadow-black data-[state=checked]:bg-primary outline-none cursor-default"
                      onCheckedChange={(e: boolean) => {
                        field.onChange(e);
                      }}
                      checked={field.value}>
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
                    <FormLabel>Kunnen bezoekers stemmen op een inzending?</FormLabel>
                    <Switch.Root
                      className="block w-[50px] h-[25px] bg-stone-300 rounded-full relative focus:shadow-[0_0_0_2px] focus:shadow-black data-[state=checked]:bg-primary outline-none cursor-default"
                      onCheckedChange={(e: boolean) => {
                        field.onChange(e);
                      }}
                      checked={field.value}>
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
                      Wat moet er gebeuren als iemand twee keer stemt op dezelfde inzending?
                    </FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Error" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="error">Toon een foutmelding</SelectItem>
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
                      Welke gebruikers mogen stemmen?
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
                      Wat voor soort stem kunnen bezoekers uitbrengen?
                    </FormLabel>
                    <Select onValueChange={(e) => {
                      field.onChange(e);
                      setFieldValue(e);
                    }}
                      value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Count" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="likes">Likes</SelectItem>
                        <SelectItem value="count">Aantallen</SelectItem>
                        <SelectItem value="budgeting">Begroten</SelectItem>
                        <SelectItem value="countPerTag">
                          Aantal per tag(groep)
                        </SelectItem>
                        <SelectItem value="budgetingPerTag">
                          Begroten per tag(groep)
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {(fieldValue === 'countPerTag' || fieldValue === 'count') && (
                <FormField
                  control={form.control}
                  name="minResources"
                  render={({ field }) => (
                    <FormItem className="col-span-1">
                      <FormLabel>
                        Wat is de minimum hoeveelheid inzendingen{form.watch("voteType") === "countPerTag" ? " per tag(groep) " : " "}waar iemand op kan stemmen?
                        <InfoDialog content={'Dit veld is alleen beschikbaar als één van de volgende types gekozen is: Aantallen, Aantal per tag(groep) of Begroten per tag(groep)'} />
                      </FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="1" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
              {(fieldValue === 'countPerTag' || fieldValue === 'count') && (
                <FormField
                  control={form.control}
                  name="maxResources"
                  render={({ field }) => (
                    <FormItem className="col-span-1">
                      <FormLabel>
                        Wat is de maximum hoeveelheid inzendingen{form.watch("voteType") === "countPerTag" ? " per tag(groep) " : " "}waar iemand op kan stemmen?
                        <InfoDialog content={'Dit veld is alleen beschikbaar als één van de volgende types gekozen is: Aantallen, Aantal per tag(groep) of Begroten per tag(groep'} />
                      </FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="100" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
              {(fieldValue === 'budgetingPerTag' || fieldValue === 'budgeting') && (
                <FormField
                  control={form.control}
                  name="minBudget"
                  render={({ field }) => (
                    <FormItem className="col-span-1">
                      <FormLabel>
                        Wat is het minimum budget{form.watch("voteType") === "budgetingPerTag" ? " per tag(groep)" : " "}?
                        <InfoDialog content={'Dit veld is alleen beschikbaar als één van de volgende types gekozen is: Budgeting, Begroten per tag(groep) '} />
                      </FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="1" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
              {(fieldValue === 'budgetingPerTag' || fieldValue === 'budgeting') && (
                <FormField
                  control={form.control}
                  name="maxBudget"
                  render={({ field }) => (
                    <FormItem className="col-span-1">
                      <FormLabel>
                        Wat is het maximum budget{form.watch("voteType") === "budgetingPerTag" ? " per tag(groep)" : " "}?
                        <InfoDialog content={'Dit veld is alleen beschikbaar als één van de volgende types gekozen is: Budgeting, Begroten per tag(groep) '} />
                      </FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="100" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
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
