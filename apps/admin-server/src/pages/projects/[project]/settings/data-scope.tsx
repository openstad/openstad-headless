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
import { useCallback, useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import * as z from 'zod';

import { useProject } from '../../../../hooks/use-project';
import { Widget, useWidgetsHook } from '../../../../hooks/use-widgets';
import { DATA_SCOPE_COMPONENTS } from './data-scope-catalog';

// Confirmation/meta config keys (packages/enquete's Confirmation type) — never
// treated as a form field, even if a stray config item happens to collide with
// one of these names. MUST stay in sync with CONTROL_FIELD_KEYS in
// apps/api-server/src/lib/reporting/flatten-submission.js (the backend source
// of truth that actually enforces it) — kept here only so the admin UI doesn't
// offer a toggle for a field the backend would silently ignore anyway.
const CONTROL_FIELD_KEYS = new Set([
  'confirmationUser',
  'userEmailAddress',
  'confirmationAdmin',
  'overwriteEmailAddress',
]);

type FormFieldOption = { key: string; label: string };

/**
 * Unions the form-item field keys across every widget of the given type
 * (e.g. 'enquete' for submissions, 'choiceguide' for choice guides), so the
 * per-field opt-in list reflects every field the project's forms can produce
 * — matching the union approach the reporting endpoints themselves use
 * (see apps/api-server/src/routes/api/reports/submissions.js).
 */
function getWidgetFormFields(
  widgets: Widget[] | undefined,
  widgetType: string
): FormFieldOption[] {
  const seen = new Set<string>();
  const out: FormFieldOption[] = [];

  for (const widget of widgets || []) {
    if (widget.type !== widgetType) continue;
    const items = (widget.config as any)?.items;
    if (!Array.isArray(items)) continue;

    for (const item of items) {
      const key = item?.fieldKey || item?.key;
      if (!key || CONTROL_FIELD_KEYS.has(key) || seen.has(key)) continue;
      seen.add(key);
      out.push({ key, label: item.title || key });
    }
  }

  return out;
}

// Single source of truth for labels/fields lives in data-scope-catalog.ts;
// the personalField keys are kept in sync with the backend catalog
// (packages/lib/report-data-scope.js) by a parity test.
const COMPONENTS = DATA_SCOPE_COMPONENTS;

type ComponentKey = keyof typeof COMPONENTS;

const componentSchema = z.object({
  enabled: z.boolean().default(false),
  personalFields: z.array(z.string()).default([]),
  // Per-field opt-in for dynamic form content. Only meaningful for
  // 'submissions' (formFields, backed by enquete widget items) and
  // 'choiceguides' (answerFields, backed by choiceguide widget items) — an
  // empty array on every other component is harmless.
  formFields: z.array(z.string()).default([]),
  answerFields: z.array(z.string()).default([]),
});

const formSchema = z.object({
  resources: componentSchema,
  votes: componentSchema,
  comments: componentSchema,
  submissions: componentSchema,
  choiceguides: componentSchema,
  projects: componentSchema,
  choiceguideguides: componentSchema,
  choiceguidequestions: componentSchema,
  users: componentSchema,
});

type FormValues = z.infer<typeof formSchema>;

/**
 * Reusable checkbox list bound to `${key}.${fieldName}` (a string[] form
 * field). Used for the static personalFields catalog as well as the dynamic
 * formFields/answerFields lists sourced from the project's widgets.
 */
function FieldCheckboxGroup({
  control,
  keyName,
  fieldName,
  sectionLabel,
  options,
}: {
  control: any;
  keyName: ComponentKey;
  fieldName: 'personalFields' | 'formFields' | 'answerFields';
  sectionLabel: string;
  options: readonly FormFieldOption[];
}) {
  if (options.length === 0) return null;

  return (
    <div className="pl-2 border-l-2 border-yellow-300 space-y-2">
      <p className="text-sm font-medium text-muted-foreground">
        {sectionLabel}
      </p>
      <FormField
        control={control}
        name={`${keyName}.${fieldName}` as any}
        render={() => (
          <FormItem className="space-y-2">
            {options.map((opt) => (
              <FormField
                key={opt.key}
                control={control}
                name={`${keyName}.${fieldName}` as any}
                render={({ field }) => {
                  const currentValues: string[] = field.value || [];
                  return (
                    <FormItem
                      key={opt.key}
                      className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={currentValues.includes(opt.key)}
                          onCheckedChange={(checked) => {
                            const next = checked
                              ? [...currentValues, opt.key]
                              : currentValues.filter((v) => v !== opt.key);
                            field.onChange(next);
                          }}
                        />
                      </FormControl>
                      <FormLabel className="font-normal cursor-pointer">
                        {opt.label}
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
  );
}

function buildDefaults(dataScopeConfig: any): FormValues {
  return (Object.keys(COMPONENTS) as ComponentKey[]).reduce(
    (acc, key) => ({
      ...acc,
      [key]: {
        enabled: dataScopeConfig?.[key]?.enabled ?? false,
        personalFields: dataScopeConfig?.[key]?.personalFields ?? [],
        formFields: dataScopeConfig?.[key]?.formFields ?? [],
        answerFields: dataScopeConfig?.[key]?.answerFields ?? [],
      },
    }),
    {} as FormValues
  );
}

export default function ProjectSettingsDataScope() {
  const router = useRouter();
  const { project } = router.query;
  const { data, error, isLoading, updateProject } = useProject();
  const { data: widgets } = useWidgetsHook(project as string);

  const enqueteFormFields = useMemo(
    () => getWidgetFormFields(widgets, 'enquete'),
    [widgets]
  );
  const choiceguideAnswerFields = useMemo(
    () => getWidgetFormFields(widgets, 'choiceguide'),
    [widgets]
  );

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
          : {
              enabled: false,
              personalFields: [],
              formFields: [],
              answerFields: [],
            },
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

                        {enabled && (
                          <FieldCheckboxGroup
                            control={form.control}
                            keyName={key}
                            fieldName="personalFields"
                            sectionLabel="Optionele persoonsvelden (gepseudonimiseerd)"
                            options={def.personalFields}
                          />
                        )}

                        {enabled && key === 'submissions' && (
                          <FieldCheckboxGroup
                            control={form.control}
                            keyName={key}
                            fieldName="formFields"
                            sectionLabel="Formuliervelden (per veld opt-in)"
                            options={enqueteFormFields}
                          />
                        )}

                        {enabled && key === 'choiceguides' && (
                          <FieldCheckboxGroup
                            control={form.control}
                            keyName={key}
                            fieldName="answerFields"
                            sectionLabel="Antwoordvelden (per veld opt-in)"
                            options={choiceguideAnswerFields}
                          />
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
