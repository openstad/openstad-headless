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
  }),
});

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
      config: provider?.config || {},
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
      const brokerConfigLoaded = await fetchBrokerConfig(null, values, form.setValue);
      if (!brokerConfigLoaded) {
        throw new Error('Kon broker configuratie niet ophalen');
      }
      const newValues = form.getValues();
      await updateAuthProvider({ ...newValues, id: provider.id });
      toast.success('Auth provider is bijgewerkt');
    } catch (err: any) {
      toast.error(err.message || 'Auth provider kon niet worden bijgewerkt');
    }
  }



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
            <TabsContent value="general" className="p-0">
              <div className="p-6 bg-white rounded-md">
                <Form {...form}>
                  <Heading size="xl">Algemene instellingen</Heading>
                  <FormDescription>
                    Geef hier aan welke velden een gebruiker moet invullen als die zich aanmeldt.
                    Je kunt ook aangeven hoe de gegevens uit de authenticatiebron (bijv. IRMA) gekoppeld moeten worden aan de verplichte velden.
                    <br/><br/>
                    Laat je dit leeg, dan wordt het veld niet getoond en kan de gebruiker deze informatie niet invullen.
                    <br/><br/>
                    <strong>Let op:</strong> Als je een veld verplicht stelt, zorg er dan voor dat je een juiste mapping opgeeft zodat het veld automatisch ingevuld kan worden vanuit de authenticatiebron.
                    Als er geen waarde is om het veld automatisch in te vullen, kan de gebruiker zich niet registreren.
                    <br/><br/>
                    Zie voor de mogelijke mapping keys van jouw authenticatiebron de documentatie of vraag dit na bij de beheerder van de authenticatiebron.
                    <br/><br/><br/>
                  </FormDescription>
                  <Separator className="my-4" />
                  <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="lg:w-2/3 grid grid-cols-1 gap-4 ">

                    <FormField
                      control={form.control}
                      name={`userFieldMapping`}
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
                                    key={`field_${item.id}`}
                                    control={form.control}
                                    name={`userFieldMapping`}
                                    render={({ field }) => {
                                      const checked = !!(field.value && field.value[item.id] !== undefined);

                                      return (
                                        <FormItem
                                          className="flex flex-row items-center space-x-3 space-y-0">
                                          <FormControl>
                                            <Checkbox
                                              checked={checked}
                                              onCheckedChange={(checked: any) => {
                                                const currentValues = form.getValues(`userFieldMapping`) || {};
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
                                    const providerFields = form.watch(`userFieldMapping`) || {};

                                    if (providerFields[item.id] !== undefined) {
                                      return (
                                        <FormField
                                          key={`mapping_${providerId}_${item.id}`}
                                          control={form.control}
                                          name={`userFieldMapping.${item.id}.mapping`}
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