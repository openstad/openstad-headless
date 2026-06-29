import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { PageLayout } from '@/components/ui/page-layout';
import { Separator } from '@/components/ui/separator';
import { Heading } from '@/components/ui/typography';
import { zodResolver } from '@hookform/resolvers/zod';
import * as Switch from '@radix-ui/react-switch';
import { AlertTriangle } from 'lucide-react';
import { useRouter } from 'next/router';
import { useCallback, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import * as z from 'zod';

import { useProject } from '../../../../hooks/use-project';
import { DATA_SCOPE_COMPONENTS } from './data-scope-catalog';

// Single source of truth for labels/fields lives in data-scope-catalog.ts;
// the personalField keys are kept in sync with the backend catalog
// (packages/lib/report-data-scope.js) by a parity test.
const COMPONENTS = DATA_SCOPE_COMPONENTS;

type ComponentKey = keyof typeof COMPONENTS;

const componentSchema = z.object({
  enabled: z.boolean().default(false),
  personalFields: z.array(z.string()).default([]),
});

const formSchema = z.object({
  resources: componentSchema,
  votes: componentSchema,
  comments: componentSchema,
  submissions: componentSchema,
  choiceguides: componentSchema,
});

type FormValues = z.infer<typeof formSchema>;

function buildDefaults(dataScopeConfig: any): FormValues {
  return (Object.keys(COMPONENTS) as ComponentKey[]).reduce(
    (acc, key) => ({
      ...acc,
      [key]: {
        enabled: dataScopeConfig?.[key]?.enabled ?? false,
        personalFields: dataScopeConfig?.[key]?.personalFields ?? [],
      },
    }),
    {} as FormValues
  );
}

export default function ProjectSettingsDataScope() {
  const router = useRouter();
  const { project } = router.query;
  const { data, error, isLoading, updateProject } = useProject();

  const defaults = useCallback(
    () => buildDefaults(data?.config?.dataScope),
    [data?.config?.dataScope]
  );

  const form = useForm<FormValues>({
    resolver: zodResolver<any>(formSchema),
    defaultValues: defaults(),
  });

  useEffect(() => {
    form.reset(defaults());
  }, [form, defaults]);

  async function onSubmit(values: FormValues) {
    // A disabled component must not retain opted-in personal fields: clear them
    // so re-enabling the component later starts from a clean (empty) state.
    const normalized = (Object.keys(values) as ComponentKey[]).reduce(
      (acc, key) => ({
        ...acc,
        [key]: values[key].enabled
          ? values[key]
          : { enabled: false, personalFields: [] },
      }),
      {} as FormValues
    );

    try {
      const result = await updateProject({ dataScope: normalized });
      if (result) {
        toast.success('Project aangepast!');
      } else {
        toast.error('Er is helaas iets mis gegaan.');
      }
    } catch (error) {
      console.error('Could not update dataScope', error);
      toast.error('Er is helaas iets mis gegaan.');
    }
  }

  return (
    <div>
      <PageLayout
        breadcrumbs={[
          { name: 'Projecten', url: '/projects' },
          { name: 'Instellingen', url: `/projects/${project}/settings` },
          {
            name: 'Data via API',
            url: `/projects/${project}/settings/data-scope`,
          },
        ]}>
        <div className="container py-6">
          {error ? (
            <p className="text-sm text-red-700">
              De projectinstellingen konden niet worden geladen. Probeer het
              later opnieuw.
            </p>
          ) : isLoading ? (
            <p className="text-sm text-muted-foreground">Instellingen laden…</p>
          ) : (
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="w-full lg:w-5/6">
                <Heading size="xl">Data via API</Heading>
                <Separator className="my-4" />

                <Alert className="mb-6 border-yellow-400 bg-yellow-50">
                  <AlertTriangle className="h-4 w-4 text-yellow-600" />
                  <AlertTitle className="text-yellow-800">
                    Let op: persoonsgegevens
                  </AlertTitle>
                  <AlertDescription className="text-yellow-700">
                    De aangevinkte persoonsvelden worden via de API beschikbaar
                    gesteld. E-mailadressen, telefoonnummers, adressen en
                    IP-adressen worden nooit gedeeld, ongeacht de instelling.
                  </AlertDescription>
                </Alert>

                <div className="grid grid-cols-1 gap-8">
                  {(
                    Object.entries(COMPONENTS) as [
                      ComponentKey,
                      (typeof COMPONENTS)[ComponentKey],
                    ][]
                  ).map(([key, def]) => {
                    const enabled = form.watch(`${key}.enabled` as any);
                    return (
                      <div
                        key={key}
                        className="rounded-md border p-5 bg-white space-y-4">
                        <FormField
                          control={form.control}
                          name={`${key}.enabled` as any}
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between">
                              <div>
                                <FormLabel className="text-base font-semibold">
                                  {def.label}
                                </FormLabel>
                                <FormDescription>
                                  Maak {def.label.toLowerCase()} beschikbaar via
                                  de rapportage-API
                                </FormDescription>
                              </div>
                              <FormControl>
                                <Switch.Root
                                  className="block w-[50px] h-[25px] bg-stone-300 rounded-full relative focus:shadow-[0_0_0_2px] focus:shadow-black data-[state=checked]:bg-primary outline-none cursor-default"
                                  onCheckedChange={(checked: boolean) =>
                                    field.onChange(checked)
                                  }
                                  checked={field.value}>
                                  <Switch.Thumb className="block w-[21px] h-[21px] bg-white rounded-full transition-transform duration-100 translate-x-0.5 will-change-transform data-[state=checked]:translate-x-[27px]" />
                                </Switch.Root>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        {enabled && def.personalFields.length > 0 && (
                          <div className="pl-2 border-l-2 border-yellow-300 space-y-2">
                            <p className="text-sm font-medium text-muted-foreground">
                              Optionele persoonsvelden (gepseudonimiseerd)
                            </p>
                            <FormField
                              control={form.control}
                              name={`${key}.personalFields` as any}
                              render={() => (
                                <FormItem className="space-y-2">
                                  {def.personalFields.map((pf) => (
                                    <FormField
                                      key={pf.key}
                                      control={form.control}
                                      name={`${key}.personalFields` as any}
                                      render={({ field }) => {
                                        const currentValues: string[] =
                                          field.value || [];
                                        return (
                                          <FormItem
                                            key={pf.key}
                                            className="flex flex-row items-start space-x-3 space-y-0">
                                            <FormControl>
                                              <Checkbox
                                                checked={currentValues.includes(
                                                  pf.key
                                                )}
                                                onCheckedChange={(checked) => {
                                                  const next = checked
                                                    ? [...currentValues, pf.key]
                                                    : currentValues.filter(
                                                        (v) => v !== pf.key
                                                      );
                                                  field.onChange(next);
                                                }}
                                              />
                                            </FormControl>
                                            <FormLabel className="font-normal cursor-pointer">
                                              {pf.label}
                                            </FormLabel>
                                          </FormItem>
                                        );
                                      }}
                                    />
                                  ))}
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                <Button type="submit" className="mt-6 w-fit">
                  Opslaan
                </Button>
              </form>
            </Form>
          )}
        </div>
      </PageLayout>
    </div>
  );
}
