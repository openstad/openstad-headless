import DataStore from '@openstad-headless/data-store/src';
import {
  Button,
  Dialog,
  DialogDescription,
  DialogTitle,
  SecondaryButton,
} from '@openstad-headless/ui/src/index.js';
import RteContent from '@openstad-headless/ui/src/rte-formatting/rte-content';
import {
  Checkbox,
  Fieldset,
  FieldsetLegend,
  FormField,
  FormFieldDescription,
  FormLabel,
  Heading,
  Paragraph,
  Textarea,
} from '@utrecht/component-library-react';
import React, { useEffect, useId, useState } from 'react';

import './contact-block.css';
import {
  type PrivacyConsent,
  consentLabelParts,
  consentLabelPlain,
  contactConsent,
  contactTextDefaults,
  validateContact,
  withoutLinked,
} from './links-helpers';

const MAX_MESSAGE_LENGTH = 2000;

export type ContactBlockProps = {
  display?: boolean;
  title?: string;
  description?: string;
  buttonText?: string;
  handler?: string;
  popupTitle?: string;
  popupDescription?: string;
  showMessage?: boolean;
  messageLabel?: string;
  showConsent?: boolean;
  consentLabel?: string;
  privacyUrl?: string;
  privacyConsent?: PrivacyConsent | null;
  showOwnResource?: boolean;
  ownResourceLabel?: string;
  ownResourceDescription?: string;
  ownResourceTags?: string;
  ownResourceEmptyText?: string;
  loginTitle?: string;
  loginDescription?: string;
  loginButtonText?: string;
  successMessage?: string;
};

type Props = ContactBlockProps & {
  projectId?: string;
  resourceId?: string;
  api?: any;
  login?: { url?: string };
  headingLevel: number;
  currentUserProps: any;
  ownerId?: number;
};

type OwnResource = { id: string; label: string };

function ConsentLabel({
  label,
  privacyUrl,
  linkText,
}: {
  label: string;
  privacyUrl?: string;
  linkText?: string;
}) {
  const parts = consentLabelParts(label, privacyUrl, linkText);
  if (!parts) return <>{consentLabelPlain(label, linkText)}</>;
  return (
    <>
      {parts.before}
      <a href={privacyUrl} target="_blank" rel="noreferrer noopener">
        {parts.linkText}
        <span className="sr-only"> (opent in nieuw tabblad)</span>
      </a>
      {parts.after}
    </>
  );
}

