import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import InfoDialog from '@/components/ui/info-hover';
import { Input } from '@/components/ui/input';
import { PageLayout } from '@/components/ui/page-layout';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Spacer } from '@/components/ui/spacer';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Heading } from '@/components/ui/typography';
import { useAuthProvider } from '@/hooks/use-auth-providers';
import { fetchBrokerConfig } from '@/lib/fetch-broker-config';
import { zodResolver } from '@hookform/resolvers/zod';
import { Plus } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useCallback, useEffect, useState } from 'react';
import React from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import * as z from 'zod';

type YiviAttribute = {
  id: string;
  name: { en: string; nl: string };
  identifier: string;
};

type YiviCredential = {
  id: string;
  name: { en: string; nl: string };
  attributes: YiviAttribute[];
};

type YiviIssuer = {
  id: string;
  name: { en: string; nl: string };
  credentials: Record<string, YiviCredential>;
};

type YiviScheme = {
  id: string;
  name: { en: string; nl: string };
  issuers: Record<string, YiviIssuer>;
};

function detectScheme(
  userFieldMapping: Record<string, string> | undefined
): string {
  if (!userFieldMapping) return '';
  const firstValue = Object.values(userFieldMapping).find(
    (v) => v && v.includes('.')
  );
  return firstValue?.split('.')[0] || '';
}

function getIssuerFromIdentifier(identifier: string): string {
  return identifier?.split('.')?.[1] || '';
}

function getIssuers(
  yiviIndex: YiviScheme[],
  schemeId: string
): { id: string; name: string }[] {
  const scheme = yiviIndex.find((s) => s.id === schemeId);
  if (!scheme) return [];
  return Object.values(scheme.issuers).map((issuer) => ({
    id: issuer.id,
    name: issuer.name.nl || issuer.name.en,
  }));
}

function getAttributesForIssuer(
  yiviIndex: YiviScheme[],
  schemeId: string,
  issuerId: string
): { identifier: string; label: string }[] {
  const scheme = yiviIndex.find((s) => s.id === schemeId);
  if (!scheme) return [];
  const issuer = scheme.issuers[issuerId];
  if (!issuer) return [];

  const result: { identifier: string; label: string }[] = [];
  for (const credential of Object.values(issuer.credentials)) {
    for (const attribute of credential.attributes) {
      result.push({
        identifier: attribute.identifier,
        label: `${credential.name.nl || credential.name.en}: ${attribute.name.nl || attribute.name.en}`,
      });
    }
  }
  return result;
}

const configureUserMapping = (
  identifier?: string,
  name?: string,
  email?: string,
  phoneNumber?: string,
  streetName?: string,
  houseNumber?: string,
  city?: string,
  postcode?: string
) => {
  const mapping: Record<string, string> = {
    role: 'member',
  };

  if (identifier)
    mapping.identifier = `user => user['${identifier}'] || user.id`;
  if (name) mapping.name = `user => (user['${name}'] || '').trim() || null`;
  if (email)
    mapping.email = `user => user['${email}'] == '' ? null : user['${email}']`;
  if (phoneNumber)
    mapping.phoneNumber = `user => user['${phoneNumber}'] == '' ? null : user['${phoneNumber}']`;
  if (streetName && houseNumber)
    mapping.address = `user => user['${streetName}'] && user['${houseNumber}'] ? (user['${streetName}'] + ' ' + user['${houseNumber}']).trim() : null`;
  if (city)
    mapping.city = `user => user['${city}'] == '' ? null : user['${city}']`;
  if (postcode)
    mapping.postcode = `user => user['${postcode}'] == '' ? null : user['${postcode}']`;

  return JSON.stringify(mapping);
};

const requiredUserFields = [
  {
    id: 'identifier',
    label: 'Unieke ID (identifier)',
  },
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
    scheme: z.string().optional(),
    userFieldMapping: z
      .object({
        identifier: z.string().optional(),
        name: z.string().optional(),
        email: z.string().optional(),
        phoneNumber: z.string().optional(),
        streetName: z.string().optional(),
        houseNumber: z.string().optional(),
        city: z.string().optional(),
        postcode: z.string().optional(),
      })
      .optional(),
    userFieldRequiredMapping: z.record(z.boolean()).optional(),
    userMapping: z.string().optional(),
  }),
});

const hasBrokerConfigLoaded = (config: any) => {
  return (
    config.serverUrl &&
    config.clientId &&
    config.clientSecret &&
    config.serverLogoutPath &&
    config.serverUserInfoPath &&
    config.serverExchangeCodePath
  );
};

