import '@utrecht/component-library-css';
import {
  Button,
  Checkbox,
  FormField,
  FormLabel,
  Heading,
  Paragraph,
  Textbox,
} from '@utrecht/component-library-react';
import React, { FormEvent, useEffect, useId, useRef } from 'react';

import { Dialog } from '../dialog';
import {
  fieldLabelFor,
  fieldTypeFor,
  isFieldRequired,
  readFieldValues,
  splitLinkLabel,
} from './fields';
import './index.css';

export type LoginDialogStep = 'uniquecode' | 'fields';
export type LoginDialogError =
  | 'code_required'
  | 'invalid_code'
  | 'too_many_attempts'
  | 'invalid_access_code';

export type LoginDialogTexts = {
  codeTitle: string;
  codeIntro: string;
  codeLabel: string;
  codeSubmit: string;
  fieldsTitle: string;
  fieldsIntro: string;
  fieldsSubmit: string;
  newTabHint: string;
  errors: Record<LoginDialogError, string>;
};

export const loginDialogTexts: LoginDialogTexts = {
  codeTitle: 'Vul je stemcode in',
  codeIntro: 'Voor dit project heb je een stemcode nodig.',
  codeLabel: 'Stemcode',
  codeSubmit: 'Verder',
  fieldsTitle: 'Nog een paar gegevens',
  fieldsIntro:
    'Voor dit project hebben we nog de volgende gegevens van je nodig.',
  fieldsSubmit: 'Opslaan',
  newTabHint: '(opent in nieuw tabblad)',
  errors: {
    code_required: 'Vul je stemcode in.',
    invalid_code: 'Deze stemcode is niet geldig.',
    too_many_attempts:
      'Te veel pogingen. Probeer het over een kwartier opnieuw.',
    invalid_access_code: 'Deze toegangscode is niet geldig.',
  },
};

export type LoginDialogContentProps = {
  titleId: string;
  step: LoginDialogStep;
  missingFields?: string[];
  labels?: Record<string, string>;
  privacy?: { url: string; text: string } | null;
  error?: LoginDialogError;
  busy?: boolean;
  texts: LoginDialogTexts;
  onSubmitCode: (code: string) => void;
  onSubmitFields: (values: Record<string, string | boolean>) => void;
};

export function LoginDialogContent({
  titleId,
  step,
  missingFields = [],
  labels = {},
  privacy = null,
  error,
  busy = false,
  texts,
  onSubmitCode,
  onSubmitFields,
}: LoginDialogContentProps) {
  const baseId = useId();
  const errorId = `${baseId}-error`;
  const describedBy = error ? errorId : undefined;
  const errorMessage = error ? (
    <Paragraph id={errorId} role="alert" className="osc-login-dialog-error">
      {texts.errors[error]}
    </Paragraph>
  ) : null;

  if (step === 'uniquecode') {
    const codeId = `${baseId}-code`;
    const submitCode = (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      onSubmitCode(
        String(new FormData(event.currentTarget).get('code') || '').trim()
      );
    };

    return (
      <form className="osc-login-dialog" onSubmit={submitCode}>
        <Heading level={2} id={titleId}>
          {texts.codeTitle}
        </Heading>
        <Paragraph>{texts.codeIntro}</Paragraph>
        {errorMessage}
        <FormField>
          <Paragraph>
            <FormLabel htmlFor={codeId}>{texts.codeLabel}</FormLabel>
          </Paragraph>
          <Textbox
            id={codeId}
            name="code"
            autoComplete="off"
            autoFocus
            required
            inputRequired
            invalid={!!error}
            aria-describedby={describedBy}
          />
        </FormField>
        <Button
          type="submit"
          appearance="primary-action-button"
          disabled={busy}>
          {texts.codeSubmit}
        </Button>
      </form>
    );
  }

  const submitFields = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSubmitFields(
      readFieldValues(new FormData(event.currentTarget), missingFields)
    );
  };

  return (
    <form className="osc-login-dialog" onSubmit={submitFields}>
      <Heading level={2} id={titleId}>
        {texts.fieldsTitle}
      </Heading>
      <Paragraph>{texts.fieldsIntro}</Paragraph>
      {errorMessage}
      {missingFields.map((key, index) => {
        const id = `${baseId}-${key}`;
        const autoFocus = index === 0;
        const label = fieldLabelFor(key, labels);
        const required = isFieldRequired(key);

        if (fieldTypeFor(key) === 'checkbox') {
          const linkLabel =
            key === 'privacyConsent' && privacy ? splitLinkLabel(label) : null;
          return (
            <FormField key={key} type="checkbox">
              <Checkbox
                id={id}
                name={key}
                autoFocus={autoFocus}
                required={required}
                aria-required={required ? 'true' : undefined}
                aria-describedby={describedBy}
              />
              <FormLabel htmlFor={id} type="checkbox">
                {linkLabel && privacy ? (
                  <>
                    {linkLabel.prefix}
                    <a
                      href={privacy.url}
                      target="_blank"
                      rel="noopener noreferrer">
                      {privacy.text} {texts.newTabHint}
                    </a>
                    {linkLabel.suffix}
                  </>
                ) : (
                  label
                )}
              </FormLabel>
            </FormField>
          );
        }

        return (
          <FormField key={key}>
            <Paragraph>
              <FormLabel htmlFor={id}>{label}</FormLabel>
            </Paragraph>
            <Textbox
              id={id}
              name={key}
              autoFocus={autoFocus}
              required={required}
              inputRequired={required}
              invalid={error === 'invalid_access_code' && key === 'accessCode'}
              aria-describedby={describedBy}
            />
          </FormField>
        );
      })}
      <Button type="submit" appearance="primary-action-button" disabled={busy}>
        {texts.fieldsSubmit}
      </Button>
    </form>
  );
}

export type LoginDialogProps = Omit<LoginDialogContentProps, 'titleId'> & {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function LoginDialog({
  open,
  onOpenChange,
  ...content
}: LoginDialogProps) {
  const titleId = useId();
  const wasOpen = useRef(false);
  const returnFocusTo = useRef<HTMLElement | null>(null);

  if (open && !wasOpen.current && typeof document !== 'undefined') {
    returnFocusTo.current = document.activeElement as HTMLElement | null;
  }
  wasOpen.current = open;

  useEffect(() => {
    if (open) return;
    const target = returnFocusTo.current;
    returnFocusTo.current = null;
    if (target && target.isConnected) {
      requestAnimationFrame(() => target.focus());
    }
  }, [open]);

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      aria-labelledby={titleId}
      className="osc-login-dialog-content">
      <LoginDialogContent titleId={titleId} {...content} />
    </Dialog>
  );
}
