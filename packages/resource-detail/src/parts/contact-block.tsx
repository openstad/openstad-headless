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
  FormField,
  FormFieldDescription,
  FormLabel,
  Heading,
  Paragraph,
  Select,
  SelectOption,
  Textarea,
} from '@utrecht/component-library-react';
import React, { useEffect, useId, useState } from 'react';

import './contact-block.css';
import { contactTextDefaults, validateContact } from './links-helpers';

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
  showOwnResource?: boolean;
  ownResourceLabel?: string;
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
};

type OwnResource = { id: string; label: string };

export function ContactBlock({
  projectId,
  resourceId,
  api,
  login,
  headingLevel,
  currentUserProps,
  title = 'Wil je contact opnemen met de indiener?',
  description,
  buttonText = 'Stuur een bericht',
  handler = '',
  popupTitle = 'Je gaat een bericht versturen',
  popupDescription,
  showMessage = true,
  messageLabel = 'Typ je bericht',
  showConsent = true,
  consentLabel,
  showOwnResource = false,
  ownResourceLabel = 'Kies je inzending',
  ownResourceTags,
  ownResourceEmptyText = 'Je hebt nog geen inzending die je hiervoor kunt kiezen.',
  loginTitle = 'Log in om een bericht te versturen',
  loginDescription,
  loginButtonText = 'Inloggen',
  successMessage = 'Je bericht is verstuurd.',
}: Props) {
  const defaults = contactTextDefaults(handler);
  const descriptionText = description ?? defaults.description;
  const popupDescriptionText = popupDescription ?? defaults.popupDescription;
  const consentLabelText = consentLabel ?? defaults.consentLabel;
  const loginDescriptionText = loginDescription ?? defaults.loginDescription;
  const datastore: any = new DataStore({ projectId, api });
  const { data: currentUser } = datastore.useCurrentUser({
    ...currentUserProps,
  });

  const fieldId = useId();
  const [loginOpen, setLoginOpen] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [consent, setConsent] = useState(false);
  const [ownResources, setOwnResources] = useState<OwnResource[] | null>(null);
  const [ownResourceId, setOwnResourceId] = useState('');
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
        const list = Array.isArray(options) ? options : [];
        setOwnResources(list);
        setOwnResourceId(list.length === 1 ? list[0].id : '');
      })
      .catch((err: Error) => {
        if (cancelled) return;
        setOwnResources([]);
        setError(err?.message || 'Je inzendingen konden niet worden geladen');
      });
    return () => {
      cancelled = true;
    };
  }, [formOpen, showOwnResource, ownResourceTags, projectId]);

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
    setOwnResourceId('');
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
      ownResourceId,
      messageRequiredText: 'Vul een bericht in.',
      consentRequiredText:
        'Geef toestemming voor het delen van je e-mailadres.',
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
          fields: showOwnResource ? { resourceId: ownResourceId } : {},
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
            <FormField type="select">
              <Paragraph className="utrecht-form-field__label">
                {ownResources && ownResources.length === 0 ? (
                  <strong>{ownResourceLabel}</strong>
                ) : (
                  <FormLabel htmlFor={ownResourceFieldId}>
                    {ownResourceLabel}
                  </FormLabel>
                )}
              </Paragraph>
              {ownResources && ownResources.length === 0 ? (
                <FormFieldDescription>
                  {ownResourceEmptyText}
                </FormFieldDescription>
              ) : (
                <Select
                  id={ownResourceFieldId}
                  value={ownResourceId}
                  disabled={!ownResources}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                    setOwnResourceId(e.target.value)
                  }>
                  <SelectOption value="">Selecteer een inzending</SelectOption>
                  {(ownResources || []).map((option) => (
                    <SelectOption key={option.id} value={option.id}>
                      {option.label}
                    </SelectOption>
                  ))}
                </Select>
              )}
            </FormField>
          ) : null}

          {showMessage ? (
            <FormField type="text">
              <Paragraph className="utrecht-form-field__label">
                <FormLabel htmlFor={messageId}>{messageLabel}</FormLabel>
              </Paragraph>
              <Textarea
                id={messageId}
                maxLength={MAX_MESSAGE_LENGTH}
                value={message}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                  setMessage(e.target.value)
                }
              />
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
                {consentLabelText}
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
