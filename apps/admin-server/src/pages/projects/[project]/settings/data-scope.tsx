import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { PageLayout } from '@/components/ui/page-layout';
import { Separator } from '@/components/ui/separator';
import { Heading } from '@/components/ui/typography';
import {
  COMPONENTS,
  COMPONENT_KEYS,
} from '@openstad-headless/lib/report-data-scope';
import * as Switch from '@radix-ui/react-switch';
import { useRouter } from 'next/router';
import { useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';

import { useProject } from '../../../../hooks/use-project';

type ComponentScope = { enabled: boolean; personalFields: string[] };
type DataScope = Record<string, ComponentScope>;

function buildDefaults(saved: any): DataScope {
  const out: DataScope = {};
  COMPONENT_KEYS.forEach((key) => {
    out[key] = {
      enabled: !!saved?.[key]?.enabled,
      personalFields: Array.isArray(saved?.[key]?.personalFields)
        ? saved[key].personalFields
        : [],
    };
  });
  return out;
}

export default function ProjectSettingsDataScope() {
  const router = useRouter();
  const { project } = router.query;
  const { data, updateProject } = useProject();

  const [scope, setScope] = useState<DataScope>(() => buildDefaults(undefined));

  // Seed local state from the server only once, when the project first loads.
  // Re-seeding on every SWR revalidation (e.g. window refocus) would silently
  // discard in-progress toggles, so we deliberately skip later `data` changes.
  const seededRef = useRef(false);
  useEffect(() => {
    if (seededRef.current || !data) return;
    setScope(buildDefaults(data?.config?.dataScope));
    seededRef.current = true;
  }, [data]);

  function toggleComponent(key: string, enabled: boolean) {
    setScope((prev) => ({ ...prev, [key]: { ...prev[key], enabled } }));
  }

  function togglePersonalField(
    key: string,
    fieldKey: string,
    checked: boolean
  ) {
    setScope((prev) => {
      const current = prev[key].personalFields;
      const next = checked
        ? [...current, fieldKey]
        : current.filter((f) => f !== fieldKey);
      return { ...prev, [key]: { ...prev[key], personalFields: next } };
    });
  }

  async function onSave() {
    try {
      const updated = await updateProject({ dataScope: scope });
      if (updated) {
        toast.success('Project aangepast!');
      } else {
        toast.error('Er is helaas iets mis gegaan.');
      }
    } catch (error) {
      console.error('could not update', error);
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
            name: 'Instellingen',
            url: `/projects/${project}/settings`,
          },
          {
            name: 'Data via API',
            url: `/projects/${project}/settings/data-scope`,
          },
        ]}>
        <div className="container py-6">
          <div className="p-6 bg-white rounded-md">
            <Heading size="xl">Data via API</Heading>
            <Separator className="my-4" />

            <Alert variant="info">
              <AlertTitle>Wat deelt de rapportage-API?</AlertTitle>
              <AlertDescription>
                Standaard deelt een rapportage-token alleen geaggregeerde
                cijfers (de <code>/stats</code>-endpoints). Zet hieronder per
                onderdeel aan welke ruwe data via de API beschikbaar mag zijn.
                Persoonsgegevens blijven standaard uitgesloten en kun je per
                veld bewust aanzetten.
              </AlertDescription>
            </Alert>

            <div className="grid grid-cols-1 gap-6 mt-4">
              {COMPONENT_KEYS.map((key) => {
                const definition = COMPONENTS[key];
                const componentScope = scope[key];
                if (!componentScope) return null;

                return (
                  <div
                    key={key}
                    className="border border-stone-200 rounded-md p-4">
                    <div className="flex items-center justify-between">
                      <Heading size="lg">{definition.label}</Heading>
                      <Switch.Root
                        aria-label={`${definition.label} via de API beschikbaar maken`}
                        className="block w-[50px] h-[25px] bg-stone-300 rounded-full relative focus:shadow-[0_0_0_2px] focus:shadow-black data-[state=checked]:bg-primary outline-none cursor-default"
                        onCheckedChange={(checked: boolean) =>
                          toggleComponent(key, checked)
                        }
                        checked={componentScope.enabled}>
                        <Switch.Thumb className="block w-[21px] h-[21px] bg-white rounded-full transition-transform duration-100 translate-x-0.5 will-change-transform data-[state=checked]:translate-x-[27px]" />
                      </Switch.Root>
                    </div>

                    {componentScope.enabled ? (
                      <div className="mt-4">
                        <p className="text-sm text-stone-600 mb-3">
                          De volgende niet-persoonlijke velden worden gedeeld:{' '}
                          <span className="font-mono">
                            {definition.safeFields.join(', ')}
                          </span>
                          .
                        </p>

                        {definition.personalFields.length > 0 ? (
                          <>
                            <Alert variant="warning">
                              <AlertTitle>Persoonsgegevens</AlertTitle>
                              <AlertDescription>
                                Onderstaande velden kunnen persoonsgegevens
                                bevatten. Zet ze alleen aan als delen via de API
                                echt nodig is.
                              </AlertDescription>
                            </Alert>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                              {definition.personalFields.map(
                                (personalField) => {
                                  const checked =
                                    componentScope.personalFields.includes(
                                      personalField.key
                                    );
                                  return (
                                    <label
                                      key={personalField.key}
                                      className="flex items-center gap-2 cursor-pointer">
                                      <Checkbox
                                        checked={checked}
                                        onCheckedChange={(value) =>
                                          togglePersonalField(
                                            key,
                                            personalField.key,
                                            value === true
                                          )
                                        }
                                      />
                                      <span>
                                        {personalField.label}{' '}
                                        <span className="font-mono text-stone-500">
                                          ({personalField.key})
                                        </span>
                                      </span>
                                    </label>
                                  );
                                }
                              )}
                            </div>
                          </>
                        ) : null}
                      </div>
                    ) : null}
                  </div>
                );
              })}
            </div>

            <Button type="button" className="w-fit mt-6" onClick={onSave}>
              Opslaan
            </Button>
          </div>
        </div>
      </PageLayout>
    </div>
  );
}
