import * as React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Form,
} from '@/components/ui/form';
import { PageLayout } from '@/components/ui/page-layout';
import { Heading } from '@/components/ui/typography';
import { Separator } from '@/components/ui/separator';
import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useProject } from '../../../../hooks/use-project';
import toast from 'react-hot-toast';
import { useForm, useFieldArray, Controller, UseFormProps } from "react-hook-form";
import { Button } from '@/components/ui/button';

const formSchema = z.object({
  urls: z.array(z.object({
    url: z.string()
  })),
});

type Url = z.infer<typeof formSchema>['urls'][0];

function useZodForm<TSchema extends z.ZodType>(
  props: Omit<UseFormProps<TSchema["_input"]>, "resolver"> & {
    schema: TSchema;
  }
) {
  const form = useForm<TSchema["_input"]>({
    ...props,
    resolver: zodResolver(props.schema),
  });

  return form;
}

export default function ProjectSettingsWidgets() {
  const category = 'widgets';

  const router = useRouter();
  const { project } = router.query;
  const { data, isLoading, updateProject } = useProject();
  const [urls, setUrls] = useState<Url[]>(() => data?.config?.allowedDomains || []);

  const defaults = useCallback(
    () => {
      setUrls(data?.config?.allowedDomains || []);
    },
    [data]
  );

  async function onSubmit(values: z.infer<typeof formSchema>) {

    const out = values.urls.map((url) => {
      return url.url.replace(/^https?:\/\//i, '');
    });

    try {
      const newProjectConf = {
        allowedDomains: out
      };

      const project = await updateProject(newProjectConf);
      const doubleSave = await updateProject(newProjectConf);

      if (project && doubleSave) {
        toast.success('Project aangepast!');
      } else {
        toast.error('Er is helaas iets mis gegaan.')
      }
    } catch (error) {
      console.error('could not update', error);
    }
  }

  const {
    handleSubmit,
    register,
    control,
    formState: { isValid, errors, isValidating, isDirty },
    reset
  } = useZodForm({
    schema: formSchema,
    defaultValues: { urls: (data?.config?.allowedDomains ?? []).map((url: any) => ({ url })) || [] },
  });

  useEffect(() => {
    if (data?.config?.allowedDomains) {
      // set form values once the data is available
      reset({ urls: (data?.config?.allowedDomains ?? []).map((url: any) => ({ url })) });
    }
  }, [data, reset]);

  const { fields, append, remove } = useFieldArray({
    name: "urls",
    control
  });

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
            name: 'Toegestane websites',
            url: `/projects/${project}/settings/alloweddomains`,
          },
        ]}
      >
        <div className="container py-6">
          <Form className="p-6 bg-white rounded-md">
            <Heading size="xl">Toegestane websites</Heading>
            <Separator className="my-4" />
            <p className="text-gray-500">
              Hier kun je de URL’s instellen waar de widgets van dit project op mogen draaien.
            </p>
            <p className="text-gray-500">
              Let op: Widgets werken alleen op externe websites als de URL van de betreffende website hier is toegevoegd.
            </p>
            <br/>
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="lg grid grid-cols-1 gap-x-1 gap-y-1"
            >
              {fields.map((item, index) => (
                <div key={item.id} style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
                  <Controller
                    control={control}
                    name={`urls.${index}.url`}
                    defaultValue={item.url}
                    render={({ field }) => <input {...field} style={{ flex: 1, marginRight: '10px', padding: '5px', borderRadius: '4px', border: '1px solid #ccc', maxWidth: '500px' }} />}
                  />
                  <button type="button" onClick={() => remove(index)}>
                    Verwijderen
                  </button>
                </div>
              ))}
              <Button
                className="w-fit col-span-full"
                onClick={() => append({ url: "" })}
              >
                URL toevoegen
              </Button>
              <Button className="w-fit col-span-full" type="submit">
                Opslaan
              </Button>
            </form>
          </Form>
        </div>
      </PageLayout>
    </div>
  );
}
