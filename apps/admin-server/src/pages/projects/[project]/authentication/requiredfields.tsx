import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
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
import { Separator } from '@/components/ui/separator';
import { Spacer } from '@/components/ui/spacer';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Heading } from '@/components/ui/typography';
import useAuthProvidersList, {
  useAuthProvidersEnabledCheck,
} from '@/hooks/use-auth-providers';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/router';
import * as React from 'react';
import { useCallback, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import * as z from 'zod';

import { useProject } from '../../../../hooks/use-project';

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
  authProvidersRequiredUserFields: z
    .record(z.array(z.string()).default([]))
    .default({}),
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

  // User form defaults - reads from openstad provider
  const userDefaults = useCallback(
    () => ({
      requiredUserFields:
        data?.config?.auth?.provider?.openstad?.requiredUserFields || [],
      requiredUserFieldsLabels:
        data?.config?.auth?.provider?.openstad?.config?.requiredFields
          ?.requiredUserFieldsLabels || defaultLabels,
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
      authProvidersRequiredUserFields:
        data?.config?.authProvidersRequiredUserFields || {},
    }),
    [data?.config]
  );

  // Anonymous form defaults - reads from anonymous provider
  const anonymousDefaults = useCallback(
    () => ({
      requiredUserFields:
        data?.config?.auth?.provider?.anonymous?.requiredUserFields || [],
      requiredUserFieldsLabels:
        data?.config?.auth?.provider?.anonymous?.config?.requiredFields
          ?.requiredUserFieldsLabels || defaultLabels,
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

  useEffect(() => {
    userForm.reset(userDefaults());
  }, [userForm, userDefaults]);

  useEffect(() => {
    anonymousForm.reset(anonymousDefaults());
  }, [anonymousForm, anonymousDefaults]);

  // Submit handler for user form - updates openstad provider
  async function onUserSubmit(values: z.infer<typeof formSchema>) {
    try {
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
        authProvidersRequiredUserFields:
          values?.authProvidersRequiredUserFields,
      };

      const project = await updateProject(updatedConfig);
      const doubleSave = await updateProject(updatedConfig);

      // For each auth provider we need to update the server login path
      if (project?.config?.authProvidersRequiredUserFields) {
        const authProviders = Object.keys(
          project.config.authProvidersRequiredUserFields
        );
        for (const providerId of authProviders) {
          try {
            await updateAuthProviderServerLoginPath({
              id: providerId,
              projectId: project.id,
            });
          } catch (error) {
            console.error(
              'Could not update auth provider server login path',
              error
            );
          }
        }
      }

      if (doubleSave && project) {
        toast.success('Project aangepast!');
      } else {
        toast.error('Er is helaas iets mis gegaan.');
      }
    } catch (error) {
      console.error('Could not update', error);
    }
  }

  // Submit handler for anonymous form - updates anonymous provider
  async function onAnonymousSubmit(values: z.infer<typeof formSchema>) {
    try {
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

      const project = await updateProject(updatedConfig);
      const doubleSave = await updateProject(updatedConfig);

      if (doubleSave && project) {
        toast.success('Project aangepast!');
      } else {
        toast.error('Er is helaas iets mis gegaan.');
      }
    } catch (error) {
      console.error('Could not update', error);
    }
  }

  const [showUserPageFields, setShowUserPageFields] = useState(false);
  const [showAnonymousPageFields, setShowAnonymousPageFields] = useState(false);

  const authProvidersEnabled = useAuthProvidersEnabledCheck();
  const { data: authProviders, updateAuthProviderServerLoginPath } =
    useAuthProvidersList();

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
          <Tabs defaultValue="velden-os">
            <TabsList className="w-full bg-white border-b-0 mb-4 rounded-md h-fit flex flex-wrap overflow-auto">
              <TabsTrigger value="velden-os">
                Verplichte velden OpenStad
              </TabsTrigger>
              {authProvidersEnabled &&
              authProviders &&
              authProviders.length > 0 ? (
                <TabsTrigger value="velden-ap">
                  Verplichte velden per Auth Provider
                </TabsTrigger>
              ) : null}
            </TabsList>
            <TabsContent value="velden-os" className="p-0">
              <Tabs defaultValue="users">
                <TabsList className="w-full bg-white border-b-0 mb-4 rounded-md">
                  <TabsTrigger value="users">Gebruikers</TabsTrigger>
                  <TabsTrigger value="anonymous">
                    Anonieme gebruikers
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="users" className="p-0">
                  <Form {...userForm} className="p-6 bg-white rounded-md">
                    <Heading size="xl">Verplichte velden</Heading>
                    <Separator className="my-4" />
                    <form
                      onSubmit={userForm.handleSubmit(onUserSubmit)}
                      className="space-y-4 lg:w-1/2">
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
                                            checked={field.value?.includes(
                                              item.id
                                            )}
                                            onCheckedChange={(checked: any) => {
                                              setShowUserPageFields(
                                                field.value.length > 1 ||
                                                  checked
                                              );
                                              return checked
                                                ? field.onChange([
                                                    ...field.value,
                                                    item.id,
                                                  ])
                                                : field.onChange(
                                                    field.value?.filter(
                                                      (value) =>
                                                        value !== item.id
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
                              geselecteerde verplichte velden als de titel boven
                              het invulveld. Hier kun je dit per verplicht veld
                              aanpassen.
                            </FormLabel>
                          </div>
                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                            {requiredUserFields.map((item) => {
                              const fieldValue =
                                userForm.getValues('requiredUserFieldsLabels')[
                                  item.id
                                ] ?? '';
                              const defaultValue =
                                item.id === 'emailNotificationConsent'
                                  ? 'Ik ga akkoord met het ontvangen van e-mail notificaties.'
                                  : fieldValue;
                              if (
                                item.id === 'emailNotificationConsent' &&
                                !fieldValue
                              ) {
                                userForm.setValue(
                                  `requiredUserFieldsLabels.${item.id}`,
                                  defaultValue
                                );
                              }

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
                                            field.onChange(e);
                                          }}
                                        />
                                      </FormControl>
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
                              velden moet invullen dan doet die dat op een
                              pagina met deze teksten:
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

                      <Button type="submit">Opslaan</Button>
                    </form>
                  </Form>
                </TabsContent>
                <TabsContent value="velden-ap" className="p-0">
                  <Form {...userForm} className="p-6 bg-white rounded-md">
                    <Heading size="xl">
                      Verplichte velden per Auth Provider
                    </Heading>
                    <Separator className="my-4" />
                    <p>
                      Geef hier aan welke velden een gebruiker moet invullen als
                      die zich aanmeldt. Laat je dit leeg, dan wordt deze
                      informatie niet opgevraagd bij registratie.
                      <br />
                    </p>
                    <form
                      onSubmit={userForm.handleSubmit(onUserSubmit)}
                      className="space-y-4 lg:w-2/3 mt-4">
                      {authProviders && authProviders.length > 0 ? (
                        authProviders.map(
                          (provider: {
                            id: string;
                            name: string;
                            config: {
                              userFieldMapping?: Record<string, string>;
                            };
                          }) => {
                            const providerId = provider.id;
                            const providerName = provider.name;

                            return (
                              <div key={providerId} className="mb-6">
                                <Heading size="lg">{providerName}</Heading>
                                <Separator className="my-4" />
                                <FormField
                                  control={userForm.control}
                                  name={`authProvidersRequiredUserFields.${providerId}`}
                                  render={() => (
                                    <>
                                      <FormItem className="col-span-full">
                                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                          {requiredUserFields.map((item) => {
                                            return item.id ===
                                              'suffix' ? null : (
                                              <FormField
                                                key={`field_${providerId}_${item.id}`}
                                                control={userForm.control}
                                                name={`authProvidersRequiredUserFields.${providerId}`}
                                                render={({ field }) => {
                                                  const checked =
                                                    Array.isArray(
                                                      field.value
                                                    ) &&
                                                    field.value.includes(
                                                      item.id
                                                    );

                                                  return (
                                                    <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                                                      <FormControl>
                                                        <Checkbox
                                                          checked={checked}
                                                          onCheckedChange={(
                                                            checked: any
                                                          ) => {
                                                            const userFieldMapping =
                                                              provider.config
                                                                ?.userFieldMapping ||
                                                              {};
                                                            if (
                                                              checked &&
                                                              !userFieldMapping[
                                                                item.id
                                                              ]
                                                            ) {
                                                              toast.error(
                                                                `Het veld ${item.label} is geselecteerd als verplicht, maar er is geen mapping voor opgegeven in deze Auth Provider.`
                                                              );
                                                              return;
                                                            }

                                                            const newValue =
                                                              checked
                                                                ? [
                                                                    ...(field.value ||
                                                                      []),
                                                                    item.id,
                                                                  ]
                                                                : (
                                                                    field.value ||
                                                                    []
                                                                  ).filter(
                                                                    (
                                                                      value: string
                                                                    ) =>
                                                                      value !==
                                                                      item.id
                                                                  );

                                                            field.onChange(
                                                              newValue
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
                                            );
                                          })}
                                        </div>
                                      </FormItem>
                                      {/*  <Spacer size={3} />*/}
                                      {/*</>*/}
                                    </>
                                  )}
                                />
                              </div>
                            );
                          }
                        )
                      ) : (
                        <div>Geen Auth Providers gevonden</div>
                      )}
                      <Button type="submit">Opslaan</Button>
                    </form>
                  </Form>
                </TabsContent>
                <TabsContent value="anonymous" className="p-0">
                  <Form {...anonymousForm} className="p-6 bg-white rounded-md">
                    <Heading size="xl">
                      Verplichte velden voor anonieme gebruikers
                    </Heading>
                    <Separator className="my-4" />
                    <form
                      onSubmit={anonymousForm.handleSubmit(onAnonymousSubmit)}
                      className="space-y-4 lg:w-1/2">
                      <div>
                        <FormLabel>
                          Een anonieme gebruiker moet de volgende velden
                          invullen:
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
                                            checked={field.value?.includes(
                                              item.id
                                            )}
                                            onCheckedChange={(checked: any) => {
                                              setShowAnonymousPageFields(
                                                field.value.length > 1 ||
                                                  checked
                                              );
                                              return checked
                                                ? field.onChange([
                                                    ...field.value,
                                                    item.id,
                                                  ])
                                                : field.onChange(
                                                    field.value?.filter(
                                                      (value) =>
                                                        value !== item.id
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
                              geselecteerde verplichte velden als de titel boven
                              het invulveld. Hier kun je dit per verplicht veld
                              aanpassen.
                            </FormLabel>
                          </div>
                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                            {requiredUserFields.map((item) => {
                              const fieldValue =
                                anonymousForm.getValues(
                                  'requiredUserFieldsLabels'
                                )[item.id] ?? '';
                              const defaultValue =
                                item.id === 'emailNotificationConsent'
                                  ? 'Ik ga akkoord met het ontvangen van e-mail notificaties.'
                                  : fieldValue;
                              if (
                                item.id === 'emailNotificationConsent' &&
                                !fieldValue
                              ) {
                                anonymousForm.setValue(
                                  `requiredUserFieldsLabels.${item.id}`,
                                  defaultValue
                                );
                              }

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
                                            field.onChange(e);
                                          }}
                                        />
                                      </FormControl>
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
                              verplichte velden moet invullen dan doet die dat
                              op een pagina met deze teksten:
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

                      <Button type="submit">Opslaan</Button>
                    </form>
                  </Form>
                </TabsContent>
              </Tabs>
            </TabsContent>
          </Tabs>
        </div>
      </PageLayout>
    </div>
  );
}
