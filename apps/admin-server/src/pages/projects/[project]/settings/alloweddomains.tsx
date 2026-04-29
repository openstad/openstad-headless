import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { PageLayout } from '@/components/ui/page-layout';
import { Separator } from '@/components/ui/separator';
import { Heading } from '@/components/ui/typography';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  getParentDomains,
  parseHost,
} from '@openstad-headless/lib/allowed-domains';
import { Info, X } from 'lucide-react';
import { useRouter } from 'next/router';
import * as React from 'react';
import { useEffect, useMemo } from 'react';
import {
  Controller,
  UseFormProps,
  useFieldArray,
  useForm,
} from 'react-hook-form';
import toast from 'react-hot-toast';
import * as z from 'zod';

import { useProject } from '../../../../hooks/use-project';

const formSchema = z.object({
  urls: z.array(
    z.object({
      url: z.string(),
    })
  ),
});

function useZodForm<TSchema extends z.ZodType>(
  props: Omit<UseFormProps<TSchema['_input']>, 'resolver'> & {
    schema: TSchema;
  }
) {
  const form = useForm<TSchema['_input']>({
    ...props,
    resolver: zodResolver(props.schema),
  });

  return form;
}

export default function ProjectSettingsAllowedDomains() {
  const router = useRouter();
  const { project } = router.query;
  const { data, updateProject } = useProject();

  const projectUrl = data?.url || '';
  const projectHost = useMemo(
    () => (projectUrl ? parseHost(projectUrl) : null),
    [projectUrl]
  );

  const configuredDomains: string[] = data?.config?.allowedDomains ?? [];

  const autoDomains = useMemo(() => {
    const seen = new Set<string>();

    if (projectHost) {
      seen.add(projectHost);
      for (const parent of getParentDomains(projectHost)) {
        seen.add(parent);
      }
    }

    for (const d of configuredDomains) {
      const host = parseHost(d);
      if (!host) continue;
      for (const parent of getParentDomains(host)) {
        seen.add(parent);
      }
    }

    return Array.from(seen);
  }, [projectHost, configuredDomains]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const out = values.urls
      .map((url) => url.url.replace(/^https?:\/\//i, '').trim())
      .filter((url) => url.length > 0);

    try {
      const newProjectConf = {
        allowedDomains: out,
      };

      const project = await updateProject(newProjectConf);
      const doubleSave = await updateProject(newProjectConf);

      if (project && doubleSave) {
        toast.success('Project aangepast!');
      } else {
        toast.error('Er is helaas iets mis gegaan.');
      }
    } catch (error) {
      console.error('could not update', error);
    }
  }

  const { handleSubmit, control, reset } = useZodForm({
    schema: formSchema,
    defaultValues: {
      urls: configuredDomains.map((url: string) => ({ url })),
    },
  });

  useEffect(() => {
    if (data?.config?.allowedDomains) {
      reset({
        urls: (data.config.allowedDomains as string[]).map((url) => ({ url })),
      });
    }
  }, [data, reset]);

  const { fields, append, remove } = useFieldArray({
    name: 'urls',
    control,
  });

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
            name: 'Toegestane websites',
            url: `/projects/${project}/settings/alloweddomains`,
          },
        ]}>
        <div className="container py-6">
          <Form className="p-6 bg-white rounded-md">
            <Heading size="xl">Toegestane websites</Heading>
            <Separator className="my-4" />

            <div className="space-y-4 mb-6">
              <p className="text-gray-500">
                Hier kun je de URL's instellen waar de widgets van dit project
                op mogen draaien. Widgets werken alleen op externe websites als
                de URL van de betreffende website hier is toegevoegd.
              </p>

              <div className="rounded-md border border-blue-200 bg-blue-50 p-4 space-y-3">
                <div className="flex items-start gap-2">
                  <Info size={18} className="text-blue-600 mt-0.5 shrink-0" />
                  <div className="text-sm text-blue-800 space-y-2">
                    <p className="font-medium">Hoe werkt de domeincontrole?</p>
                    <ul className="list-disc ml-4 space-y-1">
                      <li>
                        De <strong>project-URL</strong> wordt automatisch
                        toegestaan en hoeft niet apart te worden toegevoegd.
                      </li>
                      <li>
                        <strong>Bovenliggende domeinen</strong> worden
                        automatisch meegenomen. Als de project-URL bijvoorbeeld{' '}
                        <code className="bg-blue-100 px-1 rounded">
                          openstad.gemeente.nl
                        </code>{' '}
                        is, wordt{' '}
                        <code className="bg-blue-100 px-1 rounded">
                          gemeente.nl
                        </code>{' '}
                        ook toegestaan.
                      </li>
                      <li>
                        Varianten met en zonder <strong>www.</strong> worden als
                        hetzelfde domein behandeld.
                      </li>
                      <li>
                        Systeemdomeinen (zoals de CMS- en auth-server) worden
                        automatisch toegestaan, inclusief hun bovenliggende
                        domeinen.
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              {autoDomains.length > 0 && (
                <div className="rounded-md border border-gray-200 bg-gray-50 p-4">
                  <p className="text-sm font-medium text-gray-700 mb-2">
                    Automatisch toegestane domeinen
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {autoDomains.map((domain) => (
                      <span
                        key={domain}
                        className="inline-flex items-center rounded-md bg-green-50 px-2.5 py-1 text-sm text-green-700 border border-green-200">
                        {domain}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <Heading size="lg" className="mb-3">
              Handmatig toegevoegde domeinen
            </Heading>

            <form
              onSubmit={handleSubmit(onSubmit)}
              className="grid grid-cols-1 gap-y-2">
              {fields.map((item, index) => (
                <div key={item.id} className="flex items-center gap-2 max-w-lg">
                  <Controller
                    control={control}
                    name={`urls.${index}.url`}
                    defaultValue={item.url}
                    render={({ field }) => (
                      <Input
                        {...field}
                        placeholder="voorbeeld.nl"
                        className="flex-1"
                      />
                    )}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => remove(index)}>
                    <X size={16} />
                  </Button>
                </div>
              ))}
              <div className="flex gap-2 mt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => append({ url: '' })}>
                  URL toevoegen
                </Button>
                <Button type="submit">Opslaan</Button>
              </div>
            </form>
          </Form>
        </div>
      </PageLayout>
    </div>
  );
}
