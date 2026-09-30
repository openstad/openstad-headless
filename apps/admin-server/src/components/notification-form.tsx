import { fetchSessionUser } from '@/auth-context';
import {
  Form,
  FormControl,
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
import { Textarea } from '@/components/ui/textarea';
import { Heading } from '@/components/ui/typography';
import useNotificationTemplate from '@/hooks/use-notification-template';
import { useSyncFormDefaults } from '@/hooks/useSyncFormDefaults';
import { applyFilters } from '@/lib/nunjucks-filters';
import { zodResolver } from '@hookform/resolvers/zod';
import cloneDeep from 'lodash/cloneDeep';
import { useRouter } from 'next/router';
import nunjucks from 'nunjucks';
import * as React from 'react';
import { useCallback, useEffect, useState } from 'react';
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

const initialData = `<mjml>
    <mj-body>
      <mj-raw>
        <!-- Company Header -->
      </mj-raw>
      <mj-section>
        <mj-column>
          <mj-image src="{{imagePath}}/logo-openstad.png" height="70px" width="99px">
          </mj-image>
        </mj-column>
      </mj-section>
      <mj-raw>
        <!-- Image Header -->
      </mj-raw>
      <mj-section>
        <mj-column width="600px">
          <mj-image src="{{imagePath}}/mail-header.jpg"></mj-image>
        </mj-column>
      </mj-section>
      <mj-raw>
        <!-- Mail context -->
      </mj-raw>
      <mj-section>
        <mj-column width="400px">
          <mj-text font-size="20px" font-family="Helvetica Neue">Inlogmail aangevraagd</mj-text>
          <mj-text>Beste {{name or 'bezoeker'}},</mj-text>
          <mj-text color="#525252">Voor Admin panel is een inloglink aangevraagd voor dit emailadres. Klik op de knop hieronder om automatisch in te loggen. De knop is 10 minuten geldig. </mj-text>
          <mj-button background-color="#12B886" href="{{loginurl}}">Log in</mj-button>
        </mj-column>
      </mj-section>
      <mj-raw>
        <!-- Alternate link -->
      </mj-raw>
      <mj-section>
        <mj-column width="400px">
          <mj-text>Of gebruik deze link in je browser:</mj-text>
        </mj-column>
        <mj-column>
          <mj-text>{{loginurl}}</mj-text>
        </mj-column>
      </mj-section>
    </mj-body>
  </mjml>`;

const initialDataResourceSubmission = `<mjml> 
<mj-body> 
<mj-section> 
<mj-column> 
<mj-image width="300px" src="{{imagePath}}/logo-openstad.png"></mj-image> 
<mj-divider border-color="#666"></mj-divider> 

<mj-text font-size="20px" color="#111" font-family="helvetica">Nieuwe inzending</mj-text><br>
<mj-text font-size="16px" line-height="22px" color="#222" font-family="helvetica">Beste {{user.fullName | default('indiener')}},
<br><br>
Bedankt voor je inzending! Je inzending is goed ontvangen en staat nu online. Hieronder vind je een overzicht van je inzending.
<br><br>
</mj-text>
<mj-text font-size="14px" line-height="22px" color="#444" font-family="helvetica">
{{ submissionContent | safe }}
</mj-text>

 </mj-column> 
 </mj-section> 
 </mj-body> 
 </mjml>`;

const initialDataEnqueteSubmissionUser = `<mjml>
  <mj-body background-color="#f6f6f7">
    <mj-section background-color="#ffffff" padding="20px">
      <mj-column>
        <mj-text font-size="20px" color="#333333" font-family="Helvetica" align="center">
          Bedankt voor je Inzending
        </mj-text>
        <mj-divider border-color="#cccccc" border-width="1px"></mj-divider>
<mj-divider border-width="0" padding="10px" />

        <mj-text font-size="16px" color="#555555" font-family="Helvetica">
          Bedankt voor het invullen van onze enquête! Hieronder vind je een overzicht van je ingevulde gegevens.
        </mj-text>
<mj-divider border-width="0" padding="10px" />

        {{ enqueteContent | safe }}
<mj-divider border-width="0" padding="10px" />

        <mj-text font-size="16px" color="#555555" font-family="Helvetica">
          We nemen zo snel mogelijk contact met je op als dat nodig is.
        </mj-text>
<mj-divider border-width="0" padding="10px" />
        <mj-divider border-color="#cccccc" border-width="1px"></mj-divider>
        <mj-text font-size="14px" color="#999999" font-family="Helvetica" align="center">
          Als je vragen hebt, neem dan contact op via <a href="mailto:support@website.nl">support@website.nl</a>.
        </mj-text>
      </mj-column>
    </mj-section>
  </mj-body>
</mjml>
`;

const initialDataCommentNotification = `<mjml>
  <mj-body background-color="#f6f6f7">
    <!-- Main section for the email content -->
    <mj-section background-color="#ffffff" padding="20px">
      <mj-column>

        <!-- Title of the email -->
        <mj-text font-size="20px" color="#333333" font-family="Helvetica" align="center">
          Je hebt een nieuwe reactie ontvangen
        </mj-text>

        <!-- Divider line -->
        <mj-divider border-color="#cccccc" border-width="1px"></mj-divider>
        
        <!-- Introduction text based on conditions -->
        <mj-text font-size="16px" color="#444" font-family="Helvetica">
          {% if comment.sentiment == 'for' %}
            Hier zie je een positieve reactie op je inzending.
          {% elseif comment.sentiment == 'against' %}
            Hier zie je een negatieve reactie op je inzending.
          {% else %}
            Hier zie je de reactie op je inzending.
          {% endif %}
          
          Geplaatst op {{ comment.createDateHumanized }} 
          door {{ comment.userName or 'een anonieme gebruiker' }}.
          
          <!-- Embedded url link if Embedded url exist -->
          {% if embeddedUrl %}
            <a href="{{ embeddedUrl }}">Klik hier</a> om naar de inzending te gaan.    
          {% endif %}
        </mj-text>

        <!-- Divider line -->
        <mj-divider border-width="0" padding="10px" />
        
        <!-- The comment description itself -->
        <mj-text font-size="14px" font-weight="700" color="#444" font-family="Helvetica" align="center">
            Reactie:
          </mj-text>
        <mj-text font-size="14px" line-height="22px" color="#444" font-family="Helvetica">
          {{ comment.description }}
        </mj-text>

        <!-- Divider line -->
        <mj-divider border-width="0" padding="10px" />
        
        <!-- Unsubscribe link if unsubscribeUrl exist -->
        {% if unsubscribeUrl %}
          <mj-text font-size="14px" color="#444" font-family="Helvetica" align="center">
            Wil je je uitschrijven? Dat kan via de volgende link:
            <br />
            <a href="{{ unsubscribeUrl }}">Uitschrijven</a>
          </mj-text>
        {% endif %}
        
      </mj-column>
    </mj-section>
  </mj-body>
</mjml>
`;

const initialDataCommentReplyNotification = `<mjml>
  <mj-body background-color="#f6f6f7">
    <!-- Main section for the email content -->
    <mj-section background-color="#ffffff" padding="20px">
      <mj-column>

        <!-- Title of the email -->
        <mj-text font-size="20px" color="#333333" font-family="Helvetica" align="center">
          Je hebt een nieuwe reactie ontvangen
        </mj-text>

        <!-- Divider line -->
        <mj-divider border-color="#cccccc" border-width="1px"></mj-divider>
        
        <!-- Introduction text based on conditions -->
        <mj-text font-size="16px" color="#444" font-family="Helvetica">
          Hier zie je de reactie op je reactie.
          
          Geplaatst op {{ comment.createDateHumanized }} 
          door {{ comment.userName or 'een anonieme gebruiker' }}.
          
          <!-- Embedded url link if Embedded url exist -->
          {% if embeddedUrl %}
            <a href="{{ embeddedUrl }}">Klik hier</a> om naar de inzending te gaan.    
          {% endif %}
        </mj-text>

        <!-- Divider line -->
        <mj-divider border-width="0" padding="10px" />
        
        <!-- The comment description itself -->
        <mj-text font-size="14px" font-weight="700" color="#444" font-family="Helvetica" align="center">
            Reactie:
          </mj-text>
        <mj-text font-size="14px" line-height="22px" color="#444" font-family="Helvetica">
          {{ comment.description }}
        </mj-text>
        
        <!-- The parent comment description -->
        {% if comment.parentComment %}
          <mj-text font-size="14px" font-weight="700" color="#444" font-family="Helvetica" align="center">
              Jouw reactie:
            </mj-text>
          <mj-text font-size="14px" line-height="22px" color="#444" font-family="Helvetica">
            {{ comment.parentComment }}
          </mj-text>
        {% endif %}

        <!-- Divider line -->
        <mj-divider border-width="0" padding="10px" />
        
        <!-- Unsubscribe link if unsubscribeUrl exist -->
        {% if unsubscribeUrl %}
          <mj-text font-size="14px" color="#444" font-family="Helvetica" align="center">
            Wil je je uitschrijven? Dat kan via de volgende link:
            <br />
            <a href="{{ unsubscribeUrl }}">Uitschrijven</a>
          </mj-text>
        {% endif %}
        
      </mj-column>
    </mj-section>
  </mj-body>
</mjml>
`;

const initialDataEnqueteSubmissionAdmin = `<mjml>
  <mj-body background-color="#f6f6f7">
    <mj-section background-color="#ffffff" padding="20px">
      <mj-column>
        <mj-text font-size="20px" color="#333333" font-family="Helvetica" align="center">
          Nieuwe Enquête Inzending
        </mj-text>
        <mj-divider border-color="#cccccc" border-width="1px"></mj-divider>
<mj-divider border-width="0" padding="10px" />
        <mj-text font-size="16px" color="#555555" font-family="Helvetica">
          Hallo Admin,
        </mj-text>
        <mj-text font-size="16px" color="#555555" font-family="Helvetica">
          Er is een nieuwe inzending ontvangen van de enquête op de website.
        </mj-text>
<mj-divider border-width="0" padding="10px" />

        {{ enqueteContent | safe }}
        
<mj-divider border-width="0" padding="10px" />
        <mj-divider border-color="#cccccc" border-width="1px"></mj-divider>
        <mj-text font-size="14px" color="#999999" font-family="Helvetica" align="center">
          Dit is een automatisch bericht, antwoorden op deze e-mail is niet mogelijk.
        </mj-text>
      </mj-column>
    </mj-section>
  </mj-body>
</mjml>
`;

const initialDataAccountExpiry = `<mjml>
        <mj-body background-color="#f6f6f7">
            <mj-section background-color="#ffffff" padding="20px">
                <mj-column>

                    <mj-text font-size="20px" color="#333333" font-family="Helvetica" align="center">
                        We gaan je account verwijderen
                    </mj-text>

                    <mj-divider border-color="#cccccc" border-width="1px"></mj-divider>
                    <mj-divider border-width="0" padding="10px"  ></mj-divider>

                    <mj-text  line-height="1.3" font-size="16px" color="#555555" font-family="Helvetica">
                        Beste {{user.name or 'bezoeker'}},
                    </mj-text>

                    <mj-text  line-height="1.3" font-size="16px" color="#555555" font-family="Helvetica">
                        Je bent al een tijd niet actief geweest op de website
                        
                        {% if projectUrl %}
                            <a href="{{projectUrl}}">{{projectUrl}}</a>.
                        {% else %}
                            {{projectName}}.
                        {% endif %}
                        
                        We willen niet onnodig je gegevens blijven bewaren, en gaan die daarom verwijderen. Dat betekent dat een eventuele bijdrage die je hebt geleverd op de website, bijvoorbeeld inzendingen en/of reacties, geanonimiseerd worden.
                    </mj-text>

                    <mj-text  line-height="1.3" font-size="16px" color="#555555" font-family="Helvetica">
                        Wil je dit liever niet? Dan hoef je alleen een keer in te loggen op de website om je account actief te houden. Doe dit wel voor {{anonymizeDate}}, want anders gaan we op die dag je gegevens verwijderen.
                    </mj-text>

                    <mj-divider border-width="0" padding="10px" ></mj-divider>
                    <mj-divider border-color="#cccccc" border-width="1px"></mj-divider>

                    <mj-text  line-height="1.3" font-size="14px" color="#999999" font-family="Helvetica" align="center">
                        Dit is een automatisch bericht, antwoorden op deze e-mail is niet mogelijk.
                    </mj-text>
                </mj-column>
            </mj-section>
        </mj-body>
    </mjml>`;

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
    | 'notification comment reply - user';
  engine?: 'email' | 'sms';
  id?: string;
  label?: string;
  subject?: string;
  body?: string;
};

