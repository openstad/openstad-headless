import * as React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useForm } from 'react-hook-form';
import { useCallback, useEffect } from 'react';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import toast from 'react-hot-toast';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { PageLayout } from '@/components/ui/page-layout';
import { Heading } from '@/components/ui/typography';
import { Separator } from '@/components/ui/separator';

const formSchema = z.object({
  UniqueCodeTitle: z.string().optional(),
  UniqueCodeDescription: z.string().optional(),
  UniqueCodeLabel: z.string().optional(),
  UniqueCodeButtonText: z.string().optional(),
  UniqueCodeHelpText: z.string().optional(),
  UrlTitle: z.string().optional(),
  UrlDescription: z.string().optional(),
  UrlLabel: z.string().optional(),
  UrlButtonText: z.string().optional(),
  UrlHelpText: z.string().optional(),
  SMS1Title: z.string().optional(),
  SMS1Subtitle: z.string().optional(),
  SMS1Description: z.string().optional(),
  SMS1Label: z.string().optional(),
  SMS1ButtonText: z.string().optional(),
  SMS1HelpText: z.string().optional(),
  SMS2Title: z.string().optional(),
  SMS2Subtitle: z.string().optional(),
  SMS2Description: z.string().optional(),
  SMS2Label: z.string().optional(),
  SMS2ButtonText: z.string().optional(),
  SMS2HelpText: z.string().optional(),
  LocalTitle: z.string().optional(),
  LocalDescription: z.string().optional(),
  LocalEmailLabel: z.string().optional(),
  LocalPasswordLabel: z.string().optional(),
  LocalButtonText: z.string().optional(),
  LocalHelpText: z.string().optional(),
  LocalForgotPasswordText: z.string().optional(),
});

