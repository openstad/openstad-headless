import { ConfirmActionDialog } from '@/components/dialog-confirm-action';
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
  useLooseFormDirty,
  useRegisterSave,
  validateForSave,
} from '@/components/ui/save-controller';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { Heading } from '@/components/ui/typography';
import useMailStyling from '@/hooks/use-mail-styling';
import useNotificationTemplate, {
  NotificationContent,
  NotificationDefault,
} from '@/hooks/use-notification-template';
import { useSyncFormDefaults } from '@/hooks/useSyncFormDefaults';
import { validateProjectNumber } from '@/lib/validateProjectNumber';
import { zodResolver } from '@hookform/resolvers/zod';
import cloneDeep from 'lodash/cloneDeep';
import { useRouter } from 'next/router';
import * as React from 'react';
import { useCallback, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import useSWR from 'swr';
import * as z from 'zod';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';

const PREVIEW_DELAY_MS = 400;
const SMS_TYPES = ['login sms'];
const EMPTY_PREVIEW = "<p style='text-align: center;'>Inhoud is leeg.</p>";

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function plainTextPreview(text: string) {
  return `<pre style="white-space: pre-wrap; font-family: sans-serif;">${escapeHtml(text)}</pre>`;
}

type Props = {
  type:
    | 'login email'
    | 'login sms'
    | 'new published resource - user feedback'
    | 'new published resource - admin update'
    | 'updated resource - user feedback'
    | 'user account about to expire'
    | 'new enquete - admin'
    | 'new enquete - user'
    | 'notification comment - user'
    | 'notification comment reply - user'
    | 'new comment - admin'
    | 'contact message - user'
    | 'new modbreak - user feedback'
    | (string & {});
  typeLabel?: string;
  engine?: 'email' | 'sms';
  id?: string;
  label?: string;
  subject?: string;
  body?: string;
  content?: NotificationContent | null;
};

const EMPTY_CONTENT: NotificationContent = {
  heading: '',
  intro: '',
  buttonLabel: '',
  buttonUrl: '',
  footer: '',
  showLogo: true,
};

const notificationTypes: Record<string, string> = {
  'login email': 'Inloggen via e-mail',
  'login sms': 'Inloggen via sms',
  'new published resource - user feedback':
    'Nieuwe inzending gepubliceerd - Notificatie naar de gebruiker',
  'new published resource - admin update':
    'Nieuwe inzending gepubliceerd - Notificatie naar de admin',
  'updated resource - user feedback':
    'Inzending bijgewerkt - Notificatie naar de gebruiker',
  'user account about to expire':
    'Gebruikersaccount staat op het punt te verlopen',
  'new enquete - admin':
    'Nieuwe formulier inzending - Notificatie naar de admin',
  'new enquete - user':
    'Nieuwe formulier inzending - Notificatie naar de gebruiker',
  'notification comment - user':
    'Nieuwe reactie op een inzending - Notificatie naar de gebruiker',
  'notification comment reply - user':
    'Nieuwe reactie op een reactie - Notificatie naar de gebruiker',
  'new comment - admin': 'Nieuwe reactie - Notificatie naar de admin',
  'contact message - user': 'Contactbericht - Notificatie naar de indiener',
  'new modbreak - user feedback':
    'Officiële reactie geplaatst - Notificatie naar de gebruiker',
};

const formSchema = z
  .object({
    engine: z.enum(['email', 'sms']),
    mode: z.enum(['fields', 'html']),
    content: z.object({
      heading: z.string(),
      intro: z.string(),
      buttonLabel: z.string(),
      buttonUrl: z.string(),
      footer: z.string(),
      showLogo: z.boolean(),
    }),
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
    body: z.string(),
  })
  .superRefine((values, ctx) => {
    if (values.mode === 'html' && !values.body) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['body'],
        message: 'De inhoud mag niet leeg zijn!',
      });
    }
  });

