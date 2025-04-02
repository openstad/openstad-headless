import { RemoveResourceDialog } from '@/components/dialog-resource-remove';
import { RenameResourceDialog } from '@/components/dialog-resource-rename';
import { PageLayout } from '@/components/ui/page-layout';
import { ListHeading, Paragraph } from '@/components/ui/typography';
import { Widget, useWidgetsHook } from '@/hooks/use-widgets';
import { WidgetDefinitions } from '@/lib/widget-definitions';
import { ChevronRight, Plus } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/router';

import { Button } from '@/components/ui/button';
import { useAuthProvider } from '@/hooks/use-auth-providers';


import { useCallback, useEffect } from 'react';
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
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const formSchema = z.object({
  name: z.string(),
  config: z.object({
    serverUrl: z.string().optional(),
    clientId: z.string(),
    clientSecret: z.string(),
    pkceEnabled: z.enum(['true', 'false']).default('true'),
    userMapping: z.string().optional(),
    serverLoginPath: z.string().optional(),
    serverLogoutPath: z.string().optional(),
    serverUserInfoPath: z.string().optional(),
    serverExchangeCodePath: z.string().optional(),
    serverExchangeContentType: z.string().optional(),
    brokerConfiguration: z.string().optional(),
    /*    userName: z.string(),
        askPhoneNumber: z.enum(['true', 'false']).default('false'),*/
  }),
});

function CreateAuthProvider() {

  const router = useRouter();
  const { createAuthProvider: createAuthProviderSwr } = useAuthProvider();

  const defaults = useCallback(
    () => ({
      name: '',
      type: 'oidc',
      config: {},
    }),
    [],
  );

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver<any>(formSchema),
    defaultValues: defaults(),
  });

  useEffect(() => {
    form.reset(defaults());
  }, [form, defaults]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    console.log('submit');
    try {
      const brokerConfigLoaded = await fetchBrokerConfig(null);
      if (!brokerConfigLoaded) {
        throw new Error('Kon broker configuratie niet ophalen');
      }

      const newValues = form.getValues();
      const provider = await createAuthProviderSwr(newValues.name, newValues.config);
      toast.success('Auth provider is aangemaakt');
      await router.push(`/auth-providers/${provider.id}`);
    } catch (err: any) {
      toast.error(err.message || 'Auth provider kon niet worden aangemaakt');
    }
  }

  async function fetchBrokerConfig(e) {
    if (e) {
      e.preventDefault();
    }
    try {
      const values = form.getValues();
      console.log('values', values);
      if (!values?.config?.brokerConfiguration) {
        return;
      }

      // Ensure the URL is valid
      const url = new URL(values?.config?.brokerConfiguration);
      if (!url) {
        return;
      }
      // Fetch the broker configuration
      const res = await fetch('/api/broker-configuration', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: url.toString() }),
      });

      const data = await res.json();

      // Check if res is ok
      if (!res.ok) {
        throw new Error('Kon broker configuratie niet ophalen');
      }

      // Loop through data, and set the values in the form
      for (const [key, value] of Object.entries(data)) {
        console.log('setting value', key, value);
        form.setValue(`config.${key}`, value);
      }

      console.log('Broker config data', data);
      return true;
      //toast.success('Broker configuratie is opgehaald');
    } catch (err: any) {
      return false;
    }
  }

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
        </form>
      </Form>
    </div>
  );
}


export default function AuthProviderCreate() {

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
          <Link href="/auth-providers/create">
            <Button variant="default" className="flex w-fit">
              <Plus size="20" className="hidden lg:flex" />
              Provider toevoegen
            </Button>
          </Link>
        }>
        <div className="container py-6">
          <CreateAuthProvider />
        </div>
      </PageLayout>
    </div>
  );
}
