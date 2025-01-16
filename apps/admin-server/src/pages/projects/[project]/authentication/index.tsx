import * as React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useForm } from 'react-hook-form';
import { useState } from 'react';

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
import { Heading } from '@/components/ui/typography';
import { useCallback, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useProject } from '../../../../hooks/use-project';
import { Separator } from '@/components/ui/separator';
import toast from 'react-hot-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import InfoDialog from '@/components/ui/info-hover';
import {ImageUploader} from "@/components/image-uploader";
import {X} from "lucide-react";

const authTypes = [
  {
    id: 'UniqueCode',
    label: 'Unieke code',
  },
  {
    id: 'Url',
    label: 'E-mail een inloglink',
  },
  {
    id: 'Phonenumber',
    label: 'SMS verificatie',
  },
  {
    id: 'Local',
    label: 'Wachtwoord',
  },
];

const formSchema = z.object({
  authTypes: z.string().array().default([]),
  fromEmail: z.string().email().optional(),
  fromName: z.string().optional(),
  contactEmail: z.string().email().optional(),
  defaultRoleId: z.enum(['2', '3']).optional(),
  imageLogo: z.string().optional(),
  logo: z.string().optional(),
  imageFavicon: z.string().optional(),
  favicon: z.string().optional(),
});

export default function ProjectAuthentication() {

  const router = useRouter();
  const { project } = router.query;
  const {
    data,
    updateProject,
  } = useProject(['includeAuthConfig']);

  const defaults = useCallback(
    () => ({
      authTypes: data?.config?.auth?.provider?.openstad?.authTypes,
      fromEmail: data?.config?.auth?.provider?.openstad?.config?.fromEmail,
      fromName: data?.config?.auth?.provider?.openstad?.config?.fromName,
      contactEmail: data?.config?.auth?.provider?.openstad?.config?.contactEmail,
      defaultRoleId: data?.config?.auth?.provider?.openstad?.config?.defaultRoleId,
      logo: data?.config?.auth?.provider?.openstad?.config?.styling?.logo,
      favicon: data?.config?.auth?.provider?.openstad?.config?.styling?.favicon,
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
              authTypes: values.authTypes,
              config: {
                fromEmail: values.fromEmail,
                fromName: values.fromName,
                contactEmail: values.contactEmail,
                defaultRoleId: values.defaultRoleId,
                styling: {
                  logo: values.logo,
                  favicon: values.favicon,
                }
              },
            }
          }
        }
      }

      const project = await updateProject(updatedConfig);
      const doubleSave = await updateProject(updatedConfig);

      if (doubleSave && project) {
        toast.success('Project aangepast!');
      } else {
        toast.error('Er is helaas iets mis gegaan.')
      }
    } catch (error) {
      console.error('Could not update', error);
    }
  }

  const [showEmailFields, setShowEmailFields] = useState(false)
  useEffect(() => {
    // data is not available right away
    setShowEmailFields(data?.config?.auth?.provider?.openstad?.authTypes?.includes('Url'));
  }, [data]);

  const infoDialogContents: { [key: string]: string } = {
    'UniqueCode': 'Unieke code',
    'Url': 'E-mail een inloglink',
    'Phonenumber': 'SMS verificatie',
    'Local': 'Wachtwoord',
  }

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
            url: `/projects/${project}/authentication`,
          },
        ]}>
        <div className="container py-6">
          <div className="p-6 bg-white rounded-md">
            <Form {...form}>
              <Heading size="xl">Authenticatie instellingen</Heading>
              <Separator className="my-4" />
              <p className="text-gray-500">
                Hier bepaal je op welke manier gebruikers zich moeten authentificeren voor dit project.
              </p>
              <br/>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6">
                <FormField
                control={form.control}
                name="authTypes"
                render={() => (
                  <FormItem className="col-span-full">
                    <div>
                      <FormLabel>
                        Toegestaande authenticatie methoden
                      </FormLabel>
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      {authTypes.map((item) => (
                        <FormField
                          key={item.id}
                          control={form.control}
                          name="authTypes"
                          render={({ field }) => {
                            return (
                              <FormItem
                                key={item.id}
                                className="flex flex-row items-start space-x-3 space-y-0">
                                <FormControl>
                                  <Checkbox
                                    checked={field.value?.includes(item.id)}
                                    onCheckedChange={(checked: any) => {
                                      if (item.id == 'Url') setShowEmailFields(checked)
                                      return checked
                                        ? field.onChange([
                                            ...(Array.isArray(field.value) ? field.value : []),
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
                                {infoDialogContents[item.id] && <InfoDialog content={infoDialogContents[item.id]} />}
                              </FormItem>
                            );
                          }}
                        />
                      ))}
                    </div>
                  </FormItem>
                )}
              />
              <Separator className="my-4" />

              <FormField
                control={form.control}
                name="contactEmail"
                render={({ field }) => (
                  <FormItem className="col-span-full">
                    <FormLabel>E-mailadres voor contact en hulpvragen</FormLabel>
                    <FormControl>
                      <Input placeholder="" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="defaultRoleId"
                render={({ field }) => (
                  <FormItem className="col-span-full">
                    <FormLabel>
                      Welke rol krijgt een nieuwe gebruiker toegewezen?
                    </FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Standaard gebruiker" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="3">Anoniem</SelectItem>
                        <SelectItem value="2">
                          Standaard gebruiker
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

                <div className="col-span-full grid-cols-2 grid gap-4">

                  <div className="col-span-full md:col-span-1 flex flex-col">
                  <ImageUploader
                    form={form}
                    project={project as string}
                    imageLabel="Upload hier het logo voor de authenticatie omgeving"
                    fieldName="imageLogo"
                    allowedTypes={["image/*"]}
                    onImageUploaded={(imageResult) => {
                      const result = typeof (imageResult.url) !== 'undefined' ? imageResult.url : '';
                      form.setValue('logo', result);
                      form.resetField('imageLogo')
                      form.trigger('logo');
                    }}
                  />
                  </div>

                  <div className="col-span-full md:col-span-1 flex flex-col">
                    <ImageUploader
                      form={form}
                      project={project as string}
                      imageLabel="Upload hier het favicon voor de authenticatie omgeving"
                      fieldName="imageFavicon"
                      allowedTypes={["image/*"]}
                      onImageUploaded={(imageResult) => {
                        const result = typeof (imageResult.url) !== 'undefined' ? imageResult.url : '';
                        form.setValue('favicon', result);
                        form.resetField('imageFavicon')
                        form.trigger('favicon');
                      }}
                    />
                  </div>

                  <div className="col-span-full md:col-span-1 flex flex-col my-2">
                    <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Geüploade logo</label>
                    <section className="grid col-span-full grid-cols-3 gap-x-4 gap-y-8 ">
                      {!!form.watch('logo') && (
                        <div style={{ position: 'relative' }}>
                          <img src={form.watch('logo')} alt={form.watch('logo')} />
                          <Button
                            color="red"
                            onClick={() => {
                              form.setValue('logo', '');
                            }}
                            style={{
                              position: 'absolute',
                              right: 0,
                              top: 0,
                            }}>
                            <X size={24} />
                          </Button>
                        </div>
                      )}
                    </section>
                  </div>

                  <div className="col-span-full md:col-span-1 flex flex-col my-2">
                    <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Geüploade favicon</label>
                    <section className="grid col-span-full grid-cols-3 gap-x-4 gap-y-8 ">
                      {!!form.watch('favicon') && (
                        <div style={{ position: 'relative' }}>
                          <img src={form.watch('favicon')} alt={form.watch('favicon')} />
                          <Button
                            color="red"
                            onClick={() => {
                              form.setValue('favicon', '');
                            }}
                            style={{
                              position: 'absolute',
                              right: 0,
                              top: 0,
                            }}>
                            <X size={24} />
                          </Button>
                        </div>
                      )}
                    </section>
                  </div>

                </div>

              {showEmailFields ? (
              <>

              <Separator className="my-4" />
              <div>
                <FormLabel>
                  Extra instellingen voor email login:
                </FormLabel>
              </div>

              <FormField
                control={form.control}
                name="fromEmail"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Afzender adres van login e-mails
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="fromName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Naam van de afzender van login e-mails
                    </FormLabel>
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
        </div>
      </PageLayout>
    </div>
  );
}
