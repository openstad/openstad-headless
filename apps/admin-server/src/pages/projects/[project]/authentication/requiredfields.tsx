import * as React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useForm } from 'react-hook-form';
import { useState, useCallback, useEffect } from 'react';
import { useProject } from '../../../../hooks/use-project';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import toast from 'react-hot-toast';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { PageLayout } from '@/components/ui/page-layout';
import { Heading } from '@/components/ui/typography';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';
import { Spacer } from "@/components/ui/spacer";
import useAuthProvidersList, {useAuthProvidersEnabledCheck} from "@/hooks/use-auth-providers";
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs";

const requiredUserFields = [
  {
    id: 'name',
    label: 'Naam',
    defaultMappingKey: "irma-demo.gemeente.personalData.fullname"
  },
  {
    id: 'email',
    label: 'E-mailadres',
    defaultMappingKey: "irma-demo.sidn-pbdf.email.email"
  },
  {
    id: 'phoneNumber',
    label: 'Telefoonnummer',
    defaultMappingKey: "irma-demo.sidn-pbdf.phoneNumber.phoneNumber"
  },
  {
    id: 'streetName',
    label: 'Straatnaam',
    defaultMappingKey: "irma-demo.gemeente.address.street"
  },
  {
    id: 'suffix',
    label: 'Tussenvoegsel',
    defaultMappingKey: "irma-demo.gemeente.personalData.infix"
  },
  {
    id: 'houseNumber',
    label: 'Huisnummer',
    defaultMappingKey: "irma-demo.gemeente.address.housenumber"
  },
  {
    id: 'city',
    label: 'Stad',
    defaultMappingKey: "irma-demo.gemeente.address.city"
  },
  {
    id: 'postcode',
    label: 'Postcode',
    defaultMappingKey: "irma-demo.gemeente.address.postalcode"
  },
];

const formSchema = z.object({
  requiredUserFields: z.string().array().default([]),
  requiredUserFieldsLabels: z.record(z.string()).default({}),
  title: z.string().optional(),
  description: z.string().optional(),
  buttonText: z.string().optional(),
  info: z.string().optional(),
  authProvidersRequiredUserFields: z.record(
    z.record(
      z.object({
        mapping: z.string().optional()
      }).optional()
    ).optional()
  ).optional(),
});

