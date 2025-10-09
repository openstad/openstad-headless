import { PageLayout } from '@/components/ui/page-layout';
import { Plus } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/router';

import { Button } from '@/components/ui/button';
import { useAuthProvider } from '@/hooks/use-auth-providers';
import { fetchBrokerConfig } from '@/lib/fetch-broker-config';


import { useCallback, useEffect, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useForm } from 'react-hook-form';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Heading } from '@/components/ui/typography';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { toast } from 'react-hot-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import InfoDialog from '@/components/ui/info-hover';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import React from 'react';
import {Checkbox} from "@/components/ui/checkbox";
import {Spacer} from "@/components/ui/spacer";

const configureUserMapping = (
  name: string | undefined,
  email: string | undefined,
  phoneNumber: string | undefined,
  streetName: string | undefined,
  houseNumber: string | undefined,
  city: string | undefined,
  postcode: string | undefined,
) => {
  return JSON.stringify({
    identifier: "user => user['irma-demo.sidn-pbdf.uniqueid.uniqueid'] || user.id",
    name: name ? `user => (user['${name}'] || '').trim() || null` : "null",
    email: email ? `user => user['${email}'] == '' ? null : user['${email}']` : "null",
    phoneNumber: phoneNumber ? `user => user['${phoneNumber}'] == '' ? null : user['${phoneNumber}']` : "null",
    suffix: "null",
    address: (streetName && houseNumber ) ? `user => user['${streetName}'] && user['${houseNumber}'] ? (user['${streetName}'] + ' ' + user['${houseNumber}']).trim() : null` : "null",
    city: city ? `user => user['${city}'] == '' ? null : user['${city}']` : "null",
    postcode: postcode ? `user => user['${postcode}'] == '' ? null : user['${postcode}']` : "null",
    role: "user => user.role || 'admin'",
  });
}

const defaultMapping = configureUserMapping(
  "irma-demo.gemeente.personalData.fullname",
  "irma-demo.sidn-pbdf.email.email",
  "irma-demo.sidn-pbdf.phoneNumber.phoneNumber",
  "irma-demo.gemeente.address.street",
  "irma-demo.gemeente.address.housenumber",
  "irma-demo.gemeente.address.city",
  "irma-demo.gemeente.address.postalcode",
);

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
  name: z.string(),
  config: z.object({
    serverUrl: z.string(),
    clientId: z.string(),
    clientSecret: z.string(),
    pkceEnabled: z.enum(['true', 'false']).default('true'),
    serverLoginPath: z.string(),
    serverLogoutPath: z.string(),
    serverUserInfoPath: z.string(),
    serverExchangeCodePath: z.string(),
    serverExchangeContentType: z.string(),
    brokerConfiguration: z.string().optional(),
    userFieldMapping: z.object({
      name: z.string().optional(),
      email: z.string().optional(),
      phoneNumber: z.string().optional(),
      streetName: z.string().optional(),
      suffix: z.string().optional(),
      houseNumber: z.string().optional(),
      city: z.string().optional(),
      postcode: z.string().optional(),
    }).optional(),
    userMapping: z.string().optional(),
  }),
});

const defaultUserFieldMapping = requiredUserFields.reduce((acc, field) => {
  acc[field.id] = field.defaultMappingKey;
  return acc;
}, {} as Record<string, string>);

