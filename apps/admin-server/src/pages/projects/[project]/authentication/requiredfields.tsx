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
import { Input } from '@/components/ui/input';
import { PageLayout } from '@/components/ui/page-layout';
import {
  rebaselineAfterSave,
  useLooseFormDirty,
  useRegisterSave,
  validateForSave,
} from '@/components/ui/save-controller';
import { Separator } from '@/components/ui/separator';
import { Spacer } from '@/components/ui/spacer';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Heading } from '@/components/ui/typography';
import { useSyncFormDefaults } from '@/hooks/useSyncFormDefaults';
import { zodResolver } from '@hookform/resolvers/zod';
import cloneDeep from 'lodash/cloneDeep';
import { Copy, Info } from 'lucide-react';
import { useRouter } from 'next/router';
import * as React from 'react';
import { useCallback, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import * as z from 'zod';

import { useProject } from '../../../../hooks/use-project';

function CopyableVar({ value }: { value: string }) {
  return (
    <button
      type="button"
      onClick={() => {
        navigator.clipboard?.writeText(value).catch(() => null);
        toast('Tekst gekopieerd', {
          icon: <Info className="h-4 w-4 text-blue-500" />,
        });
      }}
      title={`Kopieer ${value}`}
      aria-label={`Kopieer ${value}`}
      className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-muted font-mono text-xs text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors cursor-copy">
      {value}
      <Copy className="h-3 w-3" />
    </button>
  );
}

const requiredUserFields = [
  {
    id: 'name',
    label: 'Naam',
  },
  {
    id: 'email',
    label: 'E-mailadres',
  },
  {
    id: 'phoneNumber',
    label: 'Telefoonnummer',
  },
  {
    id: 'streetName',
    label: 'Straatnaam',
  },
  {
    id: 'suffix',
    label: 'Tussenvoegsel',
  },
  {
    id: 'houseNumber',
    label: 'Huisnummer',
  },
  {
    id: 'city',
    label: 'Stad',
  },
  {
    id: 'postcode',
    label: 'Postcode',
  },
  {
    id: 'emailNotificationConsent',
    label: 'E-mail notificatie toestemming',
    defaultLabel: 'Ik ga akkoord met het ontvangen van e-mail notificaties.',
  },
  {
    id: 'privacyConsent',
    label: 'Privacy toestemming (AVG)',
    defaultLabel:
      'Ik ga akkoord met de verwerking van mijn persoonsgegevens conform de {link}',
  },
  {
    id: 'accessCode',
    label: 'Toegangscode',
  },
];

const formSchema = z.object({
  requiredUserFields: z.string().array().default([]),
  requiredUserFieldsLabels: z.record(z.string()).default({}),
  title: z.string().optional(),
  description: z.string().optional(),
  buttonText: z.string().optional(),
  info: z.string().optional(),
});

export default function ProjectAuthenticationRequiredFields() {
  const { data, updateProject } = useProject(['includeAuthConfig']);

  const router = useRouter();
  const { project } = router.query;

  const defaultLabels = requiredUserFields.reduce(
    (acc: Record<string, string>, field) => {
      acc[field.id] = '';
      return acc;
    },
    {}
  );

  const shownLabels = (stored?: Record<string, string>) => {
    const labels: Record<string, string> = { ...defaultLabels, ...stored };
    requiredUserFields.forEach((field) => {
      if (field.defaultLabel && !labels[field.id]) {
        labels[field.id] = field.defaultLabel;
      }
    });
    return labels;
  };

  // User form defaults - reads from openstad provider
  const userDefaults = useCallback(
    () => ({
      requiredUserFields:
        data?.config?.auth?.provider?.openstad?.requiredUserFields || [],
      requiredUserFieldsLabels: shownLabels(
        data?.config?.auth?.provider?.openstad?.config?.requiredFields
          ?.requiredUserFieldsLabels
      ),
      title:
        data?.config?.auth?.provider?.openstad?.config?.requiredFields?.title ||
        '',
      description:
        data?.config?.auth?.provider?.openstad?.config?.requiredFields
          ?.description || '',
      buttonText:
        data?.config?.auth?.provider?.openstad?.config?.requiredFields
          ?.buttonText || '',
      info:
        data?.config?.auth?.provider?.openstad?.config?.requiredFields?.info ||
        '',
    }),
    [data?.config]
  );

  // Anonymous form defaults - reads from anonymous provider
  const anonymousDefaults = useCallback(
    () => ({
      requiredUserFields:
        data?.config?.auth?.provider?.anonymous?.requiredUserFields || [],
      requiredUserFieldsLabels: shownLabels(
        data?.config?.auth?.provider?.anonymous?.config?.requiredFields
          ?.requiredUserFieldsLabels
      ),
      title:
        data?.config?.auth?.provider?.anonymous?.config?.requiredFields
          ?.title || '',
      description:
        data?.config?.auth?.provider?.anonymous?.config?.requiredFields
          ?.description || '',
      buttonText:
        data?.config?.auth?.provider?.anonymous?.config?.requiredFields
          ?.buttonText || '',
      info:
        data?.config?.auth?.provider?.anonymous?.config?.requiredFields?.info ||
        '',
    }),
    [data?.config]
  );

  // User form instance
  const userForm = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver<any>(formSchema),
    defaultValues: userDefaults(),
  });

  // Anonymous form instance
  const anonymousForm = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver<any>(formSchema),
    defaultValues: anonymousDefaults(),
  });

  // Guarded on the provider's `config` subtree, not on `data` or on the
  // provider itself: a save strips `provider.<x>.config` from the body
  // (api-server project.js) and answers with the raw project, so both of those
  // stay truthy afterwards while the values these forms read are gone. Only the
  // enriched GET carries `config`, so it is what tells the two apart.
  useSyncFormDefaults(
    userForm,
    userDefaults,
    data?.config?.auth?.provider?.openstad?.config
  );

  useSyncFormDefaults(
    anonymousForm,
    anonymousDefaults,
    data?.config?.auth?.provider?.anonymous?.config
  );

  const [activeTab, setActiveTab] = useState('users');

  const saveUser = useCallback(async () => {
    const valid = await validateForSave(userForm);
    if (!valid) {
      throw new Error(
        'Controleer de gemarkeerde velden op het tabblad "Gebruikers".'
      );
    }
    const values = formSchema.parse(userForm.getValues());
    const sent = cloneDeep(userForm.getValues());
    const updatedConfig = {
      auth: {
        provider: {
          openstad: {
            requiredUserFields: values.requiredUserFields,
            config: {
              requiredFields: {
                title: values.title,
                description: values.description,
                buttonText: values.buttonText,
                info: values.info,
                requiredUserFieldsLabels: values.requiredUserFieldsLabels,
              },
            },
          },
        },
      },
    };

    const result = await updateProject(updatedConfig);
    const doubleSave = await updateProject(updatedConfig);

    if (!result || !doubleSave) {
      throw new Error('Er is helaas iets mis gegaan.');
    }

    rebaselineAfterSave(userForm, sent);
  }, [userForm, updateProject]);

  const saveAnonymous = useCallback(async () => {
    const valid = await validateForSave(anonymousForm);
    if (!valid) {
      throw new Error(
        'Controleer de gemarkeerde velden op het tabblad "Anonieme gebruikers".'
      );
    }
    const values = formSchema.parse(anonymousForm.getValues());
    const sent = cloneDeep(anonymousForm.getValues());
    const updatedConfig = {
      auth: {
        provider: {
          anonymous: {
            requiredUserFields: values.requiredUserFields,
            config: {
              requiredFields: {
                title: values.title,
                description: values.description,
                buttonText: values.buttonText,
                info: values.info,
                requiredUserFieldsLabels: values.requiredUserFieldsLabels,
              },
            },
          },
        },
      },
    };

    const result = await updateProject(updatedConfig);
    const doubleSave = await updateProject(updatedConfig);

    if (!result || !doubleSave) {
      throw new Error('Er is helaas iets mis gegaan.');
    }

    rebaselineAfterSave(anonymousForm, sent);
  }, [anonymousForm, updateProject]);

  const userDirty = useLooseFormDirty(userForm);
  const anonymousDirty = useLooseFormDirty(anonymousForm);

  const save = useCallback(async () => {
    if (userDirty) await saveUser();
    if (anonymousDirty) await saveAnonymous();
  }, [userDirty, anonymousDirty, saveUser, saveAnonymous]);

  useRegisterSave({ isDirty: userDirty || anonymousDirty, save });

  const [showUserPageFields, setShowUserPageFields] = useState(false);
  const [showAnonymousPageFields, setShowAnonymousPageFields] = useState(false);

  useEffect(() => {
    setShowUserPageFields(
      data?.config?.auth?.provider?.openstad?.requiredUserFields?.length > 0
    );
  }, [data?.config?.auth?.provider?.openstad?.requiredUserFields]);

  useEffect(() => {
    setShowAnonymousPageFields(
      data?.config?.auth?.provider?.anonymous?.requiredUserFields?.length > 0
    );
  }, [data?.config?.auth?.provider?.anonymous?.requiredUserFields]);

  return (
    <div>
      <PageLayout
        breadcrumbs={[
          {
            name: 'Projecten',
            url: '/projects',
          },
          {
            name: 'Authenticatie',
            url: `/projects/${project}/authentication`,
          },
          {
            name: 'Verplichte velden',
            url: `/projects/${project}/authentication/requiredfields`,
          },
        ]}>
        <div className="container py-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="w-full bg-white border-b-0 mb-4 rounded-md">
              <TabsTrigger value="users">Gebruikers</TabsTrigger>
              <TabsTrigger value="anonymous">Anonieme gebruikers</TabsTrigger>
            </TabsList>
            <TabsContent value="users" className="p-0">
              <Form {...userForm} className="p-6 bg-white rounded-md">
                <Heading size="xl">Verplichte velden</Heading>
                <Separator className="my-4" />
                <div className="space-y-4 lg:w-1/2">
                  <div>
                    <FormLabel>
                      Een nieuwe gebruiker moet de volgende velden invullen:
                    </FormLabel>
                  </div>

                  <FormField
                    control={userForm.control}
                    name="requiredUserFields"
                    render={() => (
                      <FormItem className="col-span-full">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                          {requiredUserFields.map((item) => (
                            <FormField
                              key={item.id}
                              control={userForm.control}
                              name="requiredUserFields"
                              render={({ field }) => {
                                return (
                                  <FormItem
                                    key={item.id}
                                    className="flex flex-row items-start space-x-3 space-y-0">
                                    <FormControl>
                                      <Checkbox
                                        checked={field.value?.includes(item.id)}
                                        onCheckedChange={(checked) => {
                                          setShowUserPageFields(
                                            field.value.length > 1 ||
                                              checked === true
                                          );
                                          return checked
                                            ? field.onChange([
                                                ...field.value,
                                                item.id,
                                              ])
                                            : field.onChange(
                                                field.value?.filter(
                                                  (value) => value !== item.id
                                                )
                                              );
                                        }}
                                      />
                                    </FormControl>
                                    <FormLabel className="font-normal">
                                      {item.label}
                                    </FormLabel>
                                  </FormItem>
                                );
                              }}
                            />
                          ))}
                        </div>
                      </FormItem>
                    )}
                  />

                  {showUserPageFields ? (
                    <>
                      <Spacer size={2} />
                      <div>
                        <FormLabel>
                          Standaard staat de titel van de bovenstaande
                          geselecteerde verplichte velden als de titel boven het
                          invulveld. Hier kun je dit per verplicht veld
                          aanpassen.
                        </FormLabel>
                      </div>
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        {requiredUserFields.map((item) => {
                          const fieldValue =
                            userForm.getValues('requiredUserFieldsLabels')[
                              item.id
                            ] ?? '';
                          const defaultValue = item.defaultLabel
                            ? item.defaultLabel
                            : fieldValue;

                          return userForm
                            .watch('requiredUserFields')
                            .includes(item.id) ? (
                            <FormField
                              key={item.id}
                              control={userForm.control}
                              name={`requiredUserFieldsLabels.${item.id}`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>{item.label}</FormLabel>
                                  <FormControl>
                                    <Input
                                      {...field}
                                      placeholder={item.label}
                                      value={field.value || defaultValue}
                                      onChange={(e) => {
                                        field.onChange(
                                          e.target.value ||
                                            item.defaultLabel ||
                                            ''
                                        );
                                      }}
                                    />
                                  </FormControl>
                                  {item.id === 'privacyConsent' && (
                                    <FormDescription>
                                      Gebruik <CopyableVar value="{link}" /> om
                                      de link naar de privacyverklaring in te
                                      voegen. De URL stel je in via{' '}
                                      <a
                                        href={`/projects/${project}/authentication`}
                                        className="underline">
                                        Authenticatie → Algemeen
                                      </a>
                                      .
                                    </FormDescription>
                                  )}
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          ) : null;
                        })}
                      </div>
                      <Spacer size={5} />
                    </>
                  ) : null}

                  {showUserPageFields ? (
                    <>
                      <Separator className="my-4" />
                      <div>
                        <FormLabel>
                          Als een gebruiker één of meer van deze verplichte
                          velden moet invullen dan doet die dat op een pagina
                          met deze teksten:
                        </FormLabel>
                      </div>

                      <FormField
                        control={userForm.control}
                        name="title"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Titel</FormLabel>
                            <FormControl>
                              <Input placeholder="" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={userForm.control}
                        name="description"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Beschrijving</FormLabel>
                            <FormControl>
                              <Textarea placeholder="" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={userForm.control}
                        name="buttonText"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Knoptekst</FormLabel>
                            <FormControl>
                              <Input placeholder="" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={userForm.control}
                        name="info"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Help tekst</FormLabel>
                            <FormControl>
                              <Textarea placeholder="" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </>
                  ) : null}
                </div>
              </Form>
            </TabsContent>
            <TabsContent value="anonymous" className="p-0">
              <Form {...anonymousForm} className="p-6 bg-white rounded-md">
                <Heading size="xl">
                  Verplichte velden voor anonieme gebruikers
                </Heading>
                <Separator className="my-4" />
                <div className="space-y-4 lg:w-1/2">
                  <div>
                    <FormLabel>
                      Een anonieme gebruiker moet de volgende velden invullen:
                    </FormLabel>
                  </div>

                  <FormField
                    control={anonymousForm.control}
                    name="requiredUserFields"
                    render={() => (
                      <FormItem className="col-span-full">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                          {requiredUserFields.map((item) => (
                            <FormField
                              key={item.id}
                              control={anonymousForm.control}
                              name="requiredUserFields"
                              render={({ field }) => {
                                return (
                                  <FormItem
                                    key={item.id}
                                    className="flex flex-row items-start space-x-3 space-y-0">
                                    <FormControl>
                                      <Checkbox
                                        checked={field.value?.includes(item.id)}
                                        onCheckedChange={(checked) => {
                                          setShowAnonymousPageFields(
                                            field.value.length > 1 ||
                                              checked === true
                                          );
                                          return checked
                                            ? field.onChange([
                                                ...field.value,
                                                item.id,
                                              ])
                                            : field.onChange(
                                                field.value?.filter(
                                                  (value) => value !== item.id
                                                )
                                              );
                                        }}
                                      />
                                    </FormControl>
                                    <FormLabel className="font-normal">
                                      {item.label}
                                    </FormLabel>
                                  </FormItem>
                                );
                              }}
                            />
                          ))}
                        </div>
                      </FormItem>
                    )}
                  />

                  {showAnonymousPageFields ? (
                    <>
                      <Spacer size={2} />
                      <div>
                        <FormLabel>
                          Standaard staat de titel van de bovenstaande
                          geselecteerde verplichte velden als de titel boven het
                          invulveld. Hier kun je dit per verplicht veld
                          aanpassen.
                        </FormLabel>
                      </div>
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        {requiredUserFields.map((item) => {
                          const fieldValue =
                            anonymousForm.getValues('requiredUserFieldsLabels')[
                              item.id
                            ] ?? '';
                          const defaultValue = item.defaultLabel
                            ? item.defaultLabel
                            : fieldValue;

                          return anonymousForm
                            .watch('requiredUserFields')
                            .includes(item.id) ? (
                            <FormField
                              key={item.id}
                              control={anonymousForm.control}
                              name={`requiredUserFieldsLabels.${item.id}`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>{item.label}</FormLabel>
                                  <FormControl>
                                    <Input
                                      {...field}
                                      placeholder={item.label}
                                      value={field.value || defaultValue}
                                      onChange={(e) => {
                                        field.onChange(
                                          e.target.value ||
                                            item.defaultLabel ||
                                            ''
                                        );
                                      }}
                                    />
                                  </FormControl>
                                  {item.id === 'privacyConsent' && (
                                    <FormDescription>
                                      Gebruik <CopyableVar value="{link}" /> om
                                      de link naar de privacyverklaring in te
                                      voegen. De URL stel je in via{' '}
                                      <a
                                        href={`/projects/${project}/authentication`}
                                        className="underline">
                                        Authenticatie → Algemeen
                                      </a>
                                      .
                                    </FormDescription>
                                  )}
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          ) : null;
                        })}
                      </div>
                      <Spacer size={5} />
                    </>
                  ) : null}

                  {showAnonymousPageFields ? (
                    <>
                      <Separator className="my-4" />
                      <div>
                        <FormLabel>
                          Als een anonieme gebruiker één of meer van deze
                          verplichte velden moet invullen dan doet die dat op
                          een pagina met deze teksten:
                        </FormLabel>
                      </div>

                      <FormField
                        control={anonymousForm.control}
                        name="title"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Titel</FormLabel>
                            <FormControl>
                              <Input placeholder="" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={anonymousForm.control}
                        name="description"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Beschrijving</FormLabel>
                            <FormControl>
                              <Textarea placeholder="" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={anonymousForm.control}
                        name="buttonText"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Knoptekst</FormLabel>
                            <FormControl>
                              <Input placeholder="" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={anonymousForm.control}
                        name="info"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Help tekst</FormLabel>
                            <FormControl>
                              <Textarea placeholder="" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </>
                  ) : null}
                </div>
              </Form>
            </TabsContent>
          </Tabs>
        </div>
      </PageLayout>
    </div>
  );
}