export default function ProjectAuthenticationRequiredFields() {

  const {
    data,
    updateProject,
  } = useProject(['includeAuthConfig']);

  const defaultLabels = requiredUserFields.reduce((acc: Record<string, string>, field) => {
    acc[field.id] = '';
    return acc;
  }, {});

  const defaults = useCallback(
    () => ({
      requiredUserFields: data?.config?.auth?.provider?.openstad?.requiredUserFields || [],
      requiredUserFieldsLabels: data?.config?.auth?.provider?.openstad?.config?.requiredFields?.requiredUserFieldsLabels || defaultLabels,
      title: data?.config?.auth?.provider?.openstad?.config?.requiredFields?.title || '',
      description: data?.config?.auth?.provider?.openstad?.config?.requiredFields?.description || '',
      buttonText: data?.config?.auth?.provider?.openstad?.config?.requiredFields?.buttonText || '',
      info: data?.config?.auth?.provider?.openstad?.config?.requiredFields?.info || '',
      authProvidersRequiredUserFields: data?.config?.authProvidersRequiredUserFields || {},
    }),
    [data?.config]
  );

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver<any>(formSchema),
    defaultValues: defaults(),
  });

  useEffect(() => {
    form.reset(defaults());
  }, [form, defaults]);
  
  async function onSubmit(values: z.infer<typeof formSchema>) {

    console.log( 'Waardes', values );
    return;

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
                }
              },
            }
          }
        },
        authProvidersRequiredUserFields: values?.authProvidersRequiredUserFields
      };

      const project = await updateProject(updatedConfig);
      const doubleSave = await updateProject(updatedConfig);

      if ( doubleSave && project ) {
        toast.success('Project aangepast!');
      } else {
        toast.error('Er is helaas iets mis gegaan.')
      }
    } catch (error) {
      console.error('Could not update', error);
    }
  }

  const selectedUserFields = form.watch('requiredUserFields');
  const showPageFields = Array.isArray(selectedUserFields) && selectedUserFields.length > 0;

  const authProvidersEnabled = useAuthProvidersEnabledCheck();
  const { data: authProviders } = useAuthProvidersList();
  
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
            name: 'Authenticatie',
            url: '/projects/1/authentication',
          },
          {
            name: 'Verplichte velden',
            url: '/projects/1/authentication/requiredfields',
          },
        ]}>
        <div className="container py-6">
          <Tabs defaultValue="velden-os">
            <TabsList className="w-full bg-white border-b-0 mb-4 rounded-md h-fit flex flex-wrap overflow-auto">
              <TabsTrigger value="velden-os">Verplichte velden OpenStad</TabsTrigger>
              {authProvidersEnabled && authProviders && authProviders.length > 0 ? (
                  <TabsTrigger value="velden-ap">Verplichte velden per Auth Provider</TabsTrigger>
              ) : null}
            </TabsList>
            <TabsContent value="velden-os" className="p-0">
              <Form {...form} className="p-6 bg-white rounded-md">
                <Heading size="xl">Verplichte velden</Heading>
                <Separator className="my-4" />
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-4 lg:w-1/2">
                  <div>
                    <FormLabel>
                      Een nieuwe gebruiker moet de volgende velden invullen:
                    </FormLabel>
                  </div>

                  <FormField
                    control={form.control}
                    name="requiredUserFields"
                    render={() => (
                      <FormItem className="col-span-full">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                          {requiredUserFields.map((item) => (
                            <FormField
                              key={item.id}
                              control={form.control}
                              name="requiredUserFields"
                              render={({ field }) => {
                                return (
                                  <FormItem
                                    key={item.id}
                                    className="flex flex-row items-start space-x-3 space-y-0">
                                    <FormControl>
                                      <Checkbox
                                        checked={field.value?.includes(item.id)}
                                        onCheckedChange={(checked: any) => {
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

                  {showPageFields ? (
                      <>
                        <Spacer size={2} />
                        <div>
                          <FormLabel>
                            Standaard staat de titel van de bovenstaande geselecteerde verplichte velden als de titel boven het invulveld. Hier kun je dit per verplicht veld aanpassen.
                          </FormLabel>
                        </div>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                          {requiredUserFields.map((item) => {
                            const fieldValue = form.getValues('requiredUserFieldsLabels')[item.id] ?? '';
                            return form.watch('requiredUserFields').includes(item.id) ? (
                                <FormField
                                    key={`openstad_${item.id}`}
                                    control={form.control}
                                    name={`requiredUserFieldsLabels.${item.id}`}
                                    render={({field}) => (
                                        <FormItem>
                                          <FormLabel>{item.label}</FormLabel>
                                          <FormControl>
                                            <Input
                                                placeholder={item.label}
                                                defaultValue={fieldValue}
                                                onChange={(e) => {
                                                  field.onChange(e);
                                                }}
                                            />

                                          </FormControl>
                                          <FormMessage/>
                                        </FormItem>
                                    )}
                                />
                            ) : null
                          })}
                        </div>
                        <Spacer size={5} />
                      </>
                  ) : null}

                  {showPageFields ? (
                  <>
                  <Separator className="my-4" />
                  <div>
                    <FormLabel>
                      Als een gebruiker één of meer van deze verplichte velden moet invullen dan doet die dat op een pagina met deze teksten:
                    </FormLabel>
                  </div>

                  <FormField
                    control={form.control}
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
                    control={form.control}
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
                    control={form.control}
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
                    control={form.control}
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
              <Form {...form} className="p-6 bg-white rounded-md">
                <Heading size="xl">Verplichte velden per Auth Provider</Heading>
                <Separator className="my-4" />
                <p>
                  Geef hier aan welke velden een gebruiker moet invullen als die zich aanmeldt.
                  Je kunt ook aangeven hoe de gegevens uit de authenticatiebron (bijv. IRMA) gekoppeld moeten worden aan de verplichte velden.
                  <br/>
                  <br/>
                  Laat je dit leeg, dan wordt het veld niet getoond en kan de gebruiker deze informatie niet invullen.
                  <br/>
                  <br/>
                  <strong>Let op:</strong> Als je een veld verplicht stelt, zorg er dan voor dat je een juiste mapping opgeeft zodat het veld automatisch ingevuld kan worden vanuit de authenticatiebron.
                  Als er geen waarde is om het veld automatisch in te vullen, kan de gebruiker zich niet registreren.
                  <br/>
                  <br/>
                  Zie voor de mogelijke mapping keys van jouw authenticatiebron de documentatie of vraag dit na bij de beheerder van de authenticatiebron.
                  <br/>
                  <br/>
                  <br/>
                </p>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-4 lg:w-2/3"
                >
                  {authProviders && authProviders.length > 0 ? (
                      authProviders.map((provider: {id: string, name: string}) => {
                        const providerId = provider.id;
                        const providerName = provider.name;

                        return (
                            <div key={providerId} className="mb-6">
                              <Heading size="lg">{providerName}</Heading>
                              <Separator className="my-4" />
                              <FormField
                                  control={form.control}
                                  name={`authProvidersRequiredUserFields.${providerId}`}
                                  render={() => (
                                    <>
                                      <FormItem className="col-span-full">
                                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

                                          <strong className="mt-3">
                                            Verplicht veld
                                          </strong>
                                          <strong className="mt-3">
                                            Mapping key authenticatiebron
                                          </strong>

                                          {requiredUserFields.map((item) => (
                                            <>
                                              <FormField
                                                  key={`field_${providerId}_${item.id}`}
                                                  control={form.control}
                                                  name={`authProvidersRequiredUserFields.${providerId}`}
                                                  render={({ field }) => {
                                                    const checked = !!(field.value && field.value[item.id] !== undefined);

                                                    return (
                                                        <FormItem
                                                            className="flex flex-row items-center space-x-3 space-y-0">
                                                          <FormControl>
                                                            <Checkbox
                                                                checked={checked}
                                                                onCheckedChange={(checked: any) => {
                                                                  const currentValues = form.getValues(`authProvidersRequiredUserFields.${providerId}`) || {};
                                                                  if ( checked ) {
                                                                    field.onChange({
                                                                      ...currentValues,
                                                                      [item.id]: {
                                                                        mapping: currentValues[item.id]?.mapping || item.defaultMappingKey
                                                                      }
                                                                    });
                                                                  } else {
                                                                    const {[item.id]: _, ...rest} = currentValues;
                                                                    field.onChange(rest);
                                                                  }
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
                                              {(() => {
                                                const providerFields = form.watch(`authProvidersRequiredUserFields.${providerId}`) || {};

                                                if (providerFields[item.id] !== undefined) {
                                                  return (
                                                    <FormField
                                                      key={`mapping_${providerId}_${item.id}`}
                                                      control={form.control}
                                                      name={`authProvidersRequiredUserFields.${providerId}.${item.id}.mapping`}
                                                      render={({field}) => {
                                                        const fieldValue = form.getValues('authProvidersRequiredUserFields') || {};
                                                        const providerFields = fieldValue[providerId] || {};
                                                        const itemField = providerFields[item.id] || {};
                                                        const mappingValue = itemField['mapping'];

                                                        return (
                                                          <FormItem>
                                                            <FormControl>
                                                              <Input
                                                                defaultValue={mappingValue}
                                                                onChange={(e) => {
                                                                  field.onChange(e);
                                                                }}
                                                              />
                                                            </FormControl>
                                                            <FormMessage/>
                                                          </FormItem>
                                                        )
                                                      }}
                                                    />
                                                  )
                                                } else {
                                                  return <div></div>
                                                }

                                              })()}
                                          </>
                                        ))}
                                      </div>
                                    </FormItem>
                                      <Spacer size={3} />
                                  </>
                                )}
                            />

                          </div>
                        )
                      })
                  ) : (
                      <div>Geen Auth Providers gevonden</div>
                  )}
                  <Button type="submit">Opslaan</Button>
                </form>
              </Form>
            </TabsContent>

          </Tabs>
        </div>
      </PageLayout>
    </div>
  );
}


