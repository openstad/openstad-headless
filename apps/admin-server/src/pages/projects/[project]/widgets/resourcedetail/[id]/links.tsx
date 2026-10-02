import { CheckboxList } from '@/components/checkbox-list';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Heading } from '@/components/ui/typography';
import usePluginCapabilities from '@/hooks/use-plugin-capabilities';
import useTags from '@/hooks/use-tags';
import { YesNoSelect } from '@/lib/form-widget-helpers';
import { EditFieldProps } from '@/lib/form-widget-helpers/EditFieldProps';
import { fromCsvIds, toggleCsvId } from '@/lib/link-settings';
import { zodResolver } from '@hookform/resolvers/zod';
import { ResourceDetailWidgetProps } from '@openstad-headless/resource-detail/src/resource-detail';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';
import React from 'react';
import { ControllerRenderProps, useForm } from 'react-hook-form';
import * as z from 'zod';

const TrixEditor = dynamic(
  () =>
    import('@openstad-headless/ui/src/form-elements/text/index').then(
      (mod) => mod.TrixEditor
    ),
  {
    ssr: false,
    loading: () => (
      <div className="h-32 bg-gray-100 animate-pulse rounded border" />
    ),
  }
);

const DEFAULT_HANDLER = 'default';

const formSchema = z.object({
  relatedResources: z.object({
    display: z.boolean(),
    title: z.string().optional(),
    layout: z.enum(['default', 'compact']),
    displayTitle: z.boolean(),
    displayImage: z.boolean(),
    displaySummary: z.boolean(),
    linkToDetail: z.boolean(),
    itemLink: z.string().optional(),
    tagIds: z.string().optional(),
  }),
  contactBlock: z.object({
    display: z.boolean(),
    title: z.string().optional(),
    description: z.string().optional(),
    buttonText: z.string().optional(),
    handler: z.string(),
    popupTitle: z.string().optional(),
    popupDescription: z.string().optional(),
    showMessage: z.boolean(),
    messageLabel: z.string().optional(),
    showConsent: z.boolean(),
    consentLabel: z.string().optional(),
    privacyUrl: z.string().optional(),
    showOwnResource: z.boolean(),
    ownResourceLabel: z.string().optional(),
    ownResourceTags: z.string().optional(),
    ownResourceEmptyText: z.string().optional(),
    loginTitle: z.string().optional(),
    loginDescription: z.string().optional(),
    loginButtonText: z.string().optional(),
    successMessage: z.string().optional(),
  }),
});

type FormData = z.infer<typeof formSchema>;

function withoutEmptyStrings<T extends Record<string, unknown>>(values: T) {
  return Object.fromEntries(
    Object.entries(values).filter(([, value]) => value !== '')
  ) as T;
}