export default function AuthProviderEdit() {
  const router = useRouter();
  const { authProvider } = router.query;

  const {
    data,
    updateAuthProvider,
    deleteAuthProvider,
    updateServerLoginPathForEachAffectedProject,
  } = useAuthProvider(authProvider as string);

  let provider = data;
  if (Array.isArray(data)) provider = data[0];

  const defaults = useCallback(
    () => ({
      name: provider?.name || '',
      type: 'oidc',
      config: {
        serverUrl: provider?.config?.serverUrl || '',
        clientId: provider?.config?.clientId || '',
        clientSecret: provider?.config?.clientSecret || '',
        pkceEnabled: provider?.config?.pkceEnabled || 'true',
        serverLoginPath: provider?.config?.serverLoginPath || '',
        serverLogoutPath: provider?.config?.serverLogoutPath || '',
        serverUserInfoPath: provider?.config?.serverUserInfoPath || '',
        serverExchangeCodePath: provider?.config?.serverExchangeCodePath || '',
        serverExchangeContentType:
          provider?.config?.serverExchangeContentType ||
          'application/x-www-form-urlencoded',
        brokerConfiguration: provider?.config?.brokerConfiguration || '',
        scheme:
          provider?.config?.scheme ||
          detectScheme(provider?.config?.userFieldMapping),
        userFieldMapping: provider?.config?.userFieldMapping || {},
        userFieldRequiredMapping:
          provider?.config?.userFieldRequiredMapping || {},
        userMapping: provider?.config?.userMapping || configureUserMapping(),
      },
    }),
    [provider]
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
        values.config?.userFieldMapping?.identifier,
        values.config?.userFieldMapping?.name,
        values.config?.userFieldMapping?.email,
        values.config?.userFieldMapping?.phoneNumber,
        values.config?.userFieldMapping?.streetName,
        values.config?.userFieldMapping?.houseNumber,
        values.config?.userFieldMapping?.city,
        values.config?.userFieldMapping?.postcode
      );

      if (values.config && !hasBrokerConfigLoaded(values.config)) {
        const brokerConfigLoaded = await fetchBrokerConfig(
          null,
          values,
          form.setValue
        );
        if (!brokerConfigLoaded) {
          throw new Error('Kon broker configuratie niet ophalen');
        }
      }

      const newValues = form.getValues();

      // Merge extra fields into userFieldMapping and userFieldRequiredMapping
      for (const ef of extraFields) {
        if (ef.key && ef.attribute) {
          (newValues.config.userFieldMapping as any)[`extraData.${ef.key}`] =
            ef.attribute;
          (newValues.config.userFieldRequiredMapping as any)[
            `extraData.${ef.key}`
          ] = ef.required;
        }
      }

      await updateAuthProvider({ ...newValues, userMapping, id: provider.id });
      await updateServerLoginPathForEachAffectedProject({ id: provider.id });

      toast.success('Auth provider is bijgewerkt');
    } catch (err: any) {
      toast.error(err.message || 'Auth provider kon niet worden bijgewerkt');
    }
  }

  const [yiviIndex, setYiviIndex] = useState<YiviScheme[]>([]);
  const [fieldIssuers, setFieldIssuers] = useState<Record<string, string>>({});

  type ExtraField = {
    key: string;
    issuer: string;
    attribute: string;
    required: boolean;
  };
  const [extraFields, setExtraFields] = useState<ExtraField[]>([]);

  useEffect(() => {
    fetch('/api/attribute-index')
      .then((r) => r.json())
      .then((data) => {
        // API returns a single scheme object, normalise to array
        setYiviIndex(Array.isArray(data) ? data : [data]);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const mapping = (form.getValues('config.userFieldMapping') || {}) as Record<
      string,
      string
    >;
    const derived: Record<string, string> = {};
    for (const [fieldId, identifier] of Object.entries(mapping)) {
      if (identifier) derived[fieldId] = getIssuerFromIdentifier(identifier);
    }
    setFieldIssuers(derived);

    const requiredMapping = (provider?.config?.userFieldRequiredMapping ||
      {}) as Record<string, boolean>;
    const extra: ExtraField[] = Object.entries(mapping)
      .filter(([key]) => key.startsWith('extraData.'))
      .map(([key, attribute]) => ({
        key: key.slice('extraData.'.length),
        issuer: getIssuerFromIdentifier(attribute as string),
        attribute: attribute as string,
        required: requiredMapping[key] ?? false,
      }));
    setExtraFields(extra);
  }, [provider]);

  async function deleteProvider() {
    try {
      const deleted = await deleteAuthProvider(authProvider as string);

      if (deleted && deleted.status == 200) {
        toast.success('Auth provider is verwijderd');
        await router.push('/auth-providers');
      } else {
        toast.error(
          deleted.error ||
            'Auth provider kon niet worden verwijderd, zorg ervoor dat deze nergens meer wordt gebruikt'
        );
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
              <TabsTrigger value="mapping">
                Gebruikers velden mapping
              </TabsTrigger>
            </TabsList>
            <TabsContent value="general" className="p-0">
              <div className="p-6 bg-white rounded-md">
                <Form {...form}>
                  <Heading size="xl">Algemene instellingen</Heading>
                  <FormDescription>
                    Configureer hier de authenticate provider die je wilt
                    gebruiken voor een project. <br />
                    Dit kan momenteel alleen een OpenID Connect provider zijn,
                    bijvoorbeeld Signicat. <br />
                    Het is verplicht een clientId en clientSecret op te geven.
                    De overige gegevens kunnen ofwel handmatig, of via de Broker
                    configuration opgegeven worden.
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
                          <FormLabel>
                            Broker configuration
                            <InfoDialog
                              content={
                                'De Broker configuration is een URL naar een JSON bestand dat de configuratie bevat van de provider, deze eindigt meestal op ".well-known/openid-configuration"'
                              }
                            />
                          </FormLabel>
                          <FormControl className={'col-2'}>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="col-span-full md:col-span-1 flex flex-row justify-between mt-auto">
                      <Button className="col-span-full w-fit" type="submit">
                        Opslaan
                      </Button>

                      <Dialog
                        open={isDialogOpen}
                        onOpenChange={setIsDialogOpen}>
                        <DialogTrigger asChild>
                          <Button variant="destructive">
                            Authenticatie provider verwijderen
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogTitle>Bevestiging</DialogTitle>
                          <DialogDescription>
                            Weet je zeker dat je deze authenticatie provider
                            wilt verwijderen? Dit kan alleen als deze provider
                            niet wordt gebruikt in een project.
                          </DialogDescription>
                          <DialogFooter>
                            <Button
                              variant="secondary"
                              onClick={() => setIsDialogOpen(false)}>
                              Annuleren
                            </Button>
                            <Button
                              variant="destructive"
                              onClick={async () => {
                                setIsDialogOpen(false);
                                await deleteProvider();
                              }}>
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
                  <Heading size="xl">Gebruikers velden mapping</Heading>
                  <Spacer size={1} />
                  <FormDescription>
                    Geef hier aan welk Yivi-attribuut gekoppeld moet worden aan
                    elk gebruikersveld. Selecteer eerst het schema, daarna
                    verschijnen de beschikbare attributen per uitgever.
                  </FormDescription>
                  <Spacer size={1} />
                  <FormDescription>
                    Per veld kun je instellen of het <strong>optioneel</strong>{' '}
                    of <strong>verplicht</strong> is. Bij optionele velden kan
                    de gebruiker inloggen zonder dat attribuut — het veld blijft
                    dan leeg. Bij verplichte velden moet de gebruiker het
                    bijbehorende Yivi-attribuut in zijn wallet hebben om in te
                    loggen.
                  </FormDescription>
                  <Spacer size={1} />

                  <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="w-full grid grid-cols-1 gap-4">
                    <FormField
                      control={form.control}
                      name="config.scheme"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Schema</FormLabel>
                          <Select
                            onValueChange={(value) => {
                              field.onChange(value);
                              setFieldIssuers({ identifier: 'sidn-pbdf' });
                              requiredUserFields.forEach((f) => {
                                form.setValue(
                                  `config.userFieldMapping.${f.id}` as any,
                                  f.id === 'identifier'
                                    ? `${value}.sidn-pbdf.uniqueid.uniqueid`
                                    : ''
                                );
                              });
                            }}
                            value={field.value || ''}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecteer schema" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="irma-demo">
                                irma-demo (Demo)
                              </SelectItem>
                              <SelectItem value="pbdf">
                                pbdf (Productie)
                              </SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="w-full rounded-md border overflow-hidden">
                      {requiredUserFields.map((item, index) => {
                        const scheme = form.watch('config.scheme');
                        const issuers = getIssuers(yiviIndex, scheme || '');
                        const selectedIssuer = fieldIssuers[item.id] || '';
                        const attributes = getAttributesForIssuer(
                          yiviIndex,
                          scheme || '',
                          selectedIssuer
                        );

                        const fieldValue = form.watch(
                          `config.userFieldMapping.${item.id}` as any
                        );
                        const isRequired =
                          form.watch(
                            `config.userFieldRequiredMapping.${item.id}` as any
                          ) ?? false;

                        return (
                          <FormField
                            key={item.id}
                            control={form.control}
                            name={`config.userFieldMapping.${item.id}` as any}
                            render={({ field }) => (
                              <FormItem
                                className={`px-4 py-3 ${index % 2 === 0 ? 'bg-white' : 'bg-muted/40'}`}>
                                <FormLabel className="text-sm font-medium">
                                  {item.label}
                                  {item.id === 'identifier' && (
                                    <span className="ml-1 text-red-500">*</span>
                                  )}
                                </FormLabel>
                                <div className="flex items-center gap-2">
                                  {item.id === 'identifier' &&
                                  issuers.length > 0 ? (
                                    <FormControl>
                                      <Input
                                        value={field.value || ''}
                                        disabled
                                        className="bg-muted font-mono text-xs flex-1"
                                      />
                                    </FormControl>
                                  ) : issuers.length > 0 ? (
                                    <>
                                      <Select
                                        value={selectedIssuer || '__none__'}
                                        onValueChange={(value) => {
                                          const issuerId =
                                            value === '__none__' ? '' : value;
                                          setFieldIssuers((prev) => ({
                                            ...prev,
                                            [item.id]: issuerId,
                                          }));
                                          field.onChange('');
                                        }}>
                                        <SelectTrigger className="flex-1">
                                          <SelectValue placeholder="Uitgever" />
                                        </SelectTrigger>
                                        <SelectContent>
                                          <SelectItem value="__none__">
                                            — Uitgever —
                                          </SelectItem>
                                          {issuers.map((issuer) => (
                                            <SelectItem
                                              key={issuer.id}
                                              value={issuer.id}>
                                              {issuer.name}
                                            </SelectItem>
                                          ))}
                                        </SelectContent>
                                      </Select>
                                      <Select
                                        value={field.value || '__none__'}
                                        onValueChange={(value) =>
                                          field.onChange(
                                            value === '__none__' ? '' : value
                                          )
                                        }
                                        disabled={!selectedIssuer}>
                                        <FormControl>
                                          <SelectTrigger className="flex-1">
                                            <SelectValue
                                              placeholder={
                                                selectedIssuer
                                                  ? 'Attribuut'
                                                  : '—'
                                              }
                                            />
                                          </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                          <SelectItem value="__none__">
                                            — Niet mappen —
                                          </SelectItem>
                                          {attributes.map((attr) => (
                                            <SelectItem
                                              key={attr.identifier}
                                              value={attr.identifier}>
                                              {attr.label}
                                            </SelectItem>
                                          ))}
                                        </SelectContent>
                                      </Select>
                                    </>
                                  ) : (
                                    <FormControl>
                                      <Input
                                        {...field}
                                        className="flex-1"
                                        placeholder={
                                          !scheme
                                            ? 'Selecteer eerst een schema'
                                            : scheme === 'irma-demo'
                                              ? 'Voer handmatig in (bijv. irma-demo.sidn-pbdf.email.email)'
                                              : 'Attributen laden...'
                                        }
                                      />
                                    </FormControl>
                                  )}
                                  {item.id !== 'identifier' && fieldValue && (
                                    <label className="flex items-center gap-2 text-sm cursor-pointer select-none shrink-0 ml-2">
                                      <span
                                        className={
                                          isRequired
                                            ? 'text-muted-foreground'
                                            : 'font-medium'
                                        }>
                                        Optioneel
                                      </span>
                                      <Switch
                                        checked={isRequired}
                                        onCheckedChange={(checked) => {
                                          form.setValue(
                                            `config.userFieldRequiredMapping.${item.id}` as any,
                                            !!checked
                                          );
                                        }}
                                      />
                                      <span
                                        className={
                                          isRequired
                                            ? 'font-medium'
                                            : 'text-muted-foreground'
                                        }>
                                        Verplicht
                                      </span>
                                    </label>
                                  )}
                                </div>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        );
                      })}
                    </div>

                    <div>
                      <h3 className="text-sm font-semibold mb-1">
                        Extra velden
                      </h3>
                      <p className="text-sm text-muted-foreground mb-2">
                        Velden die niet in de standaardlijst staan worden
                        opgeslagen in{' '}
                        <code className="text-xs bg-muted px-1 rounded">
                          extraData
                        </code>{' '}
                        op het gebruikersobject. Kies een korte sleutelnaam
                        (bijv.{' '}
                        <code className="text-xs bg-muted px-1 rounded">
                          bsn
                        </code>
                        ,{' '}
                        <code className="text-xs bg-muted px-1 rounded">
                          gender
                        </code>
                        ) en koppel een Yivi-attribuut.
                      </p>
                      <p className="text-sm text-amber-600 font-medium mb-3">
                        ⚠️ Let op: gegevens in{' '}
                        <code className="text-xs bg-amber-100 px-1 rounded">
                          extraData
                        </code>{' '}
                        zijn standaard publiek zichtbaar voor iedereen. Sla hier
                        geen gevoelige persoonsgegevens op (zoals BSN).
                      </p>
                      <div className="rounded-md border overflow-hidden">
                        {extraFields.map((ef, index) => {
                          const scheme = form.watch('config.scheme');
                          const issuers = getIssuers(yiviIndex, scheme || '');
                          const attributes = getAttributesForIssuer(
                            yiviIndex,
                            scheme || '',
                            ef.issuer
                          );

                          return (
                            <div
                              key={index}
                              className={`px-4 py-3 flex items-center gap-2 ${index % 2 === 0 ? 'bg-white' : 'bg-muted/40'}`}>
                              <Input
                                value={ef.key}
                                onChange={(e) =>
                                  setExtraFields((prev) =>
                                    prev.map((f, i) =>
                                      i === index
                                        ? { ...f, key: e.target.value }
                                        : f
                                    )
                                  )
                                }
                                placeholder="sleutel"
                                className="w-40 shrink-0 font-mono"
                              />
                              <Select
                                value={ef.issuer || '__none__'}
                                onValueChange={(value) => {
                                  setExtraFields((prev) =>
                                    prev.map((f, i) =>
                                      i === index
                                        ? {
                                            ...f,
                                            issuer:
                                              value === '__none__' ? '' : value,
                                            attribute: '',
                                          }
                                        : f
                                    )
                                  );
                                }}>
                                <SelectTrigger className="flex-1">
                                  <SelectValue placeholder="Uitgever" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="__none__">
                                    — Uitgever —
                                  </SelectItem>
                                  {issuers.map((issuer) => (
                                    <SelectItem
                                      key={issuer.id}
                                      value={issuer.id}>
                                      {issuer.name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <Select
                                value={ef.attribute || '__none__'}
                                onValueChange={(value) =>
                                  setExtraFields((prev) =>
                                    prev.map((f, i) =>
                                      i === index
                                        ? {
                                            ...f,
                                            attribute:
                                              value === '__none__' ? '' : value,
                                          }
                                        : f
                                    )
                                  )
                                }
                                disabled={!ef.issuer}>
                                <SelectTrigger className="flex-1">
                                  <SelectValue
                                    placeholder={ef.issuer ? 'Attribuut' : '—'}
                                  />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="__none__">
                                    — Niet mappen —
                                  </SelectItem>
                                  {attributes.map((attr) => (
                                    <SelectItem
                                      key={attr.identifier}
                                      value={attr.identifier}>
                                      {attr.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <label className="flex items-center gap-2 text-sm cursor-pointer select-none shrink-0 ml-2">
                                <span
                                  className={
                                    ef.required
                                      ? 'text-muted-foreground'
                                      : 'font-medium'
                                  }>
                                  Optioneel
                                </span>
                                <Switch
                                  checked={ef.required}
                                  onCheckedChange={(checked) =>
                                    setExtraFields((prev) =>
                                      prev.map((f, i) =>
                                        i === index
                                          ? { ...f, required: !!checked }
                                          : f
                                      )
                                    )
                                  }
                                />
                                <span
                                  className={
                                    ef.required
                                      ? 'font-medium'
                                      : 'text-muted-foreground'
                                  }>
                                  Verplicht
                                </span>
                              </label>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="shrink-0 text-muted-foreground hover:text-destructive"
                                onClick={() =>
                                  setExtraFields((prev) =>
                                    prev.filter((_, i) => i !== index)
                                  )
                                }>
                                ✕
                              </Button>
                            </div>
                          );
                        })}
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="mt-2"
                        onClick={() =>
                          setExtraFields((prev) => [
                            ...prev,
                            {
                              key: '',
                              issuer: '',
                              attribute: '',
                              required: false,
                            },
                          ])
                        }>
                        + Veld toevoegen
                      </Button>
                    </div>

                    <div className="col-span-full md:col-span-1 flex flex-row justify-between mt-auto">
                      <Button className="col-span-full w-fit" type="submit">
                        Opslaan
                      </Button>
                    </div>
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
