import * as React from 'react';
import { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter } from 'next/router';
import toast from 'react-hot-toast';
import nunjucks from 'nunjucks';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Heading } from '@/components/ui/typography';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';

import useNotificationTemplate from '@/hooks/use-notification-template';
import { fetchSessionUser } from '@/auth';

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

type Props = {
  type:
  | 'login email'
  | 'login sms'
  | 'new published resource - user feedback'
  | 'new published resource - admin update'
  | 'updated resource - user feedback'
  | 'user account about to expire'
  | 'new enquete - admin'
  | 'new enquete - user';
  engine?: 'email' | 'sms';
  id?: string;
  label?: string;
  subject?: string;
  body?: string;
}

const notificationTypes = {
  'login email': 'Inloggen via e-mail',
  'login sms': 'Inloggen via sms',
  'new published resource - user feedback': 'Nieuwe resource gepubliceerd - Notificatie naar de gebruiker',
  'new published resource - admin update': 'Nieuwe resource gepubliceerd - Notificatie naar de admin',
  'updated resource - user feedback': 'Resource bijgewerkt - Notificatie naar de gebruiker',
  'user account about to expire': 'Gebruikersaccount staat op het punt te verlopen',
  'new enquete - admin': 'Nieuwe formulier inzending - Notificatie naar de admin',
  'new enquete - user': 'Nieuwe formulier inzending - Notificatie naar de gebruiker'
};

const formSchema = z.object({
  engine: z.enum(['email', 'sms']),
  label: z.string().min(1, {
    message: 'De label mag niet leeg zijn!',
  }).max(255, {
    message: 'De label mag niet langer dan 255 karakters zijn!',
  }),
  subject: z.string().min(1, {
    message: 'Het onderwerp mag niet leeg zijn!',
  }).max(255, {
    message: 'Het onderwerp mag niet langer dan 255 karakters zijn!',
  }),
  body: z.string().min(1, {
    message: 'De inhoud mag niet leeg zijn!',
  }),
});

export function NotificationForm({ type, engine, id, label, subject, body }: Props) {
  const router = useRouter();
  const project = router.query.project as string;
  const { data, create, update } = useNotificationTemplate(project as string)
  const notificationTitle = notificationTypes[type];

  type MailContextType = {
    user: { name: string, fullName: string },
    name: string,
    loginurl: string,
    imagePath: string,
  };
  const [mailContext, setMailContext] = useState<MailContextType>({
    user: { name: 'Gebruiker', fullName: 'Gebruiker' },
    name: 'Gebruiker',
    loginurl: 'https://openstad.nl/login',
    imagePath: process.env.EMAIL_ASSETS_URL || '',
  });

  useEffect(() => {
    async function setUserNameInMailContext() {
      const user = await fetchSessionUser();

      if (user && user.name) {
        setMailContext((prev: MailContextType) => {
          return { ...prev, user: { name: user.name, fullName: user.name }, name: user.name };
        });
      }
    }

    setUserNameInMailContext();
  }, []);

  const defaultValueBody = body
      || ( type === 'new published resource - user feedback' ? initialDataResourceSubmission : "" )
      || ( type === 'login email' ? initialData : "" )
      || ( type === 'new enquete - admin' ? initialDataEnqueteSubmissionAdmin : "" )
      || ( type === 'new enquete - user' ? initialDataEnqueteSubmissionUser : "" )

  const defaults = React.useCallback(
    () => ({
      engine: engine || "email",
      label: label || "",
      subject: subject || "",
      body: defaultValueBody
    }),
    [engine, label, subject, body]
  )

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver<any>(formSchema),
    defaultValues: defaults(),
  });


  const { watch } = form;
  const fieldValue = watch('body'); // Assuming 'engine' is the name of the field you're interested in

  useEffect(() => {
    form.reset(defaults());
  }, [form, defaults]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (label && subject && body !== undefined) {
      const template = await update(id as string, values.label, values.subject, values.body)
      if (template) {
        toast.success('Template aangepast!');
      } else {
        toast.error('Er is helaas iets mis gegaan.')
      }
    } else {
      const template = await create(project, values.engine, type, values.label, values.subject, values.body)
      if (template) {
        toast.success('Template aangemaakt!');
      } else {
        toast.error('Er is helaas iets mis gegaan.')
      }
    }
  }

  const [templateData, setTemplateData] = useState(defaultValueBody || "");
  const [mjmlHtml, setMjmlHtml] = useState('');

  let mailTemplate: any = nunjucks.renderString(templateData, mailContext);

  const [error, setError] = useState<string | null>(null);

  async function convertMJMLToHTML(data = mailTemplate) {
    if ( data === '' ) {
      setMjmlHtml("<p style='text-align: center;'>Inhoud is leeg.</p>");
      return;
    }

    try {
      const mjml2html = (await import('mjml-browser')).default;
      const htmlOutput = mjml2html(data).html;
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
        convertMJMLToHTML(nunjucks.renderString(e.target.value, mailContext));
      } catch (err) {
        setError('Er is een fout opgetreden bij het renderen van de template.');
      }
    }
  }

  useEffect(() => {
    if (fieldValue) {
      try {
        convertMJMLToHTML(nunjucks.renderString(fieldValue, mailContext));
      } catch (err) {
        setError('Er is een fout opgetreden bij het renderen van de template.');
      }
    }
  }, [fieldValue]);

  return (
    <div>
      <div className="container px-0 py-6">
        <Form {...form} className="px-0 py-6 bg-white rounded-md">
          <Heading size="xl">{notificationTitle}</Heading>
          <Separator className="my-4" />
          <div className="grid grid-cols-2">
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-4">
              {label && subject && body !== undefined ? null :
                <FormField
                  control={form.control}
                  name="engine"
                  render={({ field }) => (
                    <FormItem className="col-span-1">
                      <FormLabel>
                        Wat voor client gaat gebruikt worden voor dit onderdeel?
                      </FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="email" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="email">
                            Email
                          </SelectItem>
                          <SelectItem value="sms">
                            SMS
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              }
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
                        defaultValue={field.value.length > 0 ? field.value : body}
                        rows={20}
                        onKeyUpCapture={(e) => handleOnChange(e, field)}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={!!error}>Opslaan</Button>
              {error && <p className="text-red-500">{error}</p>}
            </form>

              <div className="p-4">
                <iframe className='email-iframe' srcDoc={mjmlHtml} height={500} width={500}></iframe>
              </div>

          </div>
        </Form>
      </div>
    </div>
  );
}