export default function AuthProviderEdit() {

  const router = useRouter();
  const { authProvider } = router.query;

  const { data, updateAuthProvider, deleteAuthProvider } = useAuthProvider(authProvider as string);

  let provider = data;
  if (Array.isArray(data)) provider = data[0];

  const defaults = useCallback(
    () => ({
      name: provider?.name || '',
      type: 'oidc',
      config: provider?.config || {
        userFieldMapping: provider?.config?.userFieldMapping || defaultUserFieldMapping,
        userMapping: provider?.config?.userMapping || defaultMapping,
      },
    }),
    [provider],
  );

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver<any>(formSchema),
    defaultValues: defaults(),
  });

  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    form.reset(defaults());
  }, [form, defaults]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      const userMapping = configureUserMapping(
        values.config.userFieldMapping?.name,
        values.config.userFieldMapping?.email,
        values.config.userFieldMapping?.phoneNumber,
        values.config.userFieldMapping?.streetName,
        values.config.userFieldMapping?.houseNumber,
        values.config.userFieldMapping?.city,
        values.config.userFieldMapping?.postcode
      );

      if (
        provider.configserverLoginPath &&
        provider.configserverLogoutPath &&
        provider.configserverUserInfoPath &&
        provider.configbrokerConfiguration &&
        provider.configserverExchangeCodePath &&
        provider.configserverExchangeContentType
      ) {
        // All required config is already set, no need to fetch broker config
        await updateAuthProvider({ ...values, userMapping, id: provider.id });
      }
      const brokerConfigLoaded = await fetchBrokerConfig(null, values, form.setValue);
      if (!brokerConfigLoaded) {
        throw new Error('Kon broker configuratie niet ophalen');
      }
      const newValues = form.getValues();
      await updateAuthProvider({ ...newValues, userMapping, id: provider.id });
      toast.success('Auth provider is bijgewerkt');
    } catch (err: any) {
      toast.error(err.message || 'Auth provider kon niet worden bijgewerkt');
    }
  }

  useEffect(() => {
    console.log( "Values", form.getValues() );
  }, [form.getValues()]);

  async function deleteProvider () {

    try {
      const deleted = await deleteAuthProvider(authProvider as string);

      if (deleted && deleted.status == 200) {
        toast.success('Auth provider is verwijderd');
        await router.push('/auth-providers');
      } else {
        toast.error(deleted.error || 'Auth provider kon niet worden verwijderd, zorg ervoor dat deze nergens meer wordt gebruikt');
      }
    } catch (err: any) {
      toast.error(err.message || 'Auth provider kon niet worden verwijderd');
    }
  }

  if (!data) return null;

  return (
    <div>
      <PageLayout
        pageHeader="Authenticatie providers"
        breadcrumbs={[
          {
            name: 'Authenticatie providers',
            url: '/auth-providers',
          },
        ]}
        action={
          <div>
            <Link href="/auth-providers/create">
              <Button variant="default" className="w-fit mr-2">
                <Plus size="20" className="hidden lg:flex" />
                Provider toevoegen
              </Button>
            </Link>
          </div>
        }>
        <div className="container py-6">
          <Tabs defaultValue="general">
            <TabsList className="w-full bg-white border-b-0 mb-4 rounded-md">
              <TabsTrigger value="general">Algemene instellingen</TabsTrigger>
              <TabsTrigger value="mapping">Gebruikers velden mapping</TabsTrigger>
            </TabsList>
            <TabsContent value="general" className="p-0">
              <div className="p-6 bg-white rounded-md">
                <Form {...form}>
                  <Heading size="xl">Algemene instellingen</Heading>
                  <FormDescription>
                    Configureer hier de authenticate provider die je wilt gebruiken voor een project. <br />
                    Dit kan momenteel alleen een OpenID Connect provider zijn, bijvoorbeeld Signicat. <br />
                    Het is verplicht een clientId en clientSecret op te geven. De overige gegevens kunnen ofwel handmatig, of
                    via de Broker configuration opgegeven worden.
                  </FormDescription>
                  <Separator className="my-4" />
                  <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="lg:w-2/3 grid grid-cols-1 gap-4 ">

                    <FormField
                      control={form.control}
                      name="name"
                      render={({field}) => (
                        <FormItem className="mt-auto">
                          <FormLabel>Naam</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage/>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="config.clientId"
                      render={({field}) => (
                        <FormItem className="mt-auto">
                          <FormLabel>Client ID</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage/>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="config.clientSecret"
                      render={({field}) => (
                        <FormItem className="mt-auto">
                          <FormLabel>Client Secret</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage/>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="config.brokerConfiguration"
                      render={({field}) => (
                        <FormItem className="mt-auto">
                          <FormLabel>Broker configuration
                            <InfoDialog
                              content={'De Broker configuration is een URL naar een JSON bestand dat de configuratie bevat van de provider, deze eindigt meestal op ".well-known/openid-configuration"'}/>
                          </FormLabel>
                          <FormControl className={'col-2'}>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage/>
                        </FormItem>
                      )}
                    />

                    <div className="col-span-full md:col-span-1 flex flex-row justify-between mt-auto">
                      <Button className="col-span-full w-fit" type="submit">
                        Opslaan
                      </Button>

                      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                        <DialogTrigger asChild>
                          <Button variant="destructive">Authenticatie provider verwijderen</Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogTitle>Bevestiging</DialogTitle>
                          <DialogDescription>
                            Weet je zeker dat je deze authenticatie provider wilt verwijderen? Dit kan alleen als deze provider niet
                            wordt gebruikt in een project.
                          </DialogDescription>
                          <DialogFooter>
                            <Button variant="secondary" onClick={() => setIsDialogOpen(false)}>
                              Annuleren
                            </Button>
                            <Button
                              variant="destructive"
                              onClick={async () => {
                                setIsDialogOpen(false);
                                await deleteProvider();
                              }}
                            >
                              Bevestigen
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </div>

                  </form>
                </Form>
              </div>
            </TabsContent>
            <TabsContent value="mapping" className="p-0">
              <div className="p-6 bg-white rounded-md">
                <Form {...form}>
                  <Heading size="xl">
                    Gebruikers velden mapping
                  </Heading>
                  <Spacer size={1} />
                  <FormDescription>
                    Je kunt aangeven hoe de gegevens uit de authenticatiebron (bijv. IRMA) gekoppeld moeten worden aan de verplichte velden.
                    <br/>
                    <strong>Let op:</strong>Als er geen waarde is opgegeven voor een veld, kan dit leiden tot fouten bij het aanmaken van een gebruiker.
                    <br/>
                    Zie voor de mogelijke mapping keys van jouw authenticatiebron de <a href="https://attribute-index.yivi.app/en/pbdf.html" target="_blank">documentatie</a> of vraag dit na bij de beheerder van de authenticatiebron.
                    <br/><br/>
                  </FormDescription>
                  <Spacer size={1} />

                  <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="lg:w-2/3 grid grid-cols-1 gap-4 ">

                    <FormField
                      control={form.control}
                      name={`config.userFieldMapping`}
                      render={() => (
                        <FormItem className="col-span-full">
                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 w-full">
                            {requiredUserFields.map((item) => {
                              const userFieldMapping = form.getValues('config.userFieldMapping');

                              return (
                                <FormField
                                  key={item.id}
                                  control={form.control}
                                  name={`config.userFieldMapping.${item.id as keyof typeof userFieldMapping}`}
                                  render={({field}) => {
                                    const getMappingField = requiredUserFields.find(i => i.id === item.id);
                                    const defaultMapping = getMappingField ? getMappingField.defaultMappingKey : '';
                                    const mappingValue = userFieldMapping?.[item.id as keyof typeof userFieldMapping] ?? defaultMapping;

                                    return (
                                      <FormItem>
                                        <FormLabel>
                                          {item.label}
                                        </FormLabel>
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
                            })}
                          </div>
                        </FormItem>
                      )}
                    />

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