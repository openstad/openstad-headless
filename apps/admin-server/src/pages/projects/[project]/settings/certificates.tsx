import * as React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
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
import { Heading } from '@/components/ui/typography';
import { Separator } from '@/components/ui/separator';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useProject } from '../../../../hooks/use-project';
import toast from 'react-hot-toast';
import { useForm } from "react-hook-form";
import { Button } from '@/components/ui/button';

const formSchema = z.object({
  certificateMethod: z.enum(['cert-manager', 'external']),
  externalCertSlug: z.string()
    .regex(/^[a-z0-9-]*$/, { message: 'Alleen kleine letters, cijfers en streepjes toegestaan' })
    .optional()
    .or(z.literal('')),
});

function CertStatusBadge({ state }: { state?: string }) {
  const config: Record<string, { label: string; className: string }> = {
    linked: { label: 'Gekoppeld', className: 'bg-green-100 text-green-800' },
    pending: { label: 'In afwachting', className: 'bg-yellow-100 text-yellow-800' },
    error: { label: 'Fout', className: 'bg-red-100 text-red-800' },
  };
  const { label, className } = config[state || ''] || { label: 'Niet geconfigureerd', className: 'bg-gray-100 text-gray-800' };
  return <span className={`${className} px-2 py-1 rounded text-sm font-medium`} aria-label={`Certificaatstatus: ${label}`}>{label}</span>;
}

export default function ProjectSettingsCertificates() {
  const router = useRouter();
  const { project } = router.query;
  const { data, isLoading, updateProject, mutate } = useProject();
  const [retryLoading, setRetryLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      certificateMethod: 'cert-manager',
      externalCertSlug: '',
    },
  });

  useEffect(() => {
    if (data?.config) {
      form.reset({
        certificateMethod: data.config.certificateMethod || 'cert-manager',
        externalCertSlug: data.config.externalCertSlug || '',
      });
    }
  }, [data, form]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      const result = await updateProject({
        certificateMethod: values.certificateMethod,
        externalCertSlug: values.externalCertSlug || undefined,
      });
      if (result) {
        toast.success('Certificaatinstellingen opgeslagen!');
      } else {
        toast.error('Er is helaas iets mis gegaan.');
      }
    } catch (e) {
      toast.error('Er is helaas iets mis gegaan.');
    }
  }

  async function handleRetry() {
    setRetryLoading(true);
    try {
      const res = await fetch(`/api/openstad/api/project/${project}/certificate-retry`, {
        method: 'POST',
      });
      const data = await res.json();
      if (res.ok) {
        toast.success('Certificaat controle uitgevoerd!');
        mutate(); // refresh project data
      } else if (res.status === 429) {
        toast.error(`Wacht nog ${data.retryAfter} seconden voor een nieuwe poging.`);
      } else {
        toast.error(data.error || 'Er is iets mis gegaan.');
      }
    } catch (error) {
      toast.error('Er is iets mis gegaan.');
    }
    setRetryLoading(false);
  }

  const certificateMethod = form.watch('certificateMethod');
  const showExternalCertConfig = certificateMethod === 'external';
  const certStatus = data?.hostStatus?.externalCert?.state;
  const secretName = data?.hostStatus?.externalCert?.secretName;

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
            url: `/projects/${project}/settings`,
          },
          {
            name: 'TLS Certificaat (SSL)',
            url: `/projects/${project}/settings/certificates`,
          },
        ]}
      >
        <div className="container py-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="p-6 bg-white rounded-md">
              <Heading size="xl">TLS Certificaat (SSL)</Heading>
              <Separator className="my-4" />

              {/* Certificate Method */}
              <FormField
                control={form.control}
                name="certificateMethod"
                render={({ field }) => (
                  <FormItem className="mb-6">
                    <FormLabel>Certificaatmethode</FormLabel>
                    <FormControl>
                      <fieldset>
                        <div className="flex gap-4 mt-2">
                          <label className="flex items-center gap-2">
                            <input
                              type="radio"
                              value="cert-manager"
                              checked={field.value === 'cert-manager'}
                              onChange={() => field.onChange('cert-manager')}
                            />
                            cert-manager (standaard)
                          </label>
                          <label className="flex items-center gap-2">
                            <input
                              type="radio"
                              value="external"
                              checked={field.value === 'external'}
                              onChange={() => field.onChange('external')}
                            />
                            Extern certificaat
                          </label>
                        </div>
                      </fieldset>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* External Certificate Config */}
              {showExternalCertConfig && (
                <>
                  <FormField
                    control={form.control}
                    name="externalCertSlug"
                    render={({ field }) => (
                      <FormItem className="mb-6">
                        <FormLabel>Certificaat slug (optioneel)</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="mijn-certificaat"
                            className="max-w-md"
                          />
                        </FormControl>
                        <p className="text-sm text-gray-500 mt-1">
                          Laat leeg voor automatische naamgeving.
                        </p>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Secret Name Display */}
                  {secretName && (
                    <div className="mb-6">
                      <FormLabel>Secret naam</FormLabel>
                      <div className="mt-2 p-3 bg-gray-50 rounded border border-gray-200">
                        <code className="text-sm">{secretName}</code>
                      </div>
                    </div>
                  )}

                  {/* Certificate Status */}
                  <div className="mb-6">
                    <FormLabel>Huidige status</FormLabel>
                    <div className="mt-2">
                      <CertStatusBadge state={certStatus} />
                    </div>
                  </div>
                </>
              )}

              {/* Actions */}
              <div className="flex gap-4">
                <Button type="submit" disabled={isLoading}>
                  Opslaan
                </Button>
                {showExternalCertConfig && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleRetry}
                    disabled={retryLoading || isLoading}
                  >
                    {retryLoading ? 'Bezig...' : 'Certificaat opnieuw controleren'}
                  </Button>
                )}
              </div>
            </form>
          </Form>
        </div>
      </PageLayout>
    </div>
  );
}