export default function ProjectAuthentication() {

  const {
    data,
    updateProject,
  } = useProject(['includeAuthConfig']);

  

  const defaults = useCallback(
    () => ({
      UniqueCodeTitle: data?.config?.auth?.provider?.openstad?.config?.authTypes?.UniqueCode?.title || '',
      UniqueCodeDescription: data?.config?.auth?.provider?.openstad?.config?.authTypes?.UniqueCode?.description || '',
      UniqueCodeLabel: data?.config?.auth?.provider?.openstad?.config?.authTypes?.UniqueCode?.label || '',
      UniqueCodeButtonText: data?.config?.auth?.provider?.openstad?.config?.authTypes?.UniqueCode?.buttonText || '',
      UniqueCodeHelpText: data?.config?.auth?.provider?.openstad?.config?.authTypes?.UniqueCode?.helpText || '',
      UrlTitle: data?.config?.auth?.provider?.openstad?.config?.authTypes?.Url?.title || '',
      UrlDescription: data?.config?.auth?.provider?.openstad?.config?.authTypes?.Url?.description || '',
      UrlLabel: data?.config?.auth?.provider?.openstad?.config?.authTypes?.Url?.label || '',
      UrlButtonText: data?.config?.auth?.provider?.openstad?.config?.authTypes?.Url?.buttonText || '',
      UrlHelpText: data?.config?.auth?.provider?.openstad?.config?.authTypes?.Url?.helpText || '',
      SMS1Title: data?.config?.auth?.provider?.openstad?.config?.authTypes?.Phonenumber?.loginTitle || '',
      SMS1Subtitle: data?.config?.auth?.provider?.openstad?.config?.authTypes?.Phonenumber?.loginSubtitle || '',
      SMS1Description: data?.config?.auth?.provider?.openstad?.config?.authTypes?.Phonenumber?.loginDescription || '',
      SMS1Label: data?.config?.auth?.provider?.openstad?.config?.authTypes?.Phonenumber?.loginLabel || '',
      SMS1ButtonText: data?.config?.auth?.provider?.openstad?.config?.authTypes?.Phonenumber?.loginButtonText || '',
      SMS1HelpText: data?.config?.auth?.provider?.openstad?.config?.authTypes?.Phonenumber?.loginHelpText || '',
      SMS2Title: data?.config?.auth?.provider?.openstad?.config?.authTypes?.Phonenumber?.smsCodeTitle || '',
      SMS2Subtitle: data?.config?.auth?.provider?.openstad?.config?.authTypes?.Phonenumber?.smsCodeSubtitle || '',
      SMS2Description: data?.config?.auth?.provider?.openstad?.config?.authTypes?.Phonenumber?.smsCodeDescription || '',
      SMS2Label: data?.config?.auth?.provider?.openstad?.config?.authTypes?.Phonenumber?.smsCodeLabel || '',
      SMS2ButtonText: data?.config?.auth?.provider?.openstad?.config?.authTypes?.Phonenumber?.smsCodeButtonText || '',
      SMS2HelpText: data?.config?.auth?.provider?.openstad?.config?.authTypes?.Phonenumber?.smsCodeHelpText || '',
      LocalTitle: data?.config?.auth?.provider?.openstad?.config?.authTypes?.Local?.title || '',
      LocalDescription: data?.config?.auth?.provider?.openstad?.config?.authTypes?.Local?.description || '',
      LocalEmailLabel: data?.config?.auth?.provider?.openstad?.config?.authTypes?.Local?.emailLabel || '',
      LocalPasswordLabel: data?.config?.auth?.provider?.openstad?.config?.authTypes?.Local?.passwordLabel || '',
      LocalButtonText: data?.config?.auth?.provider?.openstad?.config?.authTypes?.Local?.buttonText || '',
      LocalHelpText: data?.config?.auth?.provider?.openstad?.config?.authTypes?.Local?.helpText || '',
      LocalForgotPasswordText: data?.config?.auth?.provider?.openstad?.config?.authTypes?.Local?.forgotPasswordText || '',
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
              config: {
                UniqueCode: {
                  title: values.UniqueCodeTitle,
                  description: values.UniqueCodeDescription,
                  label: values.UniqueCodeLabel,
                  buttonText: values.UniqueCodeButtonText,
                  helpText: values.UniqueCodeHelpText,
                },
                Url: {
                  title: values.UrlTitle,
                  description: values.UrlDescription,
                  label: values.UrlLabel,
                  buttonText: values.UrlButtonText,
                  helpText: values.UrlHelpText,
                },
                Phonenumber: {
                  loginTitle: values.SMS1Title,
                  loginSubtitle: values.SMS1Subtitle,
                  loginDescription: values.SMS1Description,
                  loginLabel: values.SMS1Label,
                  loginButtonText: values.SMS1ButtonText,
                  loginHelpText: values.SMS1HelpText,
                  smsCodeTitle: values.SMS2Title,
                  smsCodeSubtitle: values.SMS2Subtitle,
                  smsCodeDescription: values.SMS2Description,
                  smsCodeLabel: values.SMS2Label,
                  smsCodeButtonText: values.SMS2ButtonText,
                  smsCodeHelpText: values.SMS2HelpText,
                },
                Local: {
                  title: values.LocalTitle,
                  description: values.LocalDescription,
                  emailLabel: values.LocalEmailLabel,
                  passwordLabel: values.LocalPasswordLabel,
                  buttonText: values.LocalButtonText,
                  helpText: values.LocalHelpText,
                  forgotPasswordText: values.LocalForgotPasswordText,
                },
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
            name: 'Login pagina&apos;s',
            url: '/projects/1/authentication/loginpaginas',
          },
        ]}>
        <div className="container py-6">
          <Tabs defaultValue="UniqueCode">
            <TabsList className="w-full bg-white border-b-0 mb-4 rounded-md">
              <TabsTrigger value="UniqueCode">Unieke code</TabsTrigger>
              <TabsTrigger value="Url">E-mail een inloglink</TabsTrigger>
              <TabsTrigger value="Phonenumber">SMS</TabsTrigger>
              <TabsTrigger value="Local">Wachtwoord</TabsTrigger>
            </TabsList>

            <TabsContent value="UniqueCode" className="p-0">
              <div className="p-6 bg-white rounded-md">
                <Form {...form}>
                  <Heading size="xl">Login pagina voor Unieke code</Heading>
                  <Separator className="my-4" />
                  <div>
                    <FormLabel>
                      Deze teksten staan op de pagina waar gebruikers met een unieke code inloggen.
                    </FormLabel>
                  </div>
                  <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="lg:w-1/2 grid grid-cols-1 gap-4">

                    <FormField
                      control={form.control}
                      name="UniqueCodeTitle"
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
                      name="UniqueCodeDescription"
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
                      name="UniqueCodeLabel"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Label bij het invoerveld</FormLabel>
                          <FormControl>
                            <Input placeholder="" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="UniqueCodeButtonText"
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
                      name="UniqueCodeHelpText"
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

                    <Button className="w-fit col-span-full" type="submit">
                      Opslaan
                    </Button>
                  </form>
                </Form>
              </div>
            </TabsContent>

            <TabsContent value="Url" className="p-0">
              <div className="p-6 bg-white rounded-md">
                <Form {...form}>
                  <Heading size="xl">Login pagina voor E-mail een loginlink</Heading>
                  <Separator className="my-4" />
                  <div>
                    <FormLabel>
                      Als een gebruiker inlogt via een loginlink in een e-mail dan doet die dat op een een pagina met deze teksten:
                    </FormLabel>
                  </div>
                  <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="lg:w-1/2 grid grid-cols-1 gap-4">

                    <FormField
                      control={form.control}
                      name="UrlTitle"
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
                      name="UrlDescription"
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
                      name="UrlLabel"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Label bij het invoerveld</FormLabel>
                          <FormControl>
                            <Input placeholder="" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="UrlButtonText"
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
                      name="UrlHelpText"
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

                    <Button className="w-fit col-span-full" type="submit">
                      Opslaan
                    </Button>
                  </form>
                </Form>
              </div>
            </TabsContent>

            <TabsContent value="Phonenumber" className="p-0">
              <div className="p-6 bg-white rounded-md">
                <Form {...form}>
                  <Heading size="xl">Pagina&apos;s voor SMS authenticatie</Heading>
                  <Separator className="my-4" />
                  <div>
                    <FormLabel>
                      Authenticatie met SMS gaat in twee stappen: het invoeren van je telefoonnummer en dan het invullen van de code die je hebt ontvangen.
                    </FormLabel>
                  </div>
                  <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="lg:w-1/2 grid grid-cols-1 gap-4">

                    <div>
                      <FormLabel>
                        Teksten voor de eerste pagina (invoeren telefoonnummer):
                      </FormLabel>
                    </div>

                    <FormField
                      control={form.control}
                      name="SMS1Title"
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
                      name="SMS1Subtitle"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Subtitle</FormLabel>
                          <FormControl>
                            <Input placeholder="" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="SMS1Description"
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
                      name="SMS1Label"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Label bij het invoerveld</FormLabel>
                          <FormControl>
                            <Input placeholder="" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="SMS1ButtonText"
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
                      name="SMS1HelpText"
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

                    <div>
                      <FormLabel>
                        Teksten voor de tweede pagina (invoeren code):
                      </FormLabel>
                    </div>

                    <FormField
                      control={form.control}
                      name="SMS2Title"
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
                      name="SMS2Subtitle"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Subtitle</FormLabel>
                          <FormControl>
                            <Input placeholder="" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="SMS2Description"
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
                      name="SMS2Label"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Label bij het invoerveld</FormLabel>
                          <FormControl>
                            <Input placeholder="" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="SMS2ButtonText"
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
                      name="SMS2HelpText"
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

                    <Button className="w-fit col-span-full" type="submit">
                      Opslaan
                    </Button>
                  </form>
                </Form>
              </div>
            </TabsContent>

              <TabsContent value="Local" className="p-0">
                <div className="p-6 bg-white rounded-md">
                  <Form {...form}>
                    <Heading size="xl">Login met wachtwoord pagina</Heading>
                    <Separator className="my-4" />
                    <div>
                      <FormLabel>
                        Deze teksten staan op de pagina waar gebruikers met een wachtwoord inloggen.
                      </FormLabel>
                    </div>
                    <form
                      onSubmit={form.handleSubmit(onSubmit)}
                      className="lg:w-1/2 grid grid-cols-1 gap-4">
  
                      <FormField
                        control={form.control}
                        name="LocalTitle"
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
                        name="LocalDescription"
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
                        name="LocalEmailLabel"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Label bij het invoerveld gebruikers naam / e-mail</FormLabel>
                            <FormControl>
                              <Input placeholder="" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
  
                      <FormField
                        control={form.control}
                        name="LocalPasswordLabel"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Label bij het invoerveld wachtwoord</FormLabel>
                            <FormControl>
                              <Input placeholder="" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
  
                      <FormField
                        control={form.control}
                        name="LocalButtonText"
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
                        name="LocalHelpText"
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

                      <FormField
                        control={form.control}
                        name="LocalForgotPasswordText"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Tekst voor &apos;wachtwoord vergeten&apos;</FormLabel>
                            <FormControl>
                              <Textarea placeholder="" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
  
                      <Button className="w-fit col-span-full" type="submit">
                        Opslaan
                      </Button>
                    </form>
                  </Form>
                </div>
              </TabsContent>

          </Tabs>
        </div>
      </PageLayout>
    </div>
  );
}


