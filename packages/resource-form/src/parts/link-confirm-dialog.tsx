import {
  Button,
  Dialog,
  DialogDescription,
  DialogTitle,
  SecondaryButton,
} from '@openstad-headless/ui/src/index.js';
import RteContent from '@openstad-headless/ui/src/rte-formatting/rte-content';
import {
  FormField,
  FormLabel,
  Paragraph,
  Textarea,
} from '@utrecht/component-library-react';
import React, { useEffect, useRef, useState } from 'react';

import './link-confirm-dialog.css';
import { type LinkValue, linkKey, splitAddedLinks } from './link-selection';

const MAX_MESSAGE_LENGTH = 1000;

type LinkConfirmDialogProps = {
  open: boolean;
  added: LinkValue[];
  removed: LinkValue[];
  title?: string;
  description?: string;
  messageLabel?: string;
  chosenHeading?: string;
  removedHeading?: string;
  ownHeading?: string;
  revokeTitle?: string;
  revokeDescription?: string;
  revokeConfirmText?: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: (messages: Record<string, string>) => void;
  onCancel: () => void;
};

export function LinkConfirmDialog({
  open,
  added,
  removed,
  title = 'Uitnodiging(en) versturen',
  description = 'Er zijn een of meer inzendingen gekozen om op deze pagina te tonen. Daarom gaat er een uitnodiging naar de eigenaar, om zeker te weten dat dat klopt. Na acceptatie wordt de koppeling getoond. De eigen inzending blijft van de auteur; niemand anders kan die bewerken of verwijderen. Op de accountpagina staat de status van de uitnodigingen.',
  messageLabel = 'schrijf een toelichting',
  chosenHeading = 'Gekozen:',
  removedHeading = 'Deze koppelingen worden ingetrokken:',
  ownHeading = 'Deze eigen inzendingen worden direct gekoppeld:',
  revokeTitle = 'Koppelingen intrekken',
  revokeDescription = 'De gekozen koppelingen worden verwijderd. De eigenaren van de andere inzendingen krijgen daarvan bericht.',
  revokeConfirmText = 'Bevestigen',
  confirmText = 'Versturen',
  cancelText = 'Annuleren',
  onConfirm,
  onCancel,
}: LinkConfirmDialogProps) {
  const [messages, setMessages] = useState<Record<string, string>>({});
  const [openMessages, setOpenMessages] = useState<Record<string, boolean>>({});
  const focusKey = useRef<string | null>(null);
  const textareas = useRef<Record<string, HTMLTextAreaElement | null>>({});
  const { others, own } = splitAddedLinks(added);
  const onlyRevoking = added.length === 0;

  useEffect(() => {
    if (open) {
      setMessages({});
      setOpenMessages({});
    }
  }, [open]);

  useEffect(() => {
    if (!focusKey.current) return;
    textareas.current[focusKey.current]?.focus();
    focusKey.current = null;
  }, [openMessages]);

  const toggleMessage = (key: string) => {
    const opening = !openMessages[key];
    if (opening) focusKey.current = key;
    setOpenMessages({ ...openMessages, [key]: opening });
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => !isOpen && onCancel()}
      className="osc-link-confirm-dialog">
      <div className="osc-link-confirm-dialog-body">
        <DialogTitle>{onlyRevoking ? revokeTitle : title}</DialogTitle>
        <DialogDescription>
          <RteContent
            content={onlyRevoking ? revokeDescription : description}
            unwrapSingleRootDiv={true}
          />
        </DialogDescription>

        {others.length > 0 ? (
          <>
            <Paragraph className="osc-link-confirm-heading">
              <strong>{chosenHeading}</strong>
            </Paragraph>
            <ul className="osc-link-confirm-list">
              {others.map((item) => {
                const key = linkKey(item);
                const textareaId = `osc-link-message-${key.replace(/[^a-z0-9-]/gi, '-')}`;
                const isOpen = !!openMessages[key];
                return (
                  <li key={key}>
                    <span className="osc-link-confirm-name">{item.label}</span>
                    <button
                      type="button"
                      className="osc-link-confirm-toggle"
                      aria-expanded={isOpen}
                      aria-controls={textareaId}
                      onClick={() => toggleMessage(key)}>
                      <i className="ri-pencil-fill" aria-hidden="true"></i>
                      {messageLabel}
                    </button>
                    {isOpen ? (
                      <FormField type="text" className="osc-link-confirm-field">
                        <Paragraph className="utrecht-form-field__label sr-only">
                          <FormLabel htmlFor={textareaId}>
                            {`${messageLabel}: ${item.label}`}
                          </FormLabel>
                        </Paragraph>
                        <div className="utrecht-form-field__input">
                          <Textarea
                            id={textareaId}
                            ref={(element: HTMLTextAreaElement | null) => {
                              textareas.current[key] = element;
                            }}
                            maxLength={MAX_MESSAGE_LENGTH}
                            value={messages[key] || ''}
                            onChange={(
                              event: React.ChangeEvent<HTMLTextAreaElement>
                            ) =>
                              setMessages({
                                ...messages,
                                [key]: event.target.value,
                              })
                            }
                          />
                        </div>
                      </FormField>
                    ) : null}
                  </li>
                );
              })}
            </ul>
          </>
        ) : null}

        {own.length > 0 ? (
          <>
            <Paragraph className="osc-link-confirm-heading">
              <strong>{ownHeading}</strong>
            </Paragraph>
            <ul className="osc-link-confirm-list">
              {own.map((item) => (
                <li key={linkKey(item)}>
                  <span className="osc-link-confirm-name">{item.label}</span>
                </li>
              ))}
            </ul>
          </>
        ) : null}

        {removed.length > 0 ? (
          <>
            <Paragraph className="osc-link-confirm-heading">
              <strong>{removedHeading}</strong>
            </Paragraph>
            <ul className="osc-link-confirm-list">
              {removed.map((item) => (
                <li key={linkKey(item)}>
                  <span className="osc-link-confirm-name">{item.label}</span>
                </li>
              ))}
            </ul>
          </>
        ) : null}

        <div className="osc-link-confirm-actions">
          <Button type="button" onClick={() => onConfirm(messages)}>
            {onlyRevoking ? revokeConfirmText : confirmText}
          </Button>
          <SecondaryButton type="button" onClick={onCancel}>
            {cancelText}
          </SecondaryButton>
        </div>
      </div>
    </Dialog>
  );
}
