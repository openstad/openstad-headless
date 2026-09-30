import { fetchSessionUser } from '@/auth-context';
import { CopyableVar } from '@/components/copyable-var';
import { ConfirmActionDialog } from '@/components/dialog-confirm-action';
import AccordionUI from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
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
  rebaselineAfterSave,
  useRegisterSave,
} from '@/components/ui/save-controller';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Heading } from '@/components/ui/typography';
import useNotificationTemplate, {
  useNotificationTemplateDefaults,
} from '@/hooks/use-notification-template';
import { useProject } from '@/hooks/use-project';
import {
  FIXED_BLOCKS_BY_TYPE,
  NOTIFICATION_CONTENT_FIELDS,
  NOTIFICATION_TYPE_LABELS,
  NotificationContent,
  NotificationStyling,
  NotificationType,
  hasContent,
  isPlainTextType,
  normalizeContent,
  renderNotificationMjml,
  showsLogo,
} from '@/lib/notification-content';
import {
  NotificationScope,
  isGlobalScope,
  projectNotificationScope,
} from '@/lib/notification-scope';
import {
  buildPreviewContext,
  variablesForType,
} from '@/lib/notification-variables';
import { applyFilters } from '@/lib/nunjucks-filters';
import { zodResolver } from '@hookform/resolvers/zod';
import cloneDeep from 'lodash/cloneDeep';
import { useRouter } from 'next/router';
import nunjucks from 'nunjucks';
import * as React from 'react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';

const nunjucksEnv = new nunjucks.Environment();
applyFilters(nunjucksEnv);

type Props = {
  type: NotificationType;
  engine?: 'email' | 'sms';
  id?: string;
  label?: string;
  subject?: string;
  body?: string;
  content?: NotificationContent | null;
  // Which template collection to write to. Defaults to the project of the current route.
  scope?: NotificationScope;
  // The mail styling the MJML is rendered with. NotificationSettings passes the resolved
  // one (project value with the global settings as fallback); left out, the form falls back
  // to the project of the current route, for the standalone use in settings/users.tsx.
  styling?: NotificationStyling;
};

const formSchema = z.object({
  engine: z.enum(['email', 'sms']),
  label: z
    .string()
    .min(1, {
      message: 'De label mag niet leeg zijn!',
    })
    .max(255, {
      message: 'De label mag niet langer dan 255 karakters zijn!',
    }),
  subject: z
    .string()
    .min(1, {
      message: 'Het onderwerp mag niet leeg zijn!',
    })
    .max(255, {
      message: 'Het onderwerp mag niet langer dan 255 karakters zijn!',
    }),
  body: z.string().min(1, {
    message: 'De inhoud mag niet leeg zijn!',
  }),
  heading: z.string(),
  greeting: z.string(),
  intro: z.string(),
  buttonLabel: z.string(),
  buttonUrl: z.string(),
  footer: z.string(),
  showLogo: z.boolean(),
});

type FormValues = z.infer<typeof formSchema>;

function contentFromValues(values: FormValues): NotificationContent {
  return normalizeContent({
    heading: values.heading,
    greeting: values.greeting,
    intro: values.intro,
    buttonLabel: values.buttonLabel,
    buttonUrl: values.buttonUrl,
    footer: values.footer,
    showLogo: values.showLogo,
  });
}

function contentToValues(type: NotificationType, content: NotificationContent) {
  const normalized = normalizeContent(content);
  return {
    heading: normalized.heading || '',
    greeting: normalized.greeting || '',
    intro: normalized.intro || '',
    buttonLabel: normalized.buttonLabel || '',
    buttonUrl: normalized.buttonUrl || '',
    footer: normalized.footer || '',
    showLogo: showsLogo(type, normalized),
  };
}