const notificationTypes = {
  'login email': 'Inloggen via e-mail',
  'login sms': 'Inloggen via sms',
  'new published resource - user feedback':
    'Nieuwe resource gepubliceerd - Notificatie naar de gebruiker',
  'new published resource - admin update':
    'Nieuwe resource gepubliceerd - Notificatie naar de admin',
  'updated resource - user feedback':
    'Resource bijgewerkt - Notificatie naar de gebruiker',
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
});

export function NotificationForm({
  type,
  engine,
  id,
  label,
  subject,
  body,
}: Props) {
  const router = useRouter();
  const project = router.query.project as string;
  const { data, create, update } = useNotificationTemplate(project as string);
  const notificationTitle = notificationTypes[type];
  // A stored template is updated, everything else is created. Keyed on the id
  // so a stored template with an empty label cannot take the create path and
  // POST a duplicate.
  const isExistingTemplate = !!id;

  type MailContextType = {
    user: { name: string; fullName: string };
    name: string;
    loginurl: string;
    imagePath: string;
    resource: any;
  };
  const [mailContext, setMailContext] = useState<MailContextType>({
    user: { name: 'Gebruiker', fullName: 'Gebruiker' },
    name: 'Gebruiker',
    loginurl: 'https://openstad.nl/login',
    imagePath: process.env.EMAIL_ASSETS_URL || '',
    resource: {
      tags: [],
    },
  });

  useEffect(() => {
    async function setUserNameInMailContext() {
      const user = await fetchSessionUser();

      if (user && user.name) {
        setMailContext((prev: MailContextType) => {
          return {
            ...prev,
            user: { name: user.name, fullName: user.name },
            name: user.name,
          };
        });
      }
    }

    setUserNameInMailContext();
  }, []);

  const defaultValueBody =
    body ||
    (type === 'new published resource - user feedback'
      ? initialDataResourceSubmission
      : '') ||
    (type === 'login email' ? initialData : '') ||
    (type === 'new enquete - admin' ? initialDataEnqueteSubmissionAdmin : '') ||
    (type === 'new enquete - user' ? initialDataEnqueteSubmissionUser : '') ||
    (type === 'notification comment - user'
      ? initialDataCommentNotification
      : '') ||
    (type === 'notification comment reply - user'
      ? initialDataCommentReplyNotification
      : '') ||
    (type === 'user account about to expire' ? initialDataAccountExpiry : '');

  const defaults = React.useCallback(
    () => ({
      engine: engine || 'email',
      label: label || '',
      subject: subject || '',
      body: defaultValueBody,
    }),
    // `type` feeds `defaultValueBody`, so it belongs here as well.
    [engine, label, subject, type, defaultValueBody]
  );

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver<any>(formSchema),
    defaultValues: defaults(),
  });

  const { watch } = form;
  const fieldValue = watch('body'); // Assuming 'engine' is the name of the field you're interested in

  // Guarded on `id`: only an existing template gets its values from SWR and can
  // therefore land mid-edit. A create instance never receives them, so its form
  // keeps the `defaultValues` it mounted with and typing in it is never reset.
  useSyncFormDefaults(form, defaults, id);

  const [templateData, setTemplateData] = useState(defaultValueBody || '');
  const [mjmlHtml, setMjmlHtml] = useState('');

  let mailTemplate: any = nunjucksEnv.renderString(templateData, mailContext);

  const [error, setError] = useState<string | null>(null);

  async function convertMJMLToHTML(data = mailTemplate) {
    if (data === '') {
      setMjmlHtml("<p style='text-align: center;'>Inhoud is leeg.</p>");
      // Without this a render error from an earlier value would stay on screen
      // and keep blocking this form's save.
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
      // An emptied field has nothing to render; this also clears a stale error.
      convertMJMLToHTML('');
      return;
    }
    try {
      convertMJMLToHTML(nunjucksEnv.renderString(fieldValue, mailContext));
    } catch (err) {
      setError('Er is een fout opgetreden bij het renderen van de template.');
    }
  }, [fieldValue]);

  const save = useCallback(async () => {
    // The save bar replaces `form.handleSubmit`, so the resolver has to be run
    // here: without it invalid values would be saved without any message.
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
    const values = formSchema.parse(sent);
    try {
      if (isExistingTemplate) {
        await update(id as string, values.label, values.subject, values.body);
      } else {
        await create(
          project,
          values.engine,
          type,
          values.label,
          values.subject,
          values.body
        );
      }
    } catch (requestError) {
      // The hook throws an English developer message; the save bar shows this
      // text to the user, so it is replaced here.
      throw new Error('Opslaan is mislukt. Probeer het opnieuw.');
    }
    rebaselineAfterSave(form, sent);
  }, [create, error, form, id, isExistingTemplate, project, type, update]);

  useRegisterSave({
    isDirty: form.formState.isDirty,
    save,
    label: notificationTitle,
  });

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
                        onKeyUpCapture={(e) => handleOnChange(e, field)}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {error && <p className="text-red-500">{error}</p>}
            </form>

            <div className="p-4">
              <iframe
                className="email-iframe"
                srcDoc={mjmlHtml}
                height={500}
                width={500}></iframe>
            </div>
          </div>
        </Form>
      </div>
    </div>
  );
}