export function NotificationForm({
  type,
  typeLabel,
  engine,
  id,
  label,
  subject,
  body,
  content,
}: Props) {
  const router = useRouter();
  const project = router.query.project as string;
  const { data, create, update, preview, remove } = useNotificationTemplate(
    project as string
  );
  const notificationTitle = typeLabel || notificationTypes[type] || type;
  // A stored template is updated, everything else is created. Keyed on the id
  // so a stored template with an empty label cannot take the create path and
  // POST a duplicate.
  const isExistingTemplate = !!id;
  const projectNumber = validateProjectNumber(project);
  const { data: defaultTemplate, isLoading: loadingDefaultTemplate } =
    useSWR<NotificationDefault>(
      !isExistingTemplate && projectNumber && type
        ? `/api/openstad/notification/project/${projectNumber}/template/default/${encodeURIComponent(type)}`
        : null,
      { shouldRetryOnError: false }
    );

  const { data: restorableDefault } = useSWR<NotificationDefault>(
    isExistingTemplate && projectNumber && type
      ? `/api/openstad/notification/project/${projectNumber}/template/default/${encodeURIComponent(type)}`
      : null,
    { shouldRetryOnError: false }
  );

  const { data: mailStyling } = useMailStyling(project);

  const typeDefault = defaultTemplate || restorableDefault;
  const startContent = isExistingTemplate
    ? content || null
    : defaultTemplate?.content || null;
  const defaultValueBody =
    body || (startContent ? '' : defaultTemplate?.body || '');

  const defaults = React.useCallback(
    () => ({
      engine: engine || (SMS_TYPES.includes(type) ? 'sms' : 'email'),
      label: label || (isExistingTemplate ? '' : notificationTitle),
      subject: subject || defaultTemplate?.subject || '',
      body: defaultValueBody,
      mode: (startContent ? 'fields' : 'html') as 'fields' | 'html',
      content: startContent || EMPTY_CONTENT,
    }),
    // `type` feeds `defaultValueBody`, so it belongs here as well.
    [
      engine,
      label,
      subject,
      type,
      defaultValueBody,
      defaultTemplate,
      notificationTitle,
      isExistingTemplate,
      startContent,
    ]
  );

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver<any>(formSchema),
    defaultValues: defaults(),
  });

  const { watch } = form;
  const fieldValue = watch('body'); // Assuming 'engine' is the name of the field you're interested in

  useSyncFormDefaults(form, defaults, id || defaultTemplate);

  const subjectValue = watch('subject');
  const engineValue = watch('engine');
  const modeValue = watch('mode');
  const contentValue = watch('content');
  const contentKey = JSON.stringify(contentValue);
  const fieldTypeDefault = typeDefault?.content || null;

  const [previewHtml, setPreviewHtml] = useState('');
  const [previewSubject, setPreviewSubject] = useState('');
  const [previewMjml, setPreviewMjml] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!projectNumber) return;
    if (modeValue === 'html' && !fieldValue) {
      setPreviewHtml(EMPTY_PREVIEW);
      setPreviewSubject('');
      setError(null);
      return;
    }

    let cancelled = false;
    const timer = setTimeout(async () => {
      try {
        const result = await preview({
          type,
          engine: engineValue,
          subject: subjectValue || '',
          ...(modeValue === 'fields'
            ? { content: JSON.parse(contentKey) }
            : { body: fieldValue }),
        });
        if (cancelled) return;
        setPreviewHtml(result.html ?? plainTextPreview(result.text || ''));
        setPreviewSubject(result.subject);
        setPreviewMjml(result.mjml || '');
        setError(null);
      } catch (previewError) {
        if (cancelled) return;
        setError((previewError as Error).message);
      }
    }, PREVIEW_DELAY_MS);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [
    projectNumber,
    modeValue,
    contentKey,
    fieldValue,
    subjectValue,
    engineValue,
    type,
    mailStyling,
  ]);

  function switchToHtml() {
    form.setValue('body', previewMjml, { shouldDirty: true });
    form.setValue('mode', 'html', { shouldDirty: true });
  }

  function switchToFields() {
    if (!fieldTypeDefault) return;
    form.setValue('content', fieldTypeDefault, { shouldDirty: true });
    form.setValue('body', '', { shouldDirty: true });
    form.setValue('mode', 'fields', { shouldDirty: true });
  }

  const save = useCallback(async () => {
    // The save bar replaces `form.handleSubmit`, so the resolver has to be run
    // here: without it invalid values would be saved without any message.
    const valid = await validateForSave(form);
    if (!valid) {
      throw new Error('Controleer de gemarkeerde velden.');
    }
    if (error) {
      throw new Error(
        'De inhoud kan niet worden gerenderd. Corrigeer de MJML-template.'
      );
    }
    const sent = cloneDeep(form.getValues());
    const values = formSchema.parse(sent);
    const savedBody = values.mode === 'fields' ? '' : values.body;
    const savedContent = values.mode === 'fields' ? values.content : null;
    if (isExistingTemplate) {
      await update(
        id as string,
        values.label,
        values.subject,
        savedBody,
        savedContent
      );
    } else {
      await create(
        project,
        values.engine,
        type,
        values.label,
        values.subject,
        savedBody,
        savedContent
      );
    }
    rebaselineAfterSave(form, sent);
  }, [create, error, form, id, isExistingTemplate, project, type, update]);

  const formDirty = useLooseFormDirty(form);
  useRegisterSave({
    isDirty: formDirty,
    save,
    label: notificationTitle,
  });

  if (loadingDefaultTemplate) {
    return <p className="py-6 text-muted-foreground">Laden...</p>;
  }

  return (
    <div>
      <div className="container px-0 py-6">
        <Form {...form} className="px-0 py-6 bg-white rounded-md">
          <Heading size="xl">{notificationTitle}</Heading>
          <Separator className="my-4" />
          <div className="grid grid-cols-2">
            <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
              {isExistingTemplate ? null : (
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
              {modeValue === 'fields' ? (
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="content.heading"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Titel</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="content.intro"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tekst</FormLabel>
                        <FormControl>
                          <Textarea rows={8} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="content.buttonLabel"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Knoptekst</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="content.buttonUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Knop-link</FormLabel>
                        <FormDescription>
                          Laat de variabele staan om naar de inzending te
                          linken, of vul een vaste link in. Leeg betekent geen
                          knop.
                        </FormDescription>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="content.footer"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Afsluiting</FormLabel>
                        <FormControl>
                          <Textarea rows={3} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="content.showLogo"
                    render={({ field }) => (
                      <FormItem className="flex items-center gap-2 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={(checked) =>
                              field.onChange(checked === true)
                            }
                          />
                        </FormControl>
                        <FormLabel>Logo tonen</FormLabel>
                      </FormItem>
                    )}
                  />
                  <p className="text-sm text-muted-foreground">
                    Je kunt variabelen gebruiken, zoals{' '}
                    <code>&#123;&#123; user.name &#125;&#125;</code>. Een lege
                    regel begint een nieuwe alinea.
                    {typeDefault?.fixedBlock
                      ? ` Deze e-mail toont ook ${typeDefault.fixedBlock}; dat deel staat vast.`
                      : ''}
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    disabled={!previewMjml}
                    onClick={switchToHtml}>
                    Bewerk als HTML
                  </Button>
                </div>
              ) : (
                <>
                  <FormField
                    control={form.control}
                    name="body"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Inhoud</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Inhoud van de mail..."
                            defaultValue={
                              field.value.length > 0 ? field.value : body
                            }
                            rows={20}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  {fieldTypeDefault && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={(e) => e.preventDefault()}>
                      <ConfirmActionDialog
                        buttonText="Terug naar velden"
                        header="Terug naar invulvelden"
                        message="De HTML wordt vervangen door de standaardvelden van deze e-mail. Als je daarna opslaat, is je eigen HTML weg."
                        confirmButtonText="Terug naar velden"
                        cancelButtonText="Annuleren"
                        onConfirmAccepted={switchToFields}
                      />
                    </Button>
                  )}
                </>
              )}
              {error && <p className="text-red-500">{error}</p>}
              {isExistingTemplate && restorableDefault && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={(e) => e.preventDefault()}>
                  <ConfirmActionDialog
                    buttonText="Herstel standaard"
                    header="Standaardversie herstellen"
                    message="Je eigen versie van deze e-mail wordt verwijderd. Daarna wordt de standaardversie verstuurd."
                    confirmButtonText="Herstel standaard"
                    cancelButtonText="Annuleren"
                    confirmButtonVariant="destructive"
                    onConfirmAccepted={async () => {
                      try {
                        await remove(id as string);
                        toast.success('De standaardversie is hersteld.');
                      } catch (removeError) {
                        toast.error((removeError as Error).message);
                      }
                    }}
                  />
                </Button>
              )}
            </form>

            <div className="p-4">
              {previewSubject && (
                <p className="mb-2 text-sm">
                  <span className="font-medium">Onderwerp:</span>{' '}
                  {previewSubject}
                </p>
              )}
              <iframe
                className="email-iframe"
                srcDoc={previewHtml}
                height={500}
                width={500}></iframe>
            </div>
          </div>
        </Form>
      </div>
    </div>
  );
}