export function NotificationForm({
  type,
  engine,
  id,
  label,
  subject,
  body,
  content,
  scope,
  styling: stylingProp,
}: Props) {
  const router = useRouter();
  // Without a scope prop the form belongs to the project of the current route, which is
  // how it is used on the project pages.
  const activeScope =
    scope || projectNotificationScope(router.query.project as string);
  const globalScope = isGlobalScope(activeScope);
  const { create, update } = useNotificationTemplate(activeScope);
  const { data: defaultTemplates } =
    useNotificationTemplateDefaults(activeScope);
  const defaultTemplate = defaultTemplates?.find((d) => d.type === type);
  const notificationTitle = NOTIFICATION_TYPE_LABELS[type];
  // On a project page this resolves through the route; on the global settings page there
  // is no project in the route, so the hook fetches nothing and `styling` is passed in.
  const { data: projectData } = useProject();
  const plainText = isPlainTextType(type);
  const fixedBlockNotice = FIXED_BLOCKS_BY_TYPE[type];

  // Sample data comes from buildPreviewContext (one variable catalog for the
  // whole app); these overrides replace a sample with the real thing wherever
  // that's cheaply available client-side. clientName stays a sample - it is
  // only resolvable server-side, see resolveClientName in NotificationMessage.js.
  const [previewOverrides, setPreviewOverrides] = useState<Record<string, any>>(
    {}
  );

  useEffect(() => {
    async function setUserNameInPreview() {
      const user = await fetchSessionUser();

      if (user && user.name) {
        setPreviewOverrides((prev) => ({
          ...prev,
          user: { name: user.name, fullName: user.name },
          name: user.name,
        }));
      }
    }

    setUserNameInPreview();
  }, []);

  // In global scope the preview keeps the neutral sample project from
  // buildPreviewContext: there is no single project this template belongs to.
  useEffect(() => {
    if (globalScope) {
      setPreviewOverrides((prev) => ({
        ...prev,
        logo: stylingProp?.logo || prev.logo,
      }));
      return;
    }
    if (!projectData) return;
    setPreviewOverrides((prev) => ({
      ...prev,
      logo:
        stylingProp?.logo ||
        projectData.emailConfig?.styling?.logo ||
        prev.logo,
      projectName: projectData.title || projectData.name || prev.projectName,
      projectUrl: projectData.url || prev.projectUrl,
      project: {
        title: projectData.title || projectData.name || '',
        name: projectData.name || '',
        url: projectData.url || '',
      },
    }));
  }, [projectData, globalScope, stylingProp?.logo]);

  const mailContext = useMemo(
    () => buildPreviewContext(type, previewOverrides),
    [type, previewOverrides]
  );

  // The passed styling wins: in global scope it is the only source, and on a project page
  // it is not passed at all.
  const styling: NotificationStyling =
    stylingProp || projectData?.emailConfig?.styling || {};

  const defaultValueBody = body || defaultTemplate?.body || '';
  const defaultContent = useMemo(
    () => normalizeContent(defaultTemplate?.content),
    [defaultTemplate]
  );
  // A saved template with content is content-managed; one without is raw MJML
  // someone may have edited by hand, so we do not overwrite it silently.
  const savedContent = useMemo(() => normalizeContent(content), [content]);
  const activeContent = id
    ? hasContent(content)
      ? savedContent
      : defaultContent
    : defaultContent;

  const defaults = React.useCallback(
    () => ({
      engine: engine || 'email',
      label: label || defaultTemplate?.label || '',
      subject: subject || defaultTemplate?.subject || '',
      body: defaultValueBody,
      ...contentToValues(type, activeContent),
    }),
    [
      type,
      engine,
      label,
      subject,
      defaultValueBody,
      defaultTemplate,
      activeContent,
    ]
  );

  const form = useForm<FormValues>({
    resolver: zodResolver<any>(formSchema),
    defaultValues: defaults(),
  });

  const { watch } = form;
  const fieldValue = watch('body');
  const subjectValue = watch('subject');

  useEffect(() => {
    form.reset(defaults(), { keepDirtyValues: true });
  }, [form, defaults]);

  const [contentManaged, setContentManaged] = useState<boolean>(
    id ? hasContent(content) : true
  );
  // Which tab you look at is separate from how the template is managed:
  // opening the HTML tab to read along must not silently change the mode.
  const [activeTab, setActiveTab] = useState<'content' | 'html'>(
    id && !hasContent(content) ? 'html' : 'content'
  );

  // Key on the value, not the object: the templates list refetches and hands us
  // a fresh `content` object every time, which would otherwise reset an unsaved
  // switch to manual HTML and regenerate over the admin's own markup.
  const contentKey = JSON.stringify(savedContent);

  useEffect(() => {
    const managed = id ? hasContent(savedContent) : true;
    setContentManaged(managed);
    // Open on the tab that actually drives this template.
    setActiveTab(managed ? 'content' : 'html');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, contentKey]);

  const watchedContent = watch([
    'heading',
    'greeting',
    'intro',
    'buttonLabel',
    'buttonUrl',
    'footer',
    'showLogo',
  ]);

  // In content mode the fields are the source: every keystroke regenerates the
  // MJML in `body`, which drives both the preview and what gets saved.
  useEffect(() => {
    if (!contentManaged) return;
    const rendered = renderNotificationMjml(
      type,
      contentFromValues(form.getValues()),
      styling
    );
    if (rendered !== form.getValues('body')) {
      form.setValue('body', rendered, { shouldDirty: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    contentManaged,
    type,
    JSON.stringify(watchedContent),
    styling.logo,
    styling.primaryColor,
    styling.backgroundColor,
    styling.textColor,
  ]);

  const [mjmlHtml, setMjmlHtml] = useState('');

  function renderPreview(template: string) {
    try {
      return nunjucksEnv.renderString(template || '', mailContext);
    } catch (err) {
      return '';
    }
  }

  let mailTemplate: any = renderPreview(fieldValue || defaultValueBody || '');
  const subjectPreview = renderPreview(subjectValue || '');

  const [error, setError] = useState<string | null>(null);

  async function convertMJMLToHTML(data = mailTemplate) {
    if (data === '') {
      setMjmlHtml("<p style='text-align: center;'>Inhoud is leeg.</p>");
      setError(null);
      return;
    }

    if (!String(data).includes('<mjml')) {
      setMjmlHtml(String(data));
      setError(null);
      return;
    }

    try {
      const mjml2html = (await import('mjml-browser')).default;
      const htmlOutput = (await mjml2html(data)).html;
      setMjmlHtml(htmlOutput);
      setError(null);
    } catch (err) {
      setError('Er is een fout opgetreden bij het renderen van de template.');
    }
  }

  useEffect(() => {
    convertMJMLToHTML();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mailContext]);

  const handleOnChange = (e: any, field: any) => {
    if (e.target.value.length > 0) {
      try {
        convertMJMLToHTML(
          nunjucksEnv.renderString(e.target.value, mailContext)
        );
      } catch (err) {
        setError('Er is een fout opgetreden bij het renderen van de template.');
      }
    }
  };

  useEffect(() => {
    if (!fieldValue) {
      convertMJMLToHTML('');
      return;
    }
    try {
      convertMJMLToHTML(nunjucksEnv.renderString(fieldValue, mailContext));
    } catch (err) {
      setError('Er is een fout opgetreden bij het renderen van de template.');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fieldValue]);

  const save = useCallback(async () => {
    const valid = await form.trigger();
    if (!valid) {
      throw new Error('Controleer de gemarkeerde velden.');
    }
    if (error) {
      throw new Error(
        'De inhoud kan niet worden gerenderd. Corrigeer de MJML-template.'
      );
    }
    const sent = cloneDeep(form.getValues());
    const values = formSchema.parse(sent) as FormValues;
    const contentToSave = contentManaged ? contentFromValues(values) : null;
    try {
      if (id) {
        await update(
          id as string,
          values.label,
          values.subject,
          values.body,
          contentToSave
        );
      } else {
        await create({
          engine: values.engine,
          type,
          label: values.label,
          subject: values.subject,
          body: values.body,
          content: contentToSave,
        });
      }
    } catch (requestError) {
      throw new Error('Opslaan is mislukt. Probeer het opnieuw.');
    }
    rebaselineAfterSave(form, sent);
  }, [contentManaged, create, error, form, id, type, update]);

  useRegisterSave({
    isDirty: form.formState.isDirty,
    save,
    label: notificationTitle,
  });

  function handleRestoreDefault() {
    if (!defaultTemplate) return;
    const managed = hasContent(defaultTemplate.content);
    // With content mode on, `body` must be what the fields produce - otherwise
    // the read-only HTML tab shows the handwritten file markup and the mail
    // silently changes shape the next time the page regenerates it.
    const restoredBody = managed
      ? renderNotificationMjml(type, defaultContent, styling)
      : defaultTemplate.body;
    form.reset({
      engine: engine || 'email',
      label: defaultTemplate.label,
      subject: defaultTemplate.subject,
      body: restoredBody,
      ...contentToValues(type, defaultContent),
    });
    setContentManaged(managed);
    setActiveTab(managed ? 'content' : 'html');
  }

  function handleSwitchToContent() {
    // Prefer what this template had saved; only fall back to the shipped
    // defaults when it never had content fields.
    const target = hasContent(savedContent) ? savedContent : defaultContent;
    form.reset(
      {
        ...form.getValues(),
        ...contentToValues(type, target),
      },
      { keepDirtyValues: false }
    );
    setContentManaged(true);
    setActiveTab('content');
  }

  function handleSwitchToManual() {
    setContentManaged(false);
    setActiveTab('html');
  }

  const contentFields = plainText
    ? NOTIFICATION_CONTENT_FIELDS.filter((field) => field.key === 'intro')
    : NOTIFICATION_CONTENT_FIELDS;

  return (
    <div>
      <div className="container px-0 py-6">
        <Form {...form} className="px-0 py-6 bg-white rounded-md">
          <Heading size="xl">{notificationTitle}</Heading>
          <Separator className="my-4" />
          <div className="grid grid-cols-2">
            <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
              {id ? null : (
                <FormField
                  control={form.control}
                  name="engine"
                  render={({ field }) => (
                    <FormItem className="col-span-1">
                      <FormLabel>
                        Wat voor client gaat gebruikt worden voor dit onderdeel?
                      </FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="email" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="email">Email</SelectItem>
                          <SelectItem value="sms">SMS</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
              <FormField
                control={form.control}
                name="label"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Label (Type bericht)</FormLabel>
                    <FormControl>
                      <Input placeholder="Label van de mail" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="subject"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Onderwerp</FormLabel>
                    <FormControl>
                      <Input placeholder="Onderwerp van de mail" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Tabs
                value={activeTab}
                onValueChange={(value) =>
                  setActiveTab(value as 'content' | 'html')
                }>
                <TabsList>
                  <TabsTrigger value="content">Inhoud</TabsTrigger>
                  <TabsTrigger value="html">
                    {plainText ? 'Platte tekst' : 'HTML'}
                  </TabsTrigger>
                </TabsList>

                <TabsContent
                  value="content"
                  forceMount
                  className="space-y-4 pt-4 data-[state=inactive]:hidden">
                  {contentManaged ? null : (
                    <div className="rounded-md border border-input p-4 space-y-3">
                      <p className="text-sm text-muted-foreground">
                        Deze e-mail wordt op dit moment als{' '}
                        {plainText ? 'tekst' : 'HTML'} beheerd. De velden
                        hieronder worden pas gebruikt als je overstapt.
                      </p>
                      <ConfirmActionDialog
                        trigger={
                          <Button type="button" variant="outline">
                            Overstappen op inhoudsvelden
                          </Button>
                        }
                        header="Overstappen op inhoudsvelden?"
                        message={`De ${plainText ? 'tekst' : 'HTML'} van deze e-mail wordt dan opnieuw opgebouwd uit de losse velden. Handmatige aanpassingen in de ${plainText ? 'tekst' : 'HTML'} gaan verloren zodra je opslaat.`}
                        confirmButtonText="Overstappen"
                        cancelButtonText="Annuleren"
                        onConfirmAccepted={handleSwitchToContent}
                      />
                    </div>
                  )}
                  {plainText && (
                    <p className="text-sm text-muted-foreground">
                      Sms versturen is nog niet beschikbaar in OpenStad. Je legt
                      hier alleen de tekst vast.
                    </p>
                  )}
                  {fixedBlockNotice && (
                    <p className="text-sm text-muted-foreground">
                      {fixedBlockNotice}
                    </p>
                  )}
                  {!plainText && (
                    <FormField
                      control={form.control}
                      name="showLogo"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center gap-2 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={(checked) =>
                                field.onChange(checked === true)
                              }
                            />
                          </FormControl>
                          <FormLabel className="font-normal">
                            Logo bovenaan deze e-mail tonen
                          </FormLabel>
                        </FormItem>
                      )}
                    />
                  )}
                  {contentFields.map((contentField) => (
                    <FormField
                      key={contentField.key}
                      control={form.control}
                      name={contentField.key}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{contentField.label}</FormLabel>
                          {contentField.description && (
                            <FormDescription>
                              {contentField.description}
                            </FormDescription>
                          )}
                          <FormControl>
                            {contentField.input === 'textarea' ? (
                              <Textarea rows={5} {...field} />
                            ) : (
                              <Input {...field} />
                            )}
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  ))}
                  {contentManaged && form.formState.errors.body && (
                    // The body field lives in the other panel, which is hidden.
                    // Without this the save button would just do nothing.
                    <p className="text-sm font-medium text-destructive">
                      {form.formState.errors.body.message}
                    </p>
                  )}
                </TabsContent>

                <TabsContent
                  value="html"
                  forceMount
                  className="pt-4 data-[state=inactive]:hidden">
                  <FormField
                    control={form.control}
                    name="body"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Inhoud</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Inhoud van de mail..."
                            rows={20}
                            readOnly={contentManaged}
                            onKeyUpCapture={(e) => handleOnChange(e, field)}
                            {...field}
                          />
                        </FormControl>
                        {contentManaged && (
                          <div className="space-y-3 pt-2">
                            <p className="text-sm text-muted-foreground">
                              Deze {plainText ? 'tekst' : 'HTML'} wordt
                              gegenereerd uit de inhoudsvelden en is daarom niet
                              te bewerken.
                            </p>
                            <ConfirmActionDialog
                              trigger={
                                <Button type="button" variant="outline">
                                  {plainText ? 'Tekst' : 'HTML'} zelf beheren
                                </Button>
                              }
                              header={`${plainText ? 'Tekst' : 'HTML'} zelf beheren?`}
                              message={`De inhoudsvelden sturen deze e-mail dan niet meer aan. Je beheert de ${plainText ? 'tekst' : 'HTML'} vanaf dat moment zelf.`}
                              confirmButtonText="Zelf beheren"
                              cancelButtonText="Annuleren"
                              onConfirmAccepted={handleSwitchToManual}
                            />
                          </div>
                        )}
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </TabsContent>
              </Tabs>

              <div className="flex items-center gap-2">
                <ConfirmActionDialog
                  trigger={
                    <Button
                      type="button"
                      variant="outline"
                      disabled={!defaultTemplate}>
                      Herstel standaard
                    </Button>
                  }
                  header="Weet je het zeker?"
                  message="Hiermee vervang je het label, het onderwerp en de inhoud van deze template door de standaardversie. Je eigen wijzigingen gaan verloren zodra je opslaat."
                  confirmButtonText="Herstel standaard"
                  cancelButtonText="Annuleren"
                  onConfirmAccepted={handleRestoreDefault}
                />
              </div>
              {error && <p className="text-red-500">{error}</p>}
            </form>

            <div className="p-4 space-y-4">
              <div>
                <p className="text-sm font-medium">Onderwerp</p>
                <p className="text-sm text-muted-foreground">
                  {subjectPreview || '—'}
                </p>
              </div>
              <iframe
                className="email-iframe"
                sandbox=""
                srcDoc={mjmlHtml}
                height={500}
                width={500}></iframe>
            </div>
          </div>

          {/* Not the fixed-height preview column: the iframe's height:100%
              otherwise locks the row height and an opened accordion overflows
              into the next mail. Also not full width: AccordionUI's header
              spaces the chevron to the far edge of its container. */}
          <div className="max-w-xl mt-6">
            <AccordionUI
              items={[
                {
                  header: `Beschikbare variabelen (${variablesForType(type).length})`,
                  content: (
                    <table className="w-full text-sm">
                      <tbody>
                        {variablesForType(type).map((variable) => (
                          <tr key={variable.key}>
                            <td className="pr-3 pb-2 align-top whitespace-nowrap">
                              <CopyableVar expression={variable.key} />
                            </td>
                            <td className="pb-2 align-top text-muted-foreground">
                              {variable.label}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ),
                },
              ]}
            />
          </div>
        </Form>
      </div>
    </div>
  );
}
