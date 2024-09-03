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


const twoFactorRoles = [
  {
    id: 'admin',
    label: 'Beheerder',
  },
  {
    id: 'member',
    label: 'lid',
  },
  {
    id: 'moderator',
    label: 'Moderator',
  },
  {
    id: 'editor',
    label: 'Bewerker',
  },
];

const formSchema = z.object({
  twoFactorRoles: z.string().array().default([]),
  title: z.string().optional(),
  description: z.string().optional(),
  buttonText: z.string().optional(),
  info: z.string().optional(),
  configTitle: z.string().optional(),
  configDescription: z.string().optional(),
  configButtonText: z.string().optional(),
});

export default function ProjectAuthentication2FA() {

  const {
    data,
    updateProject,
  } = useProject(['includeAuthConfig']);

  const defaults = useCallback(
    () => ({
      twoFactorRoles: data?.config?.auth?.provider?.openstad?.twoFactorRoles || [],
      title: data?.config?.auth?.provider?.openstad?.config?.twoFactor?.title || '',
      description: data?.config?.auth?.provider?.openstad?.config?.twoFactor?.description || '',
      buttonText: data?.config?.auth?.provider?.openstad?.config?.twoFactor?.buttonText || '',
      info: data?.config?.auth?.provider?.openstad?.config?.twoFactor?.info || '',
      configTitle: data?.config?.auth?.provider?.openstad?.config?.configureTwoFactor?.title || '',
      configDescription: data?.config?.auth?.provider?.openstad?.config?.configureTwoFactor?.description || '',
      configButtonText: data?.config?.auth?.provider?.openstad?.config?.configureTwoFactor?.buttonText || '',
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
      const project = await updateProject({
        auth: {
          provider: {
            openstad: {
              twoFactorRoles: values.twoFactorRoles,
              config: {
                twoFactor: {
                  title: values.title,
                  description: values.description,
                  buttonText: values.buttonText,
                  info: values.info,
                },
                configureTwoFactor: {
                  title: values.configTitle,
                  description: values.configDescription,
                  buttonText: values.configButtonText,
                }
              },
            }
          }
        }
      });
      if (project) {
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
    setShowPageFields(data?.config?.auth?.provider?.openstad?.twoFactorRoles?.length > 0);
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
            name: 'Tweestapsverificatie',
            url: '/projects/1/authentication/2fa',
          },
        ]}>
        <div className="container py-6">
          <Form {...form} className="p-6 bg-white rounded-md">
            <Heading size="xl">Tweestapsverificatie</Heading>
            <Separator className="my-4" />
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-4 lg:w-1/2">
              <div>
                <FormLabel>
                  Gebruikers met de onderstaande rollen moeten inloggen met Tweestapsverificatie:
                </FormLabel>
              </div>

              <FormField
                control={form.control}
                name="twoFactorRoles"
                render={() => (
                  <FormItem className="col-span-full">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      {twoFactorRoles.map((item) => (
                        <FormField
                          key={item.id}
                          control={form.control}
                          name="twoFactorRoles"
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

              <Separator className="my-4" />
              <div>
                <FormLabel>
                  Als een gebruiker Tweestapsverificatie moet invullen dan doet die dat op een pagina met deze teksten:
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

              <Separator className="my-4" />
              <div>
                <FormLabel>
                  Als een gebruiker Tweestapsverificatie moet configureren dan doet die dat op een pagina met deze teksten:
                </FormLabel>
              </div>

              <FormField
                control={form.control}
                name="configTitle"
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
                name="configDescription"
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
                name="configButtonText"
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


