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
import { Separator } from '@/components/ui/separator';
import { Heading } from '@/components/ui/typography';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/router';
import * as React from 'react';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import * as z from 'zod';

import { useProject } from '../../../../hooks/use-project';

const formSchema = z.object({
  certificateMethod: z.enum(['cert-manager', 'external']),
  externalCertSlug: z
    .string()
    .regex(/^[a-z0-9-]*$/, {
      message: 'Alleen kleine letters, cijfers en streepjes toegestaan',
    })
    .optional()
    .or(z.literal('')),
});

function CertStatusBadge({ state }: { state?: string }) {
  const config: Record<string, { label: string; className: string }> = {
    linked: { label: 'Gekoppeld', className: 'bg-green-100 text-green-800' },
    configured: {
      label: 'Geconfigureerd',
      className: 'bg-blue-100 text-blue-800',
    },
    pending: {
      label: 'In afwachting',
      className: 'bg-yellow-100 text-yellow-800',
    },
    error: { label: 'Fout', className: 'bg-red-100 text-red-800' },
  };
  const { label, className } = config[state || ''] || {
    label: 'Niet geconfigureerd',
    className: 'bg-gray-100 text-gray-800',
  };
  return (
    <span
      className={`${className} px-2 py-1 rounded text-sm font-medium`}
      aria-label={`Certificaatstatus: ${label}`}>
      {label}
    </span>
  );
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
      const certs = data.config.certificates || {};
      form.reset({
        certificateMethod:
          certs.certificateMethod ||
          data.config.certificateMethod ||
          'cert-manager',
        externalCertSlug:
          certs.externalCertSlug || data.config.externalCertSlug || '',
      });
    }
  }, [data, form]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      const result = await updateProject({
        certificates: {
          certificateMethod: values.certificateMethod,
          externalCertSlug: values.externalCertSlug || '',
        },
      });
      if (result) {
        toast.success('Certificaatinstellingen opgeslagen!');
        mutate();
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
      const res = await fetch(
        `/api/openstad/api/project/${project}/certificate-retry`,
        {
          method: 'POST',
        }
      );
      const data = await res.json();
      if (res.ok) {
        toast.success('Certificaat controle uitgevoerd!');
        mutate(); // refresh project data
      } else if (res.status === 429) {
        toast.error(
          `Wacht nog ${data.retryAfter} seconden voor een nieuwe poging.`
        );
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
  const certInfo = data?.hostStatus?.certificate;
  const certStatus = certInfo?.state;
  const secretName = certInfo?.secretName;

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
            name: 'TLS Certificaat (SSL)',
            url: `/projects/${project}/settings/certificates`,
          },
        ]}>
        <div className="container py-6">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="p-6 bg-white rounded-md">
              <Heading size="xl">TLS Certificaat (SSL)</Heading>
              <Separator className="my-4" />

              {/* Certificate Method */}
              <FormField
                control={form.control}
                name="certificateMethod"
                render={({ field }) => (
                  <FormItem className="mb-6">
                    <FormLabel>Certificaatmethode</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger className="max-w-md">
                          <SelectValue placeholder="Kies methode" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="cert-manager">
                          cert-manager (standaard)
                        </SelectItem>
                        <SelectItem value="external">
                          Extern certificaat
                        </SelectItem>
                      </SelectContent>
                    </Select>
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
                </>
              )}

              {/* Certificate Status — shown for both methods */}
              <div className="mb-6">
                <FormLabel>Huidige status</FormLabel>
                <div className="mt-2">
                  <CertStatusBadge state={certStatus} />
                </div>
              </div>

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
                    disabled={retryLoading || isLoading}>
                    {retryLoading
                      ? 'Bezig...'
                      : 'Certificaat opnieuw controleren'}
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