export function ContactBlock({
  projectId,
  resourceId,
  api,
  login,
  headingLevel,
  currentUserProps,
  ownerId,
  title = 'Contact opnemen met de indiener',
  description,
  buttonText = 'Stuur een bericht',
  handler = '',
  popupTitle = 'Bericht versturen',
  popupDescription,
  showMessage = true,
  messageLabel = 'Bericht',
  showConsent = true,
  consentLabel,
  privacyUrl,
  privacyConsent,
  showOwnResource = false,
  ownResourceLabel = 'Kies een eigen inzending',
  ownResourceDescription,
  ownResourceTags,
  ownResourceEmptyText = 'Er is nog geen eigen inzending die hiervoor gekozen kan worden.',
  loginTitle = 'Log in om een bericht te versturen',
  loginDescription,
  loginButtonText = 'Inloggen',
  successMessage = 'Het bericht is verstuurd.',
}: Props) {
  const defaults = contactTextDefaults(handler);
  const descriptionText = description ?? defaults.description;
  const popupDescriptionText = popupDescription ?? defaults.popupDescription;
  const consentText = contactConsent({
    handler,
    consentLabel,
    privacyUrl,
    privacyConsent,
  });
  const loginDescriptionText = loginDescription ?? defaults.loginDescription;
  const datastore: any = new DataStore({ projectId, api });
  const { data: currentUser } = datastore.useCurrentUser({
    ...currentUserProps,
  });
  const { data: viewedLinks } = datastore.useResourceLinks({
    projectId,
    resourceId,
  });

  const fieldId = useId();
  const [loginOpen, setLoginOpen] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [consent, setConsent] = useState(false);
  const [ownResources, setOwnResources] = useState<OwnResource[] | null>(null);
  const [ownResourceIds, setOwnResourceIds] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState('');
  const [sending, setSending] = useState(false);

  const isLoggedIn = !!currentUser?.id;
  const isDefaultHandler = !handler;

  useEffect(() => {
    if (!formOpen || !showOwnResource) return;
    let cancelled = false;
    datastore.api.links
      .fetchOptions({
        projectId,
        source: 'openstad',
        mine: true,
        tags: ownResourceTags,
      })
      .then((options: OwnResource[]) => {
        if (cancelled) return;
        setOwnResources(Array.isArray(options) ? options : []);
      })
      .catch((err: Error) => {
        if (cancelled) return;
        setOwnResources([]);
        setError(
          err?.message || 'De eigen inzendingen konden niet worden geladen'
        );
      });
    return () => {
      cancelled = true;
    };
  }, [formOpen, showOwnResource, ownResourceTags, projectId]);

  const choosableResources = ownResources
    ? withoutLinked(ownResources, viewedLinks || [])
    : null;
  const choosableKey = (choosableResources || [])
    .map((option) => option.id)
    .join(',');

  useEffect(() => {
    if (!choosableResources) return;
    setOwnResourceIds(
      choosableResources.length === 1 ? [choosableResources[0].id] : []
    );
  }, [choosableKey]);

  const openForm = () => {
    setStatus('');
    if (!isLoggedIn) {
      setLoginOpen(true);
      return;
    }
    setMessage('');
    setConsent(false);
    setError(null);
    setOwnResources(null);
    setOwnResourceIds([]);
    setFormOpen(true);
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    const validationError = validateContact({
      isDefaultHandler,
      showMessage,
      showConsent,
      showOwnResource,
      message,
      consent,
      ownResourceIds,
      messageRequiredText: 'Vul een bericht in.',
      consentRequiredText:
        'Geef toestemming voor het delen van het e-mailadres.',
      ownResourceRequiredText: 'Kies een inzending.',
    });
    if (validationError) {
      setError(validationError);
      return;
    }

    setSending(true);
    setError(null);
    try {
      await datastore.api.links.sendContact(
        { projectId, resourceId },
        {
          message: showMessage ? message : '',
          consent: showConsent ? consent : false,
          ...(handler ? { handler } : {}),
          fields: showOwnResource ? { resourceIds: ownResourceIds } : {},
        }
      );
      setFormOpen(false);
      setStatus(successMessage);
    } catch (err: any) {
      setError(err?.message || 'Het versturen is mislukt.');
    } finally {
      setSending(false);
    }
  };

  const messageId = `${fieldId}-message`;
  const consentId = `${fieldId}-consent`;
  const ownResourceFieldId = `${fieldId}-own-resource`;
  const errorId = `${fieldId}-error`;

  if (isLoggedIn && ownerId && currentUser.id === ownerId) return null;

  return (
    <section className="osc-contact-block">
      <div className="osc-contact-block-content">
        <Heading level={headingLevel} appearance="utrecht-heading-4">
          {title}
        </Heading>
        {descriptionText ? (
          <RteContent content={descriptionText} unwrapSingleRootDiv={true} />
        ) : null}
      </div>
      <Button type="button" onClick={openForm}>
        {buttonText}
      </Button>
      <p className="osc-contact-block-status" role="status">
        {status}
      </p>

      <Dialog
        open={loginOpen}
        onOpenChange={setLoginOpen}
        className="osc-contact-block-dialog">
        <div className="osc-contact-block-dialog-body">
          <DialogTitle>{loginTitle}</DialogTitle>
          <DialogDescription>
            <Paragraph>{loginDescriptionText}</Paragraph>
          </DialogDescription>
          <div className="osc-contact-block-actions">
            <Button
              type="button"
              onClick={() => {
                document.location.href = login?.url || '';
              }}>
              {loginButtonText}
            </Button>
            <SecondaryButton type="button" onClick={() => setLoginOpen(false)}>
              Annuleren
            </SecondaryButton>
          </div>
        </div>
      </Dialog>

      <Dialog
        open={formOpen}
        onOpenChange={setFormOpen}
        className="osc-contact-block-dialog">
        <form
          className="osc-contact-block-dialog-body"
          noValidate
          onSubmit={submit}>
          <DialogTitle>{popupTitle}</DialogTitle>
          <DialogDescription>
            <RteContent
              content={popupDescriptionText}
              unwrapSingleRootDiv={true}
            />
          </DialogDescription>

          {showOwnResource ? (
            <Fieldset className="osc-contact-block-own-resources">
              <FieldsetLegend>{ownResourceLabel}</FieldsetLegend>
              {ownResourceDescription &&
              !(choosableResources && choosableResources.length === 0) ? (
                <div className="osc-contact-block-own-resources-description">
                  <RteContent
                    content={ownResourceDescription}
                    unwrapSingleRootDiv={true}
                  />
                </div>
              ) : null}
              {!choosableResources ? (
                <Paragraph>Laden...</Paragraph>
              ) : choosableResources.length === 0 ? (
                <FormFieldDescription>
                  {ownResourceEmptyText}
                </FormFieldDescription>
              ) : (
                choosableResources.map((option) => {
                  const optionId = `${ownResourceFieldId}-${option.id}`;
                  return (
                    <FormField type="checkbox" key={option.id}>
                      <Checkbox
                        id={optionId}
                        checked={ownResourceIds.includes(option.id)}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                          setOwnResourceIds((current) =>
                            e.target.checked
                              ? [...current, option.id]
                              : current.filter((id) => id !== option.id)
                          )
                        }
                      />
                      <FormLabel htmlFor={optionId} type="checkbox">
                        {option.label}
                      </FormLabel>
                    </FormField>
                  );
                })
              )}
            </Fieldset>
          ) : null}

          {showMessage ? (
            <FormField type="text">
              <Paragraph className="utrecht-form-field__label">
                <FormLabel htmlFor={messageId}>{messageLabel}</FormLabel>
              </Paragraph>
              <div className="utrecht-form-field__input">
                <Textarea
                  id={messageId}
                  maxLength={MAX_MESSAGE_LENGTH}
                  value={message}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                    setMessage(e.target.value)
                  }
                />
              </div>
            </FormField>
          ) : null}

          {showConsent ? (
            <FormField type="checkbox">
              <Checkbox
                id={consentId}
                checked={consent}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setConsent(e.target.checked)
                }
              />
              <FormLabel htmlFor={consentId} type="checkbox">
                <ConsentLabel
                  label={consentText.label}
                  privacyUrl={consentText.url}
                  linkText={consentText.linkText}
                />
              </FormLabel>
            </FormField>
          ) : null}

          {error ? (
            <p id={errorId} className="osc-contact-block-error" role="alert">
              {error}
            </p>
          ) : null}

          <div className="osc-contact-block-actions">
            <Button type="submit" disabled={sending}>
              Versturen
            </Button>
            <SecondaryButton type="button" onClick={() => setFormOpen(false)}>
              Annuleren
            </SecondaryButton>
          </div>
        </form>
      </Dialog>
    </section>
  );
}