export default function WidgetResourceDetailLinks(
  props: ResourceDetailWidgetProps & EditFieldProps<ResourceDetailWidgetProps>
) {
  const router = useRouter();
  const { project } = router.query;
  const { data: allTags } = useTags(project as string);
  const { capabilities, error: capabilitiesError } = usePluginCapabilities();

  const related = props.relatedResources || {};
  const contact = props.contactBlock || {};

  const form = useForm<FormData>({
    resolver: zodResolver<any>(formSchema),
    defaultValues: {
      relatedResources: {
        display: related.display || false,
        title: related.title || '',
        layout: related.layout || 'default',
        displayTitle: related.displayTitle !== false,
        displayImage: related.displayImage !== false,
        displaySummary: related.displaySummary !== false,
        linkToDetail: related.linkToDetail !== false,
        itemLink: related.itemLink || '',
        tagIds: related.tagIds || '',
      },
      contactBlock: {
        display: contact.display || false,
        title: contact.title || '',
        description: contact.description || '',
        buttonText: contact.buttonText || '',
        handler: contact.handler || DEFAULT_HANDLER,
        popupTitle: contact.popupTitle || '',
        popupDescription: contact.popupDescription || '',
        showMessage: contact.showMessage !== false,
        messageLabel: contact.messageLabel || '',
        showConsent: contact.showConsent !== false,
        consentLabel: contact.consentLabel || '',
        privacyUrl: contact.privacyUrl || '',
        showOwnResource: contact.showOwnResource || false,
        ownResourceLabel: contact.ownResourceLabel || '',
        ownResourceTags: contact.ownResourceTags || '',
        ownResourceEmptyText: contact.ownResourceEmptyText || '',
        loginTitle: contact.loginTitle || '',
        loginDescription: contact.loginDescription || '',
        loginButtonText: contact.loginButtonText || '',
        successMessage: contact.successMessage || '',
      },
    },
  });

  function onSubmit(values: FormData) {
    const { handler, ...contactValues } = values.contactBlock;
    props.updateConfig({
      ...props,
      relatedResources: withoutEmptyStrings(values.relatedResources),
      contactBlock: withoutEmptyStrings({
        ...contactValues,
        handler: handler === DEFAULT_HANDLER ? '' : handler,
      }),
    });
  }

  const toggleField = (name: any, label: string, description?: string) => (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          {description ? (
            <FormDescription>{description}</FormDescription>
          ) : null}
          {YesNoSelect(field as ControllerRenderProps<any, any>, {})}
          <FormMessage />
        </FormItem>
      )}
    />
  );

  const textField = (name: any, label: string, placeholder?: string) => (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <Input placeholder={placeholder} {...field} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );

  const richTextField = (name: any, label: string) => (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <TrixEditor
              value={field.value || ''}
              onChange={(e: any) => field.onChange(e.target.value)}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );

  const tagField = (name: any, label: string, description: string) => (
    <div>
      <FormLabel>{label}</FormLabel>
      <p className="text-sm text-muted-foreground">{description}</p>
      <CheckboxList
        form={form}
        fieldName={name}
        fieldLabel={label}
        label={(tag: any) => tag.name}
        keyForGrouping="type"
        keyPerItem={(tag: any) => `${tag.id}`}
        items={allTags || []}
        selectedPredicate={(tag: any) =>
          fromCsvIds(form.getValues(name)).includes(`${tag.id}`)
        }
        onValueChange={(tag: any, checked: boolean) =>
          form.setValue(
            name,
            toggleCsvId(form.getValues(name), tag.id, checked)
          )
        }
      />
    </div>
  );

  return (
    <div className="p-6 bg-white rounded-md">
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="lg:w-2/3 grid grid-cols-1 gap-4">
          <Heading size="xl">Gerelateerde inzendingen</Heading>
          <Separator className="my-2" />
          {toggleField(
            'relatedResources.display',
            'Gerelateerde inzendingen tonen',
            'Toont de inzendingen die aan deze inzending gekoppeld zijn, in beide richtingen.'
          )}
          {form.watch('relatedResources.display') ? (
            <div className="bg-stone-100 p-4 rounded-md border grid grid-cols-1 gap-4">
              {textField(
                'relatedResources.title',
                'Titel',
                'Gerelateerde inzendingen'
              )}
              {toggleField('relatedResources.displayTitle', 'Titel tonen')}
              <FormField
                control={form.control}
                name="relatedResources.layout"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Weergave</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="default">Standaard</SelectItem>
                        <SelectItem value="compact">Compact</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {toggleField('relatedResources.displayImage', 'Afbeelding tonen')}
              {toggleField(
                'relatedResources.displaySummary',
                'Samenvatting tonen',
                'Niet zichtbaar in de compacte weergave.'
              )}
              {toggleField(
                'relatedResources.linkToDetail',
                'Link naar de detailpagina'
              )}
              {textField(
                'relatedResources.itemLink',
                'Adres van de detailpagina (gebruik [id] voor het nummer)',
                '/resources/[id]'
              )}
              {tagField(
                'relatedResources.tagIds',
                'Alleen inzendingen met tag',
                'Laat leeg om alle gekoppelde inzendingen te tonen.'
              )}
            </div>
          ) : null}

          <Heading size="xl" className="mt-6">
            Contact of uitnodiging
          </Heading>
          <Separator className="my-2" />
          {toggleField(
            'contactBlock.display',
            'Contactblok tonen',
            'Een blok met knop waarmee een ingelogde bezoeker de indiener een bericht of verzoek stuurt.'
          )}
          {form.watch('contactBlock.display') ? (
            <div className="bg-stone-100 p-4 rounded-md border grid grid-cols-1 gap-4">
              <FormField
                control={form.control}
                name="contactBlock.handler"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Wat gebeurt er bij versturen?</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value={DEFAULT_HANDLER}>
                          Contactbericht naar de indiener
                        </SelectItem>
                        {capabilities.contactHandlers.map((handler) => (
                          <SelectItem key={handler.key} value={handler.key}>
                            {handler.label}
                          </SelectItem>
                        ))}
                        {field.value !== DEFAULT_HANDLER &&
                        !capabilities.contactHandlers.some(
                          (handler) => handler.key === field.value
                        ) ? (
                          <SelectItem value={field.value}>
                            {field.value} (plugin niet gevonden)
                          </SelectItem>
                        ) : null}
                      </SelectContent>
                    </Select>
                    {capabilitiesError ? (
                      <p className="text-sm text-destructive">
                        De plugin-instellingen konden niet worden geladen.
                      </p>
                    ) : null}
                    <FormMessage />
                  </FormItem>
                )}
              />
              {textField(
                'contactBlock.title',
                'Titel',
                'Wil je contact opnemen met de indiener?'
              )}
              {richTextField('contactBlock.description', 'Beschrijving')}
              {textField(
                'contactBlock.buttonText',
                'Tekst op de knop',
                'Stuur een bericht'
              )}
              {textField(
                'contactBlock.popupTitle',
                'Titel pop-up',
                'Je gaat een bericht versturen'
              )}
              {richTextField(
                'contactBlock.popupDescription',
                'Beschrijving pop-up'
              )}
              {toggleField('contactBlock.showMessage', 'Berichtveld tonen')}
              {textField(
                'contactBlock.messageLabel',
                'Label berichtveld',
                'Typ je bericht'
              )}
              {toggleField(
                'contactBlock.showConsent',
                'Toestemmingsveld tonen',
                'Verplicht voor een contactbericht naar de indiener, omdat het e-mailadres gedeeld wordt.'
              )}
              {textField(
                'contactBlock.consentLabel',
                'Label toestemmingsveld (gebruik {link} voor de plek van de link)',
                'Ik ga akkoord met het delen van mijn e-mailadres volgens de {link}'
              )}
              {textField(
                'contactBlock.privacyUrl',
                'Link naar privacyverklaring',
                'https://www.voorbeeld.nl/privacy'
              )}
              {toggleField(
                'contactBlock.showOwnResource',
                'Eigen inzending laten kiezen',
                'De bezoeker kiest een van de eigen inzendingen, bijvoorbeeld het eigen stadmakerprofiel. Is er maar één, dan staat die al geselecteerd.'
              )}
              {textField(
                'contactBlock.ownResourceLabel',
                'Label eigen inzending',
                'Kies je inzending'
              )}
              {tagField(
                'contactBlock.ownResourceTags',
                'Alleen eigen inzendingen met tag',
                'Laat leeg om alle eigen inzendingen te tonen.'
              )}
              {textField(
                'contactBlock.ownResourceEmptyText',
                'Tekst als er geen eigen inzending is',
                'Je hebt nog geen inzending die je hiervoor kunt kiezen.'
              )}
              {textField(
                'contactBlock.loginTitle',
                'Titel login pop-up',
                'Log in om een bericht te versturen'
              )}
              {textField(
                'contactBlock.loginDescription',
                'Beschrijving login pop-up',
                'Door in te loggen weten we zeker dat jouw e-mailadres gebruikt kan worden om jou te bereiken.'
              )}
              {textField(
                'contactBlock.loginButtonText',
                'Tekst login-knop',
                'Inloggen'
              )}
              {textField(
                'contactBlock.successMessage',
                'Melding na versturen',
                'Je bericht is verstuurd.'
              )}
            </div>
          ) : null}

          <Button className="w-fit col-span-full" type="submit">
            Opslaan
          </Button>
        </form>
      </Form>
    </div>
  );
}
