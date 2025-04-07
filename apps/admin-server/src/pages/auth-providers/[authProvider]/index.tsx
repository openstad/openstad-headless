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

const formSchema = z.object({
  name: z.string(),
  config: z.object({
    serverUrl: z.string(),
    clientId: z.string(),
    clientSecret: z.string(),
    pkceEnabled: z.enum(['true', 'false']).default('true'),
    userMapping: z.string(),
    serverLoginPath: z.string(),
    serverLogoutPath: z.string(),
    serverUserInfoPath: z.string(),
    serverExchangeCodePath: z.string(),
    serverExchangeContentType: z.string(),
    brokerConfiguration: z.string().optional(),
    /*    userName: z.string(),
        askPhoneNumber: z.enum(['true', 'false']).default('false'),*/
  }),
});

function EditAuthProvider() {

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
            render={({ field }) => (
              <FormItem className="mt-auto">
                <FormLabel>Naam</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="config.clientId"
            render={({ field }) => (
              <FormItem className="mt-auto">
                <FormLabel>Client ID</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="config.clientSecret"
            render={({ field }) => (
              <FormItem className="mt-auto">
                <FormLabel>Client Secret</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="config.brokerConfiguration"
            render={({ field }) => (
              <FormItem className="mt-auto">
                <FormLabel>Broker configuration
                  <InfoDialog
                    content={'De Broker configuration is een URL naar een JSON bestand dat de configuratie bevat van de provider, deze eindigt meestal op ".well-known/openid-configuration"'} />
                </FormLabel>
                <FormControl className={'col-2'}>
                  <Input {...field} />
                </FormControl>
                {/*<Button className={'col-2'} onClick={fetchBrokerConfig}>Haal configuratie op</Button>*/}
                <FormMessage />
              </FormItem>
            )}
          />

          {/*<FormField
                control={form.control}
                name="config.userName"
                render={({ field }) => (
                  <FormItem className="mt-auto">
                    <FormLabel>Gebruikersnaam</FormLabel>
                    <FormControl>
                      <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Volledige naam" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="irma-demo.gemeente.personalData.fullname">Volledige naam</SelectItem>
                        <SelectItem value="irma-demo.gemeente.personalData.surname">Achternaam</SelectItem>
                        <SelectItem value="irma-demo.gemeente.personalData.firstnames">Voornamen</SelectItem>
                        <SelectItem value="irma-demo.gemeente.personalData.initials">Initialen</SelectItem>
                      </SelectContent>
                    </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="config.askPhoneNumber"
                render={({ field }) => (
                  <FormItem className="mt-auto">
                    <FormLabel>Vraag telefoonnummer op</FormLabel>
                    <FormControl>
                      <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Ja" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="true">Ja</SelectItem>
                        <SelectItem value="false">Nee</SelectItem>
                      </SelectContent>
                    </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />*/}

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
                        Weet je zeker dat je deze authenticatie provider wilt verwijderen? Dit kan alleen als deze provider niet wordt gebruikt in een project.
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
        </form>
      </Form>
    </div>
  );
}


export default function AuthProviderEdit() {

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
            </TabsList>
            <TabsContent value="general" className="p-0">
              <EditAuthProvider />
            </TabsContent>
          </Tabs>
        </div>
      </PageLayout>
    </div>
  );
}
