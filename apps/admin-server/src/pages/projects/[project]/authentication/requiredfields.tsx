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
        }
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

  const [showPageFields, setShowPageFields] = useState(false)
  useEffect(() => {
    // data is not available right away
    setShowPageFields(data?.config?.auth?.provider?.openstad?.requiredUserFields?.length > 0);
  }, [data]);
  
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
                                      setShowPageFields(field.value.length > 1 || checked)
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
                                key={item.id}
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
        </div>
      </PageLayout>
    </div>
  );
}


