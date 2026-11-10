import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
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
import InfoDialog from '@/components/ui/info-hover';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PageLayout } from '@/components/ui/page-layout';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { Heading } from '@/components/ui/typography';
import { WhitelistedEmailSelect } from '@/components/ui/whitelisted-email-select';
import { isEmailNotificationConsentRequired } from '@/lib/email-consent';
import { isEmailList } from '@/lib/email-list';
import {
  WithWhitelistedEmailsProps,
  withWhitelistedEmails,
} from '@/lib/server-side-props-definition';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { useRouter } from 'next/router';
import * as React from 'react';
import { useCallback, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import * as z from 'zod';

import { useProject } from '../../../../hooks/use-project';

export const getServerSideProps = withWhitelistedEmails;

const formSchema = z.object({
  fromAddress: z.string().email(),
  projectmanagerAddress: z.string().refine(isEmailList, {
    message: 'Vul geldige e-mailadressen in, gescheiden met een komma.',
  }),
  fromName: z.string().optional(),
  sendUpdatedResourceAdminEmail: z.boolean().optional(),
  sendCommentAdminEmail: z.boolean().optional(),
  sendModBreakNotification: z.boolean().optional(),
  sendModBreakNotificationToCommenters: z.boolean().optional(),
  modBreakNotificationResourcePath: z.string().optional(),
  pdfAttachmentEnabled: z.boolean().optional(),
  pdfAttachmentAdminEnabled: z.boolean().optional(),
  pdfTitle: z.string().optional(),
  pdfDescription: z.string().optional(),
});

export default function ProjectSettingsNotifications({
  whitelistedEmails,
}: WithWhitelistedEmailsProps) {
  const category = 'notifications';

  const router = useRouter();
  const { project } = router.query;
  const { data, isLoading, updateProjectEmails, pdfAvailable } = useProject();
  const [consentExplanationOpen, setConsentExplanationOpen] =
    React.useState(false);
  const showConsentWarning =
    !!data && !isEmailNotificationConsentRequired(data.config);
  const defaults = useCallback(
    () => ({
      fromAddress: data?.emailConfig?.[category]?.fromAddress || '',
      fromName: data?.emailConfig?.[category]?.fromName || '',
      projectmanagerAddress:
        data?.emailConfig?.[category]?.projectmanagerAddress || null,
      sendUpdatedResourceAdminEmail:
        data?.emailConfig?.[category]?.sendUpdatedResourceAdminEmail || false,
      sendCommentAdminEmail:
        data?.emailConfig?.[category]?.sendCommentAdminEmail || false,
      sendModBreakNotification:
        data?.emailConfig?.[category]?.sendModBreakNotification || false,
      sendModBreakNotificationToCommenters:
        data?.emailConfig?.[category]?.sendModBreakNotificationToCommenters ||
        false,
      modBreakNotificationResourcePath:
        data?.emailConfig?.[category]?.modBreakNotificationResourcePath ?? '',
      pdfAttachmentEnabled:
        data?.emailConfig?.[category]?.pdfAttachmentEnabled || false,
      pdfAttachmentAdminEnabled:
        data?.emailConfig?.[category]?.pdfAttachmentAdminEnabled || false,
      pdfTitle: data?.emailConfig?.[category]?.pdfTitle ?? '',
      pdfDescription: data?.emailConfig?.[category]?.pdfDescription ?? '',
    }),
    [data?.emailConfig]
  );

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver<any>(formSchema),
    defaultValues: defaults(),
  });

  useEffect(() => {
    form.reset(defaults());
  }, [form, defaults]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      const project = await updateProjectEmails({
        [category]: {
          fromAddress: values.fromAddress,
          projectmanagerAddress: values.projectmanagerAddress,
          fromName: values.fromName,
          sendUpdatedResourceAdminEmail:
            values.sendUpdatedResourceAdminEmail || false,
          sendCommentAdminEmail: values.sendCommentAdminEmail || false,
          sendModBreakNotification: values.sendModBreakNotification || false,
          sendModBreakNotificationToCommenters:
            values.sendModBreakNotificationToCommenters || false,
          modBreakNotificationResourcePath:
            values.modBreakNotificationResourcePath || '',
          pdfAttachmentEnabled: values.pdfAttachmentEnabled || false,
          pdfAttachmentAdminEnabled: values.pdfAttachmentAdminEnabled || false,
          pdfTitle: values.pdfTitle || '',
          pdfDescription: values.pdfDescription || '',
        },
      });
      if (project) {
        toast.success('Project aangepast!');
      } else {
        toast.error('Er is helaas iets mis gegaan.');
      }
    } catch (error) {
      console.error('could not update', error);
    }
  }

  return (
    <div>
      <PageLayout
        breadcrumbs={[
          {
            name: 'Projecten',
            url: '/projects',
          },
          {
            name: 'Instellingen',
            url: `/projects/${project}/settings`,
          },
          {
            name: 'E-mail instellingen',
            url: `/projects/${project}/settings/notifications`,
          },
        ]}>
        <div className="container py-6">
          <Form {...form} className="p-6 bg-white rounded-md">
            <Heading size="xl">E-mail instellingen</Heading>
            <Separator className="my-4" />
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="lg:w-fit grid grid-cols-1 gap-6">
              <FormField
                control={form.control}
                name="fromAddress"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Vanaf welk mailadres worden de notificaties verstuurd?
                      <InfoDialog
                        content={
                          'Let op: dit werkt alleen als de domeininstellingen voor dit e-mailadres correct geconfigureerd zijn. Tip: maak hiervoor gebruik van Flowmailer of Sendgrid.'
                        }
                      />
                    </FormLabel>
                    <FormControl>
                      {whitelistedEmails.length > 0 ? (
                        <WhitelistedEmailSelect
                          field={field}
                          whitelistedEmails={whitelistedEmails}
                        />
                      ) : (
                        <Input placeholder="" {...field} />
                      )}
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="fromName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Wil je een naam toevoegen aan het e-mailadres waarvandaan
                      de notificaties worden verstuurd?
                      <InfoDialog
                        content={
                          'Let op: dit werkt alleen als de domeininstellingen voor dit e-mailadres correct geconfigureerd zijn. Tip: maak hiervoor gebruik van Flowmailer of Sendgrid.'
                        }
                      />
                    </FormLabel>
                    <FormDescription>
                      Als je hier een naam invult komt dit voor het e-mailadres
                      van de afzender te staan, bijvoorbeeld: OpenStad site
                      &#60;info@openstad.nl&#62;
                    </FormDescription>
                    <FormControl>
                      <Input placeholder="" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="sendUpdatedResourceAdminEmail"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Notificatie bij bewerken van inzendingen
                    </FormLabel>
                    <FormDescription>
                      Standaard uitgeschakeld. Schakel dit alleen in als je per
                      wijziging een e-mail wilt ontvangen.
                    </FormDescription>
                    <FormControl>
                      <div className="flex items-center gap-2">
                        <Checkbox
                          id={field.name}
                          checked={field.value}
                          onCheckedChange={(checked) =>
                            field.onChange(Boolean(checked))
                          }
                        />
                        <Label htmlFor={field.name} className="cursor-pointer">
                          E-mail sturen naar beheerder als een inzending is
                          bijgewerkt
                        </Label>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="sendCommentAdminEmail"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notificatie bij nieuwe reactie</FormLabel>
                    <FormDescription>
                      Standaard uitgeschakeld. Schakel dit in om een e-mail te
                      ontvangen bij elke nieuwe reactie of reactie op een
                      reactie.
                    </FormDescription>
                    <FormControl>
                      <div className="flex items-center gap-2">
                        <Checkbox
                          id={field.name}
                          checked={field.value}
                          onCheckedChange={(checked) =>
                            field.onChange(Boolean(checked))
                          }
                        />
                        <Label htmlFor={field.name} className="cursor-pointer">
                          E-mail sturen naar beheerder bij een nieuwe reactie
                        </Label>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-1 gap-0 mt-4">
                {showConsentWarning && (
                  <Alert variant="warning">
                    <AlertTitle>Let op!</AlertTitle>
                    <AlertDescription>
                      <p>
                        Het veld{' '}
                        <b>&apos;E-mail notificatie toestemming&apos;</b> is
                        niet opgenomen in de verplichte velden. Hierdoor krijgen
                        inzenders en reageerders bij het inloggen niet de vraag
                        of ze e-mails willen ontvangen. Zonder die toestemming
                        ontvangen zij geen e-mail over een officiële reactie.
                      </p>
                      <p className="mt-2">
                        Voeg het veld toe op de pagina{' '}
                        <Link
                          href={`/projects/${project}/authentication/requiredfields`}
                          className="underline">
                          Authenticatie &gt; Verplichte velden
                        </Link>
                        .
                      </p>
                      <button
                        type="button"
                        className="mt-2 underline"
                        aria-expanded={consentExplanationOpen}
                        aria-controls="modbreak-consent-explanation"
                        onClick={() =>
                          setConsentExplanationOpen((open) => !open)
                        }>
                        {consentExplanationOpen
                          ? 'Minder uitleg'
                          : 'Waarom komt er geen mail aan?'}
                      </button>
                      {consentExplanationOpen && (
                        <div id="modbreak-consent-explanation" className="mt-2">
                          <p>
                            Een e-mail over een officiële reactie gaat alleen
                            uit als <b>beide</b> aan staan:
                          </p>
                          <ol className="list-decimal pl-5 mt-1">
                            <li>
                              <b>Per project:</b> de optie voor officiële
                              reacties hieronder, op deze pagina.
                            </li>
                            <li>
                              <b>Per gebruiker, per project:</b> de toestemming
                              voor e-mailnotificaties van de ontvanger. Iemand
                              kan in het ene project wel toestemming hebben en
                              in een ander project niet.
                            </li>
                          </ol>
                          <p className="mt-2">
                            Een gebruiker geeft toestemming bij het inloggen
                            (als het veld verplicht is) of op zijn accountpagina
                            (als de account-widget het toestemmingsveld toont).
                            Een superbeheerder kan de toestemming zien en
                            aanpassen bij{' '}
                            <i>
                              Gebruikers &gt; gebruiker &gt; Projectsrechten
                            </i>
                            .
                          </p>
                        </div>
                      )}
                    </AlertDescription>
                  </Alert>
                )}
                <FormField
                  control={form.control}
                  name="sendModBreakNotification"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Melding over een officiële reactie aan de indiener
                      </FormLabel>
                      <FormDescription>
                        Standaard uitgeschakeld. De indiener van de inzending
                        ontvangt een e-mail zodra de redactie een officiële
                        reactie plaatst of de tekst van een bestaande officiële
                        reactie aanpast. Alleen als de indiener in dit project
                        toestemming heeft gegeven voor e-mailnotificaties.
                      </FormDescription>
                      <FormControl>
                        <div className="flex items-center gap-2">
                          <Checkbox
                            id={field.name}
                            checked={field.value}
                            onCheckedChange={(checked) =>
                              field.onChange(Boolean(checked))
                            }
                          />
                          <Label
                            htmlFor={field.name}
                            className="cursor-pointer">
                            E-mail sturen naar de indiener als er een officiële
                            reactie is geplaatst of aangepast
                          </Label>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="sendModBreakNotificationToCommenters"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Melding over een officiële reactie aan reageerders
                    </FormLabel>
                    <FormDescription>
                      Standaard uitgeschakeld. Staat los van de optie hierboven.
                      Alleen reageerders die in dit project toestemming hebben
                      gegeven voor e-mailnotificaties ontvangen deze mail.
                    </FormDescription>
                    <FormControl>
                      <div className="flex items-center gap-2">
                        <Checkbox
                          id={field.name}
                          checked={field.value}
                          onCheckedChange={(checked) =>
                            field.onChange(Boolean(checked))
                          }
                        />
                        <Label htmlFor={field.name} className="cursor-pointer">
                          E-mail sturen naar reageerders op de inzending als er
                          een officiële reactie is geplaatst of aangepast
                        </Label>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="modBreakNotificationResourcePath"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Pad naar de inzending in de e-mail over een officiële
                      reactie
                    </FormLabel>
                    <FormDescription>
                      Volledige URL of pad van de pagina met de inzending. Een
                      pad wordt achter de project-URL geplakt. [id] wordt
                      vervangen door het ID van de inzending. Zonder [id] wordt
                      ?openstadResourceId= met het ID automatisch toegevoegd.
                      Leeg laten = geen knop in de mail.
                    </FormDescription>
                    <FormControl>
                      <Input
                        placeholder="https://www.voorbeeld.nl/inzending?openstadResourceId=[id]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="projectmanagerAddress"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Naar welke e-mailadressen worden beheerder-notificaties
                      verstuurd?
                      <InfoDialog
                        content={
                          'Dit zijn de adressen waar automatische beheerder-notificaties naartoe gaan, zoals nieuwe formulier-inzendingen, bewerkte inzendingen en nieuwe reacties. Zonder een geldig adres hier worden er geen beheerder-notificaties verzonden.'
                        }
                      />
                    </FormLabel>
                    <FormDescription>
                      Meerdere e-mailadressen zijn mogelijk, mits ze gescheiden
                      zijn met een komma.
                    </FormDescription>
                    <FormControl>
                      <Input placeholder="" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Separator className="my-4" />
              <Heading size="lg">PDF bijlage instellingen</Heading>
              <FormField
                control={form.control}
                name="pdfAttachmentEnabled"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>PDF bijlage</FormLabel>
                    <FormDescription>
                      Wanneer ingeschakeld wordt er een PDF bijlage meegestuurd
                      met de bevestigingsmail na het indienen van een inzending.
                    </FormDescription>
                    <FormControl>
                      <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-2">
                          <Checkbox
                            id={field.name}
                            checked={field.value}
                            disabled={pdfAvailable === false}
                            onCheckedChange={(checked) =>
                              field.onChange(Boolean(checked))
                            }
                          />
                          <Label
                            htmlFor={field.name}
                            className="cursor-pointer">
                            PDF bijlage meesturen bij bevestigingsmails
                          </Label>
                        </div>
                        {pdfAvailable === false && (
                          <p className="text-sm text-orange-600">
                            PDF generatie is niet beschikbaar. De benodigde
                            server-configuratie ontbreekt.
                          </p>
                        )}
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="pdfAttachmentAdminEnabled"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>PDF bijlage naar beheerder</FormLabel>
                    <FormDescription>
                      Wanneer ingeschakeld wordt de PDF ook meegestuurd met de
                      beheerdersmail na het indienen van een inzending.
                    </FormDescription>
                    <FormControl>
                      <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-2">
                          <Checkbox
                            id={field.name}
                            checked={field.value}
                            disabled={pdfAvailable === false}
                            onCheckedChange={(checked) =>
                              field.onChange(Boolean(checked))
                            }
                          />
                          <Label
                            htmlFor={field.name}
                            className="cursor-pointer">
                            PDF bijlage meesturen met de beheerdersmail
                          </Label>
                        </div>
                        {pdfAvailable === false && (
                          <p className="text-sm text-orange-600">
                            PDF generatie is niet beschikbaar. De benodigde
                            server-configuratie ontbreekt.
                          </p>
                        )}
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="pdfTitle"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Titel van de PDF bijlage
                      <InfoDialog
                        content={
                          'Deze titel wordt bovenaan de PDF weergegeven die als bijlage bij de bevestigingsmail wordt meegestuurd.'
                        }
                      />
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Nieuwe inzending"
                        disabled={!form.watch('pdfAttachmentEnabled')}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="pdfDescription"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Beschrijving van de PDF bijlage
                      <InfoDialog
                        content={
                          'Deze beschrijving wordt onder de titel weergegeven in de PDF bijlage.'
                        }
                      />
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Er is een nieuwe inzending ontvangen."
                        disabled={!form.watch('pdfAttachmentEnabled')}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit">Opslaan</Button>
            </form>
          </Form>
        </div>
      </PageLayout>
    </div>
  );
}
